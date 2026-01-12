import {
  fetchServerSentEvents,
  useChat,
  createChatClientOptions,
} from '@tanstack/ai-react'
import type { InferChatMessages } from '@tanstack/ai-react'

// Default chat options for type inference
const defaultChatOptions = createChatClientOptions({
  connection: fetchServerSentEvents('/api/resume-chat'),
})

export type ResumeChatMessages = InferChatMessages<typeof defaultChatOptions>

export const useResumeChat = () => {
  const chatOptions = createChatClientOptions({
    connection: fetchServerSentEvents('/api/resume-chat'),
  })

  return useChat(chatOptions)
}
