import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState, useRef } from 'react'
import {
  PlusCircle,
  MessageCircle,
  Trash2,
  Send,
  Settings,
  Edit2,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import rehypeHighlight from 'rehype-highlight'

import { SettingsDialog } from '../components/demo.SettingsDialog'
import { useAppState } from '../store/demo.hooks'
import { store } from '../store/demo.store'
import { genAIResponse } from '../utils/demo.ai'

import type { Message } from '../utils/demo.ai'

import '../demo.index.css'

function Home() {
  const {
    conversations,
    currentConversationId,
    isLoading,
    setCurrentConversationId,
    addConversation,
    deleteConversation,
    updateConversationTitle,
    addMessage,
    setLoading,
    getCurrentConversation,
    getActivePrompt,
  } = useAppState()

  const currentConversation = getCurrentConversation(store.state)
  const messages = currentConversation?.messages || []

  // Local state
  const [input, setInput] = useState('')
  const [editingChatId, setEditingChatId] = useState<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [pendingMessage, setPendingMessage] = useState<Message | null>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const currentInput = input
    setInput('') // Clear input early for better UX
    setLoading(true)

    try {
      let conversationId = currentConversationId

      // If no current conversation, create one
      if (!conversationId) {
        conversationId = Date.now().toString()
        const newConversation = {
          id: conversationId,
          title: currentInput.trim().slice(0, 30),
          messages: [],
        }
        addConversation(newConversation)
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: currentInput.trim(),
      }

      // Add user message
      addMessage(conversationId, userMessage)

      // Get active prompt
      const activePrompt = getActivePrompt(store.state)
      let systemPrompt
      if (activePrompt) {
        systemPrompt = {
          value: activePrompt.content,
          enabled: true,
        }
      }

      // Get AI response
      const response = await genAIResponse({
        data: {
          messages: [...messages, userMessage],
          systemPrompt,
        },
      })

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No reader found in response')
      }

      const decoder = new TextDecoder()

      let done = false
      let newMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: '',
      }
      while (!done) {
        const out = await reader.read()
        done = out.done
        if (!done) {
          try {
            const json = JSON.parse(decoder.decode(out.value))
            if (json.type === 'content_block_delta') {
              newMessage = {
                ...newMessage,
                content: newMessage.content + json.delta.text,
              }
              setPendingMessage(newMessage)
            }
          } catch (e) {}
        }
      }

      setPendingMessage(null)
      if (newMessage.content.trim()) {
        addMessage(conversationId, newMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request.',
      }
      if (currentConversationId) {
        addMessage(currentConversationId, errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    }
    addConversation(newConversation)
  }

  const handleDeleteChat = (id: string) => {
    deleteConversation(id)
  }

  const handleUpdateChatTitle = (id: string, title: string) => {
    updateConversationTitle(id, title)
    setEditingChatId(null)
  }

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  return (
    <div className="relative flex h-[calc(100vh-32px)] bg-gray-900">
      {/* Settings Button */}
      <div className="absolute top-5 right-5 z-50">
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
        <div className="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full justify-center"
          >
            <PlusCircle className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700/50 ${
                chat.id === currentConversationId ? 'bg-gray-700/50' : ''
              }`}
              onClick={() => setCurrentConversationId(chat.id)}
            >
              <MessageCircle className="w-4 h-4 text-gray-400" />
              {editingChatId === chat.id ? (
                <input
                  type="text"
                  value={chat.title}
                  onChange={(e) =>
                    handleUpdateChatTitle(chat.id, e.target.value)
                  }
                  onBlur={() => setEditingChatId(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateChatTitle(chat.id, chat.title)
                    }
                  }}
                  className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                  autoFocus
                />
              ) : (
                <span className="flex-1 text-sm text-gray-300 truncate">
                  {chat.title}
                </span>
              )}
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingChatId(chat.id)
                  }}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(chat.id)
                  }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto pb-24"
            >
              <div className="max-w-3xl mx-auto w-full px-4">
                {[...messages, pendingMessage]
                  .filter((v) => v)
                  .map((message) => (
                    <div
                      key={message!.id}
                      className={`py-6 ${
                        message!.role === 'assistant'
                          ? 'bg-gradient-to-r from-orange-500/5 to-red-600/5'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-4 max-w-3xl mx-auto w-full">
                        {message!.role === 'assistant' ? (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 mt-2 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                            AI
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                            Y
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <ReactMarkdown
                            className="prose dark:prose-invert max-w-none"
                            rehypePlugins={[
                              rehypeRaw,
                              rehypeSanitize,
                              rehypeHighlight,
                            ]}
                          >
                            {message!.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                {isLoading && (
                  <div className="py-6 bg-gradient-to-r from-orange-500/5 to-red-600/5">
                    <div className="flex items-start gap-4 max-w-3xl mx-auto w-full">
                      <div className="relative w-8 h-8 flex-shrink-0">
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-[spin_2s_linear_infinite]"></div>
                        <div className="absolute inset-[2px] rounded-lg bg-gray-900 flex items-center justify-center">
                          <div className="relative w-full h-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 animate-pulse"></div>
                            <span className="relative z-10 text-sm font-medium text-white">
                              AI
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-gray-400 font-medium text-lg">
                          Thinking
                        </div>
                        <div className="flex gap-2">
                          <div
                            className="w-2 h-2 rounded-full bg-orange-500 animate-[bounce_0.8s_infinite]"
                            style={{ animationDelay: '0ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-orange-500 animate-[bounce_0.8s_infinite]"
                            style={{ animationDelay: '200ms' }}
                          ></div>
                          <div
                            className="w-2 h-2 rounded-full bg-orange-500 animate-[bounce_0.8s_infinite]"
                            style={{ animationDelay: '400ms' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div className="absolute bottom-0 right-0 left-64 bg-gray-900/80 backdrop-blur-sm border-t border-orange-500/10">
              <div className="max-w-3xl mx-auto w-full px-4 py-3">
                <form onSubmit={handleSubmit}>
                  <div className="relative">
                    <textarea
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e)
                        }
                      }}
                      placeholder="Type something clever (or don't, we won't judge)..."
                      className="w-full rounded-lg border border-orange-500/20 bg-gray-800/50 pl-4 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none overflow-hidden shadow-lg"
                      rows={1}
                      style={{ minHeight: '44px', maxHeight: '200px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + 'px'
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center max-w-3xl mx-auto w-full">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text uppercase">
                <span className="text-white">TanStack</span> Chat
              </h1>
              <p className="text-gray-400 mb-6 w-2/3 mx-auto text-lg">
                You can ask me about anything, I might or might not have a good
                answer, but you can still ask.
              </p>
              <form onSubmit={handleSubmit}>
                <div className="relative max-w-xl mx-auto">
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                    placeholder="Type something clever (or don't, we won't judge)..."
                    className="w-full rounded-lg border border-orange-500/20 bg-gray-800/50 pl-4 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none overflow-hidden"
                    rows={1}
                    style={{ minHeight: '88px' }}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  )
}

export const Route = createFileRoute('/example/chat')({
  component: Home,
})
