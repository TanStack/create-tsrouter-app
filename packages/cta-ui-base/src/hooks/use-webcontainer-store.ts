import { WebContainer } from '@webcontainer/api'
import type { FileSystemTree, WebContainerProcess } from '@webcontainer/api'
import { createStore } from 'zustand'
import shimALS from '../lib/als-shim'

export type SetupStep =
  | 'mounting'
  | 'installing'
  | 'starting'
  | 'ready'
  | 'error'

console.log('>>> startup')

type WebContainerStore = {
  webContainer: Promise<WebContainer> | null
  ready: boolean
  setupStep: SetupStep
  statusMessage: string
  terminalOutput: string[]
  previewUrl: string | null
  error: string | null
  devProcess: WebContainerProcess | null
  projectFiles: Array<{ path: string; content: string }>
  isInstalling: boolean

  teardown: () => void
  updateProjectFiles: (
    projectFiles: Array<{ path: string; content: string }>,
  ) => Promise<void>

  startDevServer: () => Promise<void>
  addTerminalOutput: (output: string) => void
  installDependencies: () => Promise<void>
  setTerminalOutput: (output: string[]) => void
}

const processTerminalLine = (data: string): string => {
  // Clean up terminal output - remove ANSI codes and control characters
  let cleaned = data

  // Remove all ANSI escape sequences (comprehensive)
  cleaned = cleaned.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '') // Standard ANSI sequences
  cleaned = cleaned.replace(/\u001b\][0-9;]*;[^\u0007]*\u0007/g, '') // OSC sequences
  cleaned = cleaned.replace(/\u001b[=>]/g, '') // Other escape codes

  // Remove carriage returns and other control characters
  cleaned = cleaned.replace(/\r/g, '')
  cleaned = cleaned.replace(
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/g,
    '',
  )

  // Remove spinner characters and progress bar artifacts
  cleaned = cleaned.replace(/[⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏]/g, '')
  cleaned = cleaned.replace(/[▀▁▂▃▄▅▆▇█▉▊▋▌▍▎▏]/g, '')
  cleaned = cleaned.replace(/[░▒▓]/g, '')

  // Trim excessive whitespace
  cleaned = cleaned.trim()

  // Only return non-empty lines
  return cleaned.length > 0 ? cleaned : ''
}

let webContainer: Promise<WebContainer> | null = null

