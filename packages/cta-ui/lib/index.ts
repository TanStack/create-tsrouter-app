import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import cors from 'cors'
import chalk from 'chalk'
import multer from 'multer'

import {
  AddOnCompiledSchema,
  StarterCompiledSchema,
  handleSpecialURL,
} from '@tanstack/cta-engine'

import { ai, maxIterations, toStreamResponse } from '@tanstack/ai'
import { openaiText, openaiTranscription, openaiTTS } from '@tanstack/ai-openai'

import { selectAddOnsToolDef, unselectAddOnsToolDef } from './ai-tools.js'

import { addToAppWrapper } from './engine-handling/add-to-app-wrapper.js'
import { createAppWrapper } from './engine-handling/create-app-wrapper.js'
import { generateInitialPayload } from './engine-handling/generate-initial-payload.js'
import { setServerEnvironment } from './engine-handling/server-environment.js'

import type { ServerEnvironment } from './engine-handling/server-environment.js'
import type { Environment } from '@tanstack/cta-engine'

export function launchUI(
  options: Partial<ServerEnvironment> & {
    port?: number
    environmentFactory?: () => Environment
    webBase?: string
    showDeploymentOptions?: boolean
  },
) {
  const { port: requestedPort, webBase, ...rest } = options
  setServerEnvironment(rest)

  const app = express()

  app.use(cors())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Multer for file uploads (audio transcription)
  const upload = multer({ storage: multer.memoryStorage() })

  // Add headers required for WebContainer (SharedArrayBuffer support)
  app.use((req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp')
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin')
    next()
  })

  const packagePath = resolve(dirname(fileURLToPath(import.meta.url)), '..')

  const launchUI = !process.env.CTA_DISABLE_UI
  if (launchUI) {
    app.use(express.static(webBase || resolve(packagePath, 'dist')))
  }

  app.post('/api/add-to-app', async (req, res) => {
    await addToAppWrapper(req.body.addOns, {
      response: res,
      environmentFactory: options.environmentFactory,
    })
  })

  app.post('/api/create-app', async (req, res) => {
    await createAppWrapper(req.body.options, {
      response: res,
      environmentFactory: options.environmentFactory,
    })
  })

  app.post('/api/dry-run-add-to-app', async (req, res) => {
    try {
      res.send(
        await addToAppWrapper(req.body.addOns, {
          dryRun: true,
          environmentFactory: options.environmentFactory,
        }),
      )
    } catch {
      res.send({
        files: {},
        commands: [],
        deletedFiles: [],
      })
    }
  })

  app.post('/api/dry-run-create-app', async (req, res) => {
    try {
      res.send(
        await createAppWrapper(req.body.options, {
          dryRun: true,
          environmentFactory: options.environmentFactory,
        }),
      )
    } catch {
      res.send({
        files: {},
        commands: [],
        deletedFiles: [],
      })
    }
  })

  app.get('/api/initial-payload', async (_req, res) => {
    res.send(await generateInitialPayload())
  })

  app.get('/api/load-remote-add-on', async (req, res) => {
    const { url } = req.query
    if (!url) {
      res.status(400).send('URL is required')
      return
    }
    try {
      const fixedUrl = handleSpecialURL(url as string)
      const response = await fetch(fixedUrl)
      const data = await response.json()
      const parsed = AddOnCompiledSchema.safeParse(data)
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid add-on data' })
      } else {
        res.json({
          id: fixedUrl,
          name: parsed.data.name,
          description: parsed.data.description,
          version: parsed.data.version,
          author: parsed.data.author,
          license: parsed.data.license,
          link: parsed.data.link,
          smallLogo: parsed.data.smallLogo,
          logo: parsed.data.logo,
          type: parsed.data.type,
          modes: parsed.data.modes,
        })
      }
    } catch {
      res.status(500).send('Failed to load add-on')
    }
  })

  app.get('/api/load-starter', async (req, res) => {
    const { url } = req.query
    if (!url) {
      res.status(400).send('URL is required')
      return
    }
    try {
      const fixedUrl = handleSpecialURL(url as string)
      const response = await fetch(fixedUrl)
      const data = await response.json()
      const parsed = StarterCompiledSchema.safeParse(data)
      if (!parsed.success) {
        res.status(400).json({ error: 'Invalid starter data' })
      } else {
        res.json({
          url: fixedUrl,
          id: parsed.data.id,
          name: parsed.data.name,
          description: parsed.data.description,
          version: parsed.data.version,
          author: parsed.data.author,
          license: parsed.data.license,
          dependsOn: parsed.data.dependsOn,
          mode: parsed.data.mode,
          typescript: parsed.data.typescript,
          tailwind: parsed.data.tailwind,
          banner: parsed.data.banner
            ? fixedUrl.replace('starter.json', parsed.data.banner)
            : undefined,
        })
      }
    } catch {
      res.status(500).send('Failed to load starter')
    }
  })

  app.post('/api/shutdown', (_req, res) => {
    setTimeout(() => {
      process.exit(0)
    }, 50)
    res.send({ shutdown: true })
  })

  // AI Chat endpoint - only available if OPENAI_API_KEY is set
  app.get('/api/ai-enabled', (_req, res) => {
    const hasKey = !!process.env.OPENAI_API_KEY
    const keyPreview = process.env.OPENAI_API_KEY
      ? `${process.env.OPENAI_API_KEY.slice(0, 7)}...${process.env.OPENAI_API_KEY.slice(-4)}`
      : 'not set'
    console.log(
      `[AI] Checking if AI is enabled: ${hasKey} (key: ${keyPreview})`,
    )
    res.json({ enabled: hasKey })
  })

  // Transcription endpoint - convert audio to text
  app.post('/api/transcription', upload.single('audio'), async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
      res.status(403).json({ error: 'AI features are not available' })
      return
    }

    try {
      const audioFile = req.file
      const model = (req.body.model as string) || 'whisper-1'
      const language = req.body.language as string | undefined

      if (!audioFile) {
        res.status(400).json({ error: 'Audio file is required' })
        return
      }

      console.log('[AI] Transcription request received, model:', model)

      // Create a File object from the buffer
      const file = new File(
        [audioFile.buffer],
        audioFile.originalname || 'audio.webm',
        {
          type: audioFile.mimetype || 'audio/webm',
        },
      )

      const adapter = openaiTranscription()
      const result = (await ai({
        adapter: adapter as any,
        model: model as any,
        audio: file,
        language: language || undefined,
        responseFormat: 'verbose_json',
      })) as any

      console.log(
        '[AI] Transcription complete:',
        result.text?.slice(0, 50) + '...',
      )

      res.json({
        id: result.id,
        model: result.model,
        text: result.text,
        language: result.language,
        duration: result.duration,
        segments: result.segments,
        words: result.words,
      })
    } catch (error: any) {
      console.error('[AI] Transcription error:', error?.message)
      res.status(500).json({ error: error.message || 'Transcription failed' })
    }
  })

  // Text-to-Speech endpoint - convert text to audio
  app.post('/api/tts', async (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
      res.status(403).json({ error: 'AI features are not available' })
      return
    }

    try {
      const {
        text,
        voice = 'nova',
        model = 'tts-1',
        format = 'mp3',
        speed = 1.0,
      } = req.body

      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: 'Text is required' })
        return
      }

      console.log('[AI] TTS request received, voice:', voice, 'model:', model)

      const adapter = openaiTTS()
      const result = (await ai({
        adapter: adapter as any,
        model: model as any,
        text,
        voice,
        format,
        speed,
      })) as any

      console.log('[AI] TTS complete, format:', result.format)

      res.json({
        id: result.id,
        model: result.model,
        audio: result.audio,
        format: result.format,
        contentType: result.contentType,
        duration: result.duration,
      })
    } catch (error: any) {
      console.error('[AI] TTS error:', error?.message)
      res.status(500).json({ error: error.message || 'TTS failed' })
    }
  })

  app.post('/api/ai-chat', (req, res) => {
    if (!process.env.OPENAI_API_KEY) {
      res.status(403).json({ error: 'AI chat is not available' })
      return
    }

    const abortController = new AbortController()

    try {
      const { messages, addOns, data } = req.body

      // Get all add-ons from request (for system prompt)
      const allAddOns = addOns || data?.addOns || []
      console.log(
        '[AI Chat] Request received, add-ons in prompt:',
        allAddOns.length,
      )

      // Build add-ons reference section for system prompt
      let addOnsReference = ''
      if (allAddOns.length > 0) {
        addOnsReference = `

## AVAILABLE ADD-ONS

${allAddOns
  .map(
    (a: any) => `### ${a.name} (id: \`${a.id}\`)
- **Type**: ${a.type}
- **Description**: ${a.aiDescription || a.description}`,
  )
  .join('\n\n')}`
      }

      const SYSTEM_PROMPT = `You are a helpful AI assistant for TanStack Create App, a tool that helps developers scaffold new applications with various add-ons and configurations.

Your role is to help users configure their application by selecting the right add-ons based on their requirements. You have access to the following tools:

1. **selectAddOns** - Select/enable add-ons by their IDs
2. **unselectAddOns** - Unselect/disable add-ons by their IDs

WORKFLOW:
1. Review the AVAILABLE ADD-ONS section below to understand what's available
2. Based on the user's requirements, suggest appropriate add-ons
3. When the user confirms, use selectAddOns or unselectAddOns to make changes
4. The tools will report which add-ons were successfully changed

IMPORTANT:
- Be helpful and explain the purpose of each add-on you recommend
- If an add-on can't be selected (not available or already selected), the tool will let you know
- Be concise but friendly in your responses

Common add-on categories:
- **Toolchain**: Build tools and development setup (e.g., Biome, ESLint)
- **Add-on**: Feature add-ons like authentication, API integrations, state management
- **Deployment**: Deployment adapters for various platforms (e.g., Vercel, Netlify, Cloudflare)
- **Example**: Example code and templates${addOnsReference}`

      console.log('[AI Chat] System prompt:\n', SYSTEM_PROMPT)

      const stream = ai({
        adapter: openaiText(),
        model: 'gpt-4o',
        tools: [selectAddOnsToolDef, unselectAddOnsToolDef],
        systemPrompts: [SYSTEM_PROMPT],
        agentLoopStrategy: maxIterations(10),
        messages,
        abortController,
      })

      // Handle the stream response
      const streamResponse = toStreamResponse(stream as AsyncIterable<any>, {
        abortController,
      })

      // Set headers from the stream response
      res.setHeader('Content-Type', 'text/event-stream')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Pipe the stream body to the response
      if (streamResponse.body) {
        const reader = streamResponse.body.getReader()
        const pump = async () => {
          try {
            while (true) {
              const { done, value } = await reader.read()
              if (done) {
                res.end()
                break
              }
              res.write(value)
            }
          } catch (error: any) {
            if (error.name !== 'AbortError') {
              console.error('[AI Chat] Stream error:', error?.message)
            }
            res.end()
          }
        }
        pump()
      } else {
        res.status(500).json({ error: 'Failed to create stream' })
      }
    } catch (error: any) {
      console.error('[AI Chat] Error:', error?.message)
      if (error.name === 'AbortError' || abortController.signal.aborted) {
        res.status(499).end()
        return
      }
      res.status(500).json({ error: error.message || 'An error occurred' })
    }
  })

  const port = requestedPort || process.env.PORT || 8080
  app.listen(port, () => {
    console.log(
      `🔥 ${chalk.blueBright(`Create TanStack ${launchUI ? 'App' : 'API'}`)} is running on ${chalk.underline(
        `http://localhost:${port}`,
      )}`,
    )
  })
}
