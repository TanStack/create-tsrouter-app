import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
import { createFileRoute } from '@tanstack/react-router'
import { transports, server } from '@/utils/demo.sse'

export const Route = createFileRoute('/api/sse')({
  server: {
    handlers: {
      // @ts-ignore
      GET: async ({}) => {
        let body = ''
        let headers: Record<string, string> = {}
        let statusCode = 200
        const resp = {
          on: (event: string, callback: () => void) => {
            if (event === 'close') {
              callback()
            }
          },
          writeHead: (statusCode: number, headers: Record<string, string>) => {
            headers = headers
            statusCode = statusCode
          },
          write: (data: string) => {
            body += data + '\n'
          },
        }
        const transport = new SSEServerTransport('/api/messages', resp as any)
        transports[transport.sessionId] = transport
        transport.onerror = (error) => {
          console.error(error)
        }
        resp.on('close', () => {
          delete transports[transport.sessionId]
        })
        await server.connect(transport)
        const response = new Response(body, {
          status: statusCode,
          headers: headers,
        })
        return response
      },
    },
  },
})
