import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import express from 'express'
import { z } from 'zod'

import { createApp } from './create-app.js'
import { finalizeAddOns } from './add-ons.js'

const server = new McpServer({
  name: 'Demo',
  version: '1.0.0',
})

const tanStackReactAddOns = [
  {
    id: 'clerk',
    description: 'Enable authentication with Clerk',
  },
  {
    id: 'convex',
    description: 'Enable a database using Convex',
  },
  {
    id: 'form',
    description: 'Form handling library',
  },
  {
    id: 'netlify',
    description: 'Enable deployments to Netlify',
  },
  {
    id: 'sentry',
    description: 'Enable Sentry error tracking',
  },
  {
    id: 'shadcn',
    description: 'Enable integration of the Shadcn UI component library',
  },
  {
    id: 'start',
    description:
      'Set this if you want a TanStack Start application that supports server functions or APIs',
  },
  {
    id: 'tanstack-query',
    description: 'Enable TanStack Query for data fetching',
  },
  {
    id: 'store',
    description: 'Enable the TanStack Store state management library',
  },
]

server.tool('listTanStackReactAddOns', {}, () => {
  return {
    content: [{ type: 'text', text: JSON.stringify(tanStackReactAddOns) }],
  }
})

server.tool(
  'createTanStackReactApplication',
  {
    projectName: z
      .string()
      .describe(
        'The package.json module name of the application (will also be the directory name)',
      ),
    cwd: z.string().describe('The directory to create the application in'),
    addOns: z
      .array(
        z.enum([
          'clerk',
          'convex',
          'form',
          'netlify',
          'sentry',
          'shadcn',
          'start',
          'store',
          'tanstack-query',
        ]),
      )
      .describe('The IDs of the add-ons to install'),
  },
  async ({ projectName, addOns, cwd }) => {
    try {
      process.chdir(cwd)
      const chosenAddOns = await finalizeAddOns(
        'react',
        'file-router',
        addOns as unknown as Array<string>,
      )
      await createApp(
        {
          projectName: projectName.replace(/^\//, './'),
          framework: 'react',
          typescript: true,
          tailwind: true,
          packageManager: 'pnpm',
          toolchain: 'none',
          mode: 'file-router',
          addOns: true,
          chosenAddOns,
          git: true,
          variableValues: {},
        },
        {
          silent: true,
        },
      )
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

const tanStackSolidAddOns = [
  {
    id: 'solid-ui',
    description: 'Enable integration of the Solid UI component library',
  },
  {
    id: 'form',
    description: 'Form handling library',
  },
  {
    id: 'sentry',
    description: 'Enable Sentry error tracking',
  },
  {
    id: 'store',
    description: 'Enable the TanStack Store state management library',
  },
  {
    id: 'tanstack-query',
    description: 'Enable TanStack Query for data fetching',
  },
]

server.tool('listTanStackSolidAddOns', {}, () => {
  return {
    content: [{ type: 'text', text: JSON.stringify(tanStackSolidAddOns) }],
  }
})

server.tool(
  'createTanStackSolidApplication',
  {
    projectName: z
      .string()
      .describe(
        'The package.json module name of the application (will also be the directory name)',
      ),
    cwd: z.string().describe('The directory to create the application in'),
    addOns: z
      .array(z.enum(['solid-ui', 'form', 'sentry', 'store', 'tanstack-query']))
      .describe('The IDs of the add-ons to install'),
  },
  async ({ projectName, addOns, cwd }) => {
    try {
      process.chdir(cwd)
      const chosenAddOns = await finalizeAddOns(
        'solid',
        'file-router',
        addOns as unknown as Array<string>,
      )
      await createApp(
        {
          projectName: projectName.replace(/^\//, './'),
          framework: 'solid',
          typescript: true,
          tailwind: true,
          packageManager: 'pnpm',
          toolchain: 'none',
          mode: 'file-router',
          addOns: true,
          chosenAddOns,
          git: true,
          variableValues: {},
        },
        {
          silent: true,
        },
      )
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

export default async function runServer(sse: boolean) {
  if (sse) {
    const app = express()

    let transport: SSEServerTransport | null = null

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
