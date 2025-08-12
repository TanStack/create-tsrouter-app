import { useEffect, useRef, useState } from 'react'
import { useStore } from '@tanstack/react-store'
import { Send, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'

import { showAIAssistant } from '../store/example-assistant'
import GuitarRecommendation from './example-GuitarRecommendation'

import type { UIMessage } from 'ai'

function Messages({ messages }: { messages: Array<UIMessage> }) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Ask me anything! I'm here to help.
      </div>
    )
  }

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto">
      {messages.map(({ id, role, parts }) => (
        <div
          key={id}
          className={`py-3 ${
            role === 'assistant'
              ? 'bg-gradient-to-r from-orange-500/5 to-red-600/5'
              : 'bg-transparent'
          }`}
        >
          {parts.map((part) => {
            if (part.type === 'text') {
              return (
                <div className="flex items-start gap-2 px-4">
                  {role === 'assistant' ? (
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                      AI
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-medium text-white flex-shrink-0">
                      Y
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <ReactMarkdown
                      className="prose dark:prose-invert max-w-none prose-sm"
                      rehypePlugins={[
                        rehypeRaw,
                        rehypeSanitize,
                        rehypeHighlight,
                        remarkGfm,
                      ]}
                    >
                      {part.text}
                    </ReactMarkdown>
                  </div>
                </div>
              )
            }
            if (
              part.type === 'tool-recommendGuitar' &&
              part.state === 'output-available' &&
              (part.output as { id: string })?.id
            ) {
              return (
                <div key={id} className="max-w-[80%] mx-auto">
                  <GuitarRecommendation
                    id={(part.output as { id: string })?.id}
                  />
                </div>
              )
            }
          })}
        </div>
      ))}
    </div>
  )
}

export default function AIAssistant() {
  const isOpen = useStore(showAIAssistant)
  const { messages, sendMessage } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/demo-chat',
    }),
  })
  const [input, setInput] = useState('')

  return (
    <div className="relative z-50">
      <button
        onClick={() => showAIAssistant.setState((state) => !state)}
        className="flex items-center gap-2 px-3 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 text-white hover:opacity-90 transition-opacity"
      >
        <div className="w-5 h-5 rounded-lg bg-white/20 flex items-center justify-center text-xs font-medium">
          AI
        </div>
        AI Assistant
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-[700px] h-[600px] bg-gray-900 rounded-lg shadow-xl border border-orange-500/20 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b border-orange-500/20">
            <h3 className="font-semibold text-white">AI Assistant</h3>
            <button
              onClick={() => showAIAssistant.setState((state) => !state)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <Messages messages={messages} />

          <div className="p-3 border-t border-orange-500/20">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage({ text: input })
                setInput('')
              }}
            >
              <div className="relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message..."
                  className="w-full rounded-lg border border-orange-500/20 bg-gray-800/50 pl-3 pr-10 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none overflow-hidden"
                  rows={1}
                  style={{ minHeight: '36px', maxHeight: '120px' }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement
                    target.style.height = 'auto'
                    target.style.height =
                      Math.min(target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendMessage({ text: input })
                      setInput('')
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
