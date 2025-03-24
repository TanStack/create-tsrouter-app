import { experimental_createMCPClient, tool } from 'ai'
//import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { z } from 'zod'
import guitars from '../data/example-guitars'

// Example of using an SSE MCP server
// const mcpClient = await experimental_createMCPClient({
//   transport: {
//     type: "sse",
//     url: "http://localhost:8081/sse",
//   },
//   name: "Demo Service",
// });

// Example of using an STDIO MCP server
// const mcpClient = await experimental_createMCPClient({
//   transport: new StdioClientTransport({
//     command: "node",
//     args: [
//       "stdio-server.js",
//     ],
//   }),
// });

const getGuitars = tool({
  description: 'Get all products from the database',
  parameters: z.object({}),
  execute: async () => {
    return Promise.resolve(guitars)
  },
})

const recommendGuitar = tool({
  description: 'Use this tool to recommend a guitar to the user',
  parameters: z.object({
    id: z.string().describe('The id of the guitar to recommend'),
  }),
})

export default async function getTools() {
  // const mcpTools = await mcpCient.tools()
  return {
    // ...mcpTools,
    getGuitars,
    recommendGuitar,
  }
}
