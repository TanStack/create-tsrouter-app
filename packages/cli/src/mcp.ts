import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import express from 'express'
import { z } from 'zod'

import {
  createApp,
  createDefaultEnvironment,
  finalizeAddOns,
  getFrameworkByName,
  getFrameworks,
  populateAddOnOptionsDefaults,
} from '@tanstack/create'

import { registerDocTools } from './mcp/tools.js'

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

  const frameworks = getFrameworks()
  const frameworkNames = frameworks.map((framework) => framework.name)

  server.tool(
    'listTanStackAddOns',
    'List the available add-ons for creating TanStack applications',
    {
      framework: z
        .string()
        .describe(
          `The framework to use. Available frameworks: ${frameworkNames.join(', ')}`,
        ),
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
                  name: addOn.name,
                  description: addOn.description,
                  options: addOn.options,
                  dependsOn: addOn.dependsOn,
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
      framework: z
        .string()
        .describe(
          `The framework to use. Available frameworks: ${frameworkNames.join(', ')}`,
        ),
      projectName: z
        .string()
        .describe(
          'The package.json module name of the application (will also be the directory name)',
        ),
      cwd: z.string().describe('The directory to create the application in'),
      addOns: z.array(z.string()).describe('Array of add-on IDs to install. Use listTanStackAddOns tool to see available add-ons and their configuration options. Example: ["prisma", "shadcn", "tanstack-query"]'),
      addOnOptions: z.record(z.record(z.any())).optional().describe('Configuration options for add-ons. Format: {"addOnId": {"optionName": "value"}}. Use listTanStackAddOns to see available options for each add-on.'),
      targetDir: z
        .string()
        .describe(
          'The directory to create the application in. Use the absolute path of the directory you want the application to be created in',
        ),
    },
    async ({
      framework: frameworkName,
      projectName,
      addOns,
      addOnOptions,
      cwd,
      targetDir,
    }) => {
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
            addOnOptions: addOnOptions || populateAddOnOptionsDefaults(chosenAddOns),
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

  // Register doc/ecosystem tools from TanStack API
  registerDocTools(server)

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