export default function createWebContainerStore(shouldShimALS: boolean) {
  if (!webContainer) {
    webContainer = WebContainer.boot()
  }

  const store = createStore<WebContainerStore>((set, get) => ({
    webContainer,
    ready: false,
    setupStep: 'mounting',
    statusMessage: '',
    terminalOutput: [],
    previewUrl: null,
    error: null,
    devProcess: null,
    projectFiles: [],
    isInstalling: false,

    teardown: () => {
      set({ webContainer: null, ready: false })
    },
    addTerminalOutput: (output: string) => {
      set(({ terminalOutput }) => ({
        terminalOutput: [...terminalOutput, output],
      }))
    },
    setTerminalOutput: (output: string[]) => {
      set({ terminalOutput: output })
    },
    startDevServer: async () => {
      const { devProcess, webContainer, addTerminalOutput } = get()
      if (!webContainer) {
        throw new Error('WebContainer not found')
      }

      try {
        const container = await webContainer
        if (!container) {
          throw new Error('WebContainer not found')
        }
        if (devProcess) {
          console.log('Killing existing dev process...')
          devProcess.kill()
          set({ devProcess: null })
        }

        set({
          setupStep: 'starting',
          statusMessage: 'Starting development server...',
        })
        addTerminalOutput('🚀 Starting dev server...')

        // Wait for server to be ready (set up listener first)
        container.on('server-ready', (port, url) => {
          console.log('Server ready on port', port, 'at', url)
          const currentState = get()
          set({
            previewUrl: url,
            setupStep: 'ready',
            statusMessage: 'Development server running',
            terminalOutput: [
              ...currentState.terminalOutput,
              `✅ Server ready at ${url}`,
            ],
          })
        })

        // Start the dev server
        const newDevProcess = await container.spawn('pnpm', ['dev'])
        set({ devProcess: newDevProcess })

        newDevProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              const cleaned = processTerminalLine(data)
              if (cleaned && cleaned.length > 3) {
                console.log('[DEV]', cleaned)
                const currentState = get()
                set({
                  terminalOutput: [...currentState.terminalOutput, cleaned],
                })
              }
            },
          }),
        )

        // Check exit code
        const exitCode = await newDevProcess.exit
        if (exitCode !== 0) {
          addTerminalOutput(`❌ Dev server exited with code ${exitCode}`)
          set({ error: `Dev server exited with code ${exitCode}` })
        }
      } catch (error) {
        console.error('Dev server start error:', error)
        addTerminalOutput(`❌ Dev server error: ${(error as Error).message}`)
        set({ error: (error as Error).message, setupStep: 'error' })
      }
    },
    updateProjectFiles: async (
      projectFiles: Array<{ path: string; content: string }>,
    ) => {
      console.log('Updating project files...', projectFiles.length, 'files')
      const {
        projectFiles: originalProjectFiles,
        addTerminalOutput,
        installDependencies,
        webContainer,
      } = get()

      if (!webContainer) {
        console.error('WebContainer not found in updateProjectFiles')
        throw new Error('WebContainer not found')
      }

      try {
        const container = await webContainer
        if (!container) {
          console.error('WebContainer resolved to null')
          throw new Error('WebContainer not found')
        }
        console.log('WebContainer booted successfully!', container)
      } catch (error) {
        console.error('WebContainer boot failed:', error)
        set({
          error: `WebContainer boot failed: ${(error as Error).message}`,
          setupStep: 'error',
        })
        throw error
      }

      const container = await webContainer

      let packageJSONChanged = false
      const binaryFiles: Record<string, Uint8Array> = {}
      if (originalProjectFiles.length === 0) {
        const fileSystemTree: FileSystemTree = {}
        let base64FileCount = 0

        for (const { path, content } of projectFiles) {
          const cleanPath = path.replace(/^\.?\//, '')
          const pathParts = cleanPath.split('/')

          let current: any = fileSystemTree
          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i]
            if (!current[part]) {
              current[part] = { directory: {} }
            }
            current = current[part].directory
          }

          const fileName = pathParts[pathParts.length - 1]

          const adjustedContent = shouldShimALS
            ? shimALS(fileName, content)
            : content

          if (adjustedContent.startsWith('base64::')) {
            base64FileCount++
            const base64Content = adjustedContent.replace('base64::', '')

            try {
              const base64Cleaned = base64Content.replace(/\s/g, '')
              const binaryString = atob(base64Cleaned)
              const bytes = new Uint8Array(binaryString.length)
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i) & 0xff
              }
              binaryFiles[cleanPath] = bytes
            } catch (error) {
              console.error(
                `[BINARY ERROR] Failed to convert ${cleanPath}:`,
                error,
              )
            }
          } else {
            current[fileName] = {
              file: {
                contents: String(adjustedContent),
              },
            }
          }
        }

        await container.mount(fileSystemTree)
        for (const [path, bytes] of Object.entries(binaryFiles)) {
          await container.fs.writeFile(path, bytes)
        }
        addTerminalOutput(
          `📁 Files mounted successfully (${base64FileCount} binary files)`,
        )
        packageJSONChanged = true
      } else {
        const originalMap = new Map<string, string>()
        for (const { path, content } of originalProjectFiles) {
          originalMap.set(path, content)
        }
        const newMap = new Map<string, string>()
        for (const { path, content } of projectFiles) {
          newMap.set(path, content)
        }

        const changedOrNewFiles: Array<{ path: string; content: string }> = []
        for (const { path, content } of projectFiles) {
          if (!originalMap.has(path)) {
            changedOrNewFiles.push({ path, content })
          } else if (originalMap.get(path) !== content) {
            changedOrNewFiles.push({ path, content })
          }
        }

        const deletedFiles: string[] = []
        for (const { path } of originalProjectFiles) {
          if (!newMap.has(path)) {
            deletedFiles.push(path)
          }
        }

        if (changedOrNewFiles.length > 0 || deletedFiles.length > 0) {
          // Kill dev server before updating files to avoid HMR issues
          const { devProcess } = get()
          if (devProcess) {
            console.log('Stopping dev server before file update...')
            addTerminalOutput(
              '⏸️  Stopping dev server before updating files...',
            )
            devProcess.kill()
            set({ devProcess: null, previewUrl: null })
          }

          for (const { path, content } of changedOrNewFiles) {
            await container.fs.writeFile(path, content)
          }

          for (const path of deletedFiles) {
            await container.fs.rm(path)
          }

          addTerminalOutput('📁 Files updated successfully')

          if (changedOrNewFiles.some(({ path }) => path === './package.json')) {
            packageJSONChanged = true
          }
        }
      }

      set({ projectFiles })

      if (packageJSONChanged) {
        addTerminalOutput(
          '📦 Package.json changed, reinstalling dependencies...',
        )
        await installDependencies()
      }
    },
    installDependencies: async () => {
      const { webContainer, addTerminalOutput, startDevServer, isInstalling } =
        get()

      if (isInstalling) {
        console.log('Install already in progress, skipping')
        return
      }

      if (!webContainer) {
        throw new Error('WebContainer not found')
      }

      set({ isInstalling: true })

      try {
        const container = await webContainer
        if (!container) {
          set({ isInstalling: false })
          throw new Error('WebContainer not found')
        }

        set({
          setupStep: 'installing',
          statusMessage: 'Installing dependencies...',
        })

        console.log('Starting pnpm install...')
        addTerminalOutput('📦 Running pnpm install...')
        addTerminalOutput('⏳ This may take a minute...')

        let installProcess
        try {
          installProcess = await container.spawn('pnpm', ['install'])
          console.log('pnpm install process spawned successfully')
        } catch (spawnError) {
          console.error('Failed to spawn pnpm install:', spawnError)
          throw spawnError
        }

        let outputCount = 0
        let lastProgressUpdate = Date.now()
        let allOutput: string[] = []
        let progressInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - lastProgressUpdate) / 1000)
          console.log(
            `[INSTALL] Still running... (${elapsed}s, ${outputCount} output chunks)`,
          )
        }, 5000)

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              outputCount++
              allOutput.push(data)

              const cleaned = processTerminalLine(data)

              // Show meaningful output immediately
              if (cleaned && cleaned.length > 3) {
                const isImportant =
                  cleaned.includes('added') ||
                  cleaned.includes('removed') ||
                  cleaned.includes('changed') ||
                  cleaned.includes('audited') ||
                  cleaned.includes('packages') ||
                  cleaned.includes('error') ||
                  cleaned.includes('warn') ||
                  cleaned.includes('ERR') ||
                  cleaned.includes('FAIL')

                if (isImportant) {
                  console.log('[INSTALL]', cleaned)
                  addTerminalOutput(cleaned)
                  if (isImportant && progressInterval) {
                    clearInterval(progressInterval)
                    progressInterval = undefined as any
                  }
                }
              }
            },
          }),
        )

        console.log('Waiting for install to complete...')
        const installExitCode = await installProcess.exit
        if (progressInterval) clearInterval(progressInterval)
        console.log('Install exit code:', installExitCode)
        console.log('Total output lines:', outputCount)

        if (installExitCode !== 0) {
          // Show all output for debugging
          console.error('[INSTALL ERROR] All output:', allOutput.join('\n'))
          const errorMsg = `pnpm install failed with exit code ${installExitCode}`
          addTerminalOutput(`❌ ${errorMsg}`)
          addTerminalOutput('💡 Check console for detailed error output')
          set({ error: errorMsg, setupStep: 'error' })
          throw new Error(errorMsg)
        }

        addTerminalOutput('✅ Dependencies installed successfully')

        await startDevServer()
      } catch (error) {
        console.error('Install error:', error)
        addTerminalOutput(`❌ Install error: ${(error as Error).message}`)
        set({ error: (error as Error).message, setupStep: 'error' })
        throw error
      } finally {
        set({ isInstalling: false })
      }
    },
  }))

  return store
}
