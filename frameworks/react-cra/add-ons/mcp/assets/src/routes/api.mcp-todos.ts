import { createFileRoute } from '@tanstack/react-router'

import { addTodo, getTodos, subscribeToTodos } from '@/mcp-todos'

export const Route = createFileRoute('/api/mcp-todos')({
  server: {
    handlers: {
      GET: () => {
        const stream = new ReadableStream({
          start(controller) {
            setInterval(() => {
              controller.enqueue(`event: ping\n\n`)
            }, 1000)
            const unsubscribe = subscribeToTodos((todos) => {
              controller.enqueue(`data: ${JSON.stringify(todos)}\n\n`)
            })
            const todos = getTodos()
            controller.enqueue(`data: ${JSON.stringify(todos)}\n\n`)
            return () => unsubscribe()
          },
        })
        return new Response(stream, {
          headers: { 'Content-Type': 'text/event-stream' },
        })
      },
      POST: async ({ request }) => {
        const { title } = await request.json()
        addTodo(title)
        return Response.json(getTodos())
      },
    },
  },
})
