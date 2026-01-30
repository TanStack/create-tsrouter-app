import { useCallback, useState, useEffect } from 'react'
import { createFileRoute } from '@tanstack/react-router'

type Todo = {
  id: number
  title: string
}

export const Route = createFileRoute('/demo/mcp-todos')({
  component: ORPCTodos,
})

function ORPCTodos() {
  const [todos, setTodos] = useState<Todo[]>([])

  useEffect(() => {
    const eventSource = new EventSource('/demo/api/mcp-todos')
    eventSource.onmessage = (event) => {
      setTodos(JSON.parse(event.data))
    }
    return () => eventSource.close()
  }, [])

  const [todo, setTodo] = useState('')

  const submitTodo = useCallback(async () => {
    await fetch('/demo/api/mcp-todos', {
      method: 'POST',
      body: JSON.stringify({ title: todo }),
    })
    setTodo('')
  }, [todo])

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-200 to-emerald-900 p-4 text-white"
      style={{
        backgroundImage:
          'radial-gradient(70% 70% at 20% 20%, #07A798 0%, #045C4B 60%, #01251F 100%)',
      }}
    >
      <div className="w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10">
        <h1 className="text-2xl mb-4">MCP Todos list</h1>
        <ul className="mb-4 space-y-2">
          {todos?.map((t) => (
            <li
              key={t.id}
              className="bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md"
            >
              <span className="text-lg text-white">{t.title}</span>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                submitTodo()
              }
            }}
            placeholder="Enter a new todo..."
            className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            disabled={todo.trim().length === 0}
            onClick={submitTodo}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Add todo
          </button>
        </div>
      </div>
    </div>
  )
}
