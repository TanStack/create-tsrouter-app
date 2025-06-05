// do same for listTanStackReactAddOns and listTanStackSolidAddOns
// remove the react and solid variants

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import express from 'express'
import { z } from 'zod'

import {
  createApp,
  createDefaultEnvironment,
  finalizeAddOns,
  getFrameworkById,
  getFrameworkByName,
  getFrameworks,
} from '@tanstack/cta-engine'

function createServer({
  appName,
  forcedAddOns = [],
}: {
  appName?: string
  forcedAddOns?: Array<string>
  name?: string
}) {
  const server = new McpServer({
    name: `${appName} Application Builder`,
    version: '1.0.0',
  })

  const frameworks = getFrameworks();
  const frameworkNames = frameworks.map((framework) => framework.name);

  server.tool(
    'listTanStackAddOns',
    'List the available add-ons for creating TanStack applications',
    {
      framework: z.string().describe(`The framework to use. Available frameworks: ${frameworkNames.join(', ')}`),
    },
    ({ framework: frameworkName }) => {
      const framework = getFrameworkByName(frameworkName)!
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              framework
                .getAddOns()
                .filter((addOn) => addOn.modes.includes('file-router'))
                .map((addOn) => ({
                  id: addOn.id,
                  description: addOn.description,
                })),
            ),
          },
        ],
      }
    },
  )

  server.tool(
    'createTanStackApplication',
    'Create a new TanStack application',
    {
      framework: z.string().describe(`The framework to use. Available frameworks: ${frameworkNames.join(', ')}`),
      projectName: z
        .string()
        .describe(
          'The package.json module name of the application (will also be the directory name)',
        ),
      cwd: z.string().describe('The directory to create the application in'),
      addOns: z.array(z.string()).describe('The IDs of the add-ons to install'),
      targetDir: z
        .string()
        .describe(
          'The directory to create the application in. Use the absolute path of the directory you want the application to be created in',
        ),
    },
    async ({ framework:frameworkName, projectName, addOns, cwd, targetDir }) => {
      const framework = getFrameworkByName(frameworkName)!
      try {
        process.chdir(cwd)
        try {
          const chosenAddOns = await finalizeAddOns(
            framework,
            'file-router',
            Array.from(
              new Set([
                ...(addOns as unknown as Array<string>),
                ...forcedAddOns,
              ]),
            ),
          )
          await createApp(createDefaultEnvironment(), {
            projectName: projectName.replace(/^\//, './'),
            targetDir,
            framework,
            typescript: true,
            tailwind: true,
            packageManager: 'pnpm',
            mode: 'file-router',
            chosenAddOns,
            git: true,
          })
        } catch (error) {
          console.error(error)
          return {
            content: [
              { type: 'text', text: `Error creating application: ${error}` },
            ],
          }
        }
        return {
          content: [{ type: 'text', text: 'Application created successfully' }],
        }
      } catch (error) {
        return {
          content: [
            { type: 'text', text: `Error creating application: ${error}` },
          ],
        }
      }
    },
  )

  return server
}

export async function runMCPServer(
  sse: boolean,
  {
    forcedAddOns,
    appName,
    name,
  }: {
    forcedMode?: string
    forcedAddOns?: Array<string>
    appName?: string
    name?: string
  },
) {
  let transport: SSEServerTransport | null = null

  const server = createServer({ appName, forcedAddOns, name })
  if (sse) {
    const app = express()

    app.get('/sse', (req, res) => {
      transport = new SSEServerTransport('/messages', res)
      server.connect(transport)
    })

    app.post('/messages', (req, res) => {
      if (transport) {
        transport.handlePostMessage(req, res)
      }
    })

    const port = process.env.PORT || 8080
    app.listen(port, () => {
      console.log(`Server is running on port http://localhost:${port}/sse`)
    })
  } else {
    const transport = new StdioServerTransport()
    await server.connect(transport)
  }
}
