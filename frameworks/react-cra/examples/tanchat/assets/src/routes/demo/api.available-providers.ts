import { createFileRoute } from '@tanstack/react-router'
import type { Provider } from '@/lib/model-selection'

export const Route = createFileRoute('/demo/api/available-providers')({
  server: {
    handlers: {
      GET: async () => {
        const available: Provider[] = []

        if (process.env.OPENAI_API_KEY) {
          available.push('openai')
        }
        if (process.env.ANTHROPIC_API_KEY) {
          available.push('anthropic')
        }
        if (process.env.GEMINI_API_KEY) {
          available.push('gemini')
        }
        // Ollama is always available (local, no key needed)
        available.push('ollama')

        return new Response(
          JSON.stringify({
            providers: available,
            hasOpenAI: available.includes('openai'),
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
        )
      },
    },
  },
})
