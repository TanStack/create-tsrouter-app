import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from '@tanstack/ai-react'
import type { InferChatMessages } from '@tanstack/ai-react'

// Default chat options for type inference
const defaultChatOptions = createChatClientOptions({
  connection: fetchServerSentEvents('/api/remy-chat'),
})

export type ConferenceChatMessages = InferChatMessages<typeof defaultChatOptions>

export const useConferenceChat = (speakerSlug?: string, talkSlug?: string) => {
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents('/api/remy-chat', {
      body: {
        speakerSlug,
        talkSlug,
      },
    }),
  })

  return useChat(chatOptions)
}
