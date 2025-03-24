import { createServerFn } from '@tanstack/react-start'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'

import getTools from './demo.tools'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const SYSTEM_PROMPT = `You are a helpful assistant for a store that sells guitars.

You can use the following tools to help the user:

- getGuitars: Get all guitars from the database
- recommendGuitar: Recommend a guitar to the user
`

export const genAIResponse = createServerFn({ method: 'POST', response: 'raw' })
  .validator(
    (d: {
      messages: Array<Message>
      systemPrompt?: { value: string; enabled: boolean }
    }) => d,
  )
  .handler(async ({ data }) => {
    const messages = data.messages
      .filter(
        (msg) =>
          msg.content.trim() !== '' &&
          !msg.content.startsWith('Sorry, I encountered an error'),
      )
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }))

    const tools = await getTools()

    try {
      const result = streamText({
        model: anthropic('claude-3-5-sonnet-latest'),
        messages,
        system: SYSTEM_PROMPT,
        maxSteps: 10,
        tools,
      })

      return result.toDataStreamResponse()
    } catch (error) {
      console.error('Error in genAIResponse:', error)
      if (error instanceof Error && error.message.includes('rate limit')) {
        return { error: 'Rate limit exceeded. Please try again in a moment.' }
      }
      return {
        error:
          error instanceof Error ? error.message : 'Failed to get AI response',
      }
    }
  })
