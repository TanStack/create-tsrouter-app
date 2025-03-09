import { createEffect, createSignal, Show } from 'solid-js'
import { createFileRoute } from '@tanstack/solid-router'
import {
  PlusCircle,
  MessageCircle,
  Trash2,
  Send,
  Settings,
  Edit2,
} from 'lucide-solid'
import MarkdownIt from 'markdown-it'
import { SettingsDialog } from '../components/demo.SettingsDialog'
import {
  useAppActions,
  useAppSelectors,
  useAppState,
} from '../store/demo.hooks'
import { store } from '../store/demo.store'

import '../demo.index.css'

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

const md = new MarkdownIt()

function Home() {
  const state = useAppState()
  const actions = useAppActions()
  const selectors = useAppSelectors()

  const currentConversation = () =>
    state().conversations.find((c) => c.id === state().currentConversationId)
  const messages = () => currentConversation()?.messages || []

  // Local state
  const [input, setInput] = createSignal('')
  const [editingChatId, setEditingChatId] = createSignal<string | null>(null)
  const [isSettingsOpen, setIsSettingsOpen] = createSignal(false)
  let messagesContainerRef: HTMLDivElement | null
  const [pendingMessage, setPendingMessage] = createSignal<Message | null>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef) {
      messagesContainerRef.scrollTop = messagesContainerRef.scrollHeight
    }
  }

  // Scroll to bottom when messages change or loading state changes
  createEffect(() => {
    state().isLoading
    messages()
    scrollToBottom()
  })

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    if (!input().trim() || state().isLoading) return

    const currentInput = input()
    setInput('') // Clear input early for better UX
    actions.setLoading(true)

    try {
      let conversationId = state().currentConversationId

      // If no current conversation, create one
      if (!conversationId) {
        conversationId = Date.now().toString()
        const newConversation = {
          id: conversationId,
          title: currentInput.trim().slice(0, 30),
          messages: [],
        }
        actions.addConversation(newConversation)
      }

      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user' as const,
        content: currentInput.trim(),
      }

      // Add user message
      actions.addMessage(conversationId, userMessage)

      // Get active prompt
      const activePrompt = selectors.getActivePrompt(store.state)
      let systemPrompt
      if (activePrompt) {
        systemPrompt = {
          value: activePrompt.content,
          enabled: true,
        }
      }

      const response = await fetch('http://localhost:8080/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages(), userMessage],
          systemPrompt,
        }),
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
            const jsonTxt = decoder.decode(out.value).replace(/^data:\s+/, '')
            console.log(jsonTxt)
            const json = JSON.parse(jsonTxt)
            if (json.type === 'content_block_delta') {
              newMessage = {
                ...newMessage,
                content: newMessage.content + json.delta.text,
              }
              setPendingMessage(newMessage)
            }
          } catch (e) {
            console.error(e)
          }
        }
      }

      setPendingMessage(null)
      if (newMessage.content.trim()) {
        actions.addMessage(conversationId, newMessage)
      }
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error processing your request.',
      }
      if (state().currentConversationId) {
        actions.addMessage(state().currentConversationId!, errorMessage)
      }
    } finally {
      actions.setLoading(false)
    }
  }

  const handleNewChat = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
    }
    actions.addConversation(newConversation)
  }

  const handleDeleteChat = (id: string) => {
    actions.deleteConversation(id)
  }

  const handleUpdateChatTitle = (id: string, title: string) => {
    actions.updateConversationTitle(id, title)
    setEditingChatId(null)
  }

  // Handle input change
  const handleInputChange = (e: any) => {
    setInput(e.target.value)
  }

  return (
    <div class="relative flex h-[calc(100vh-32px)] bg-gray-900">
      {/* Settings Button */}
      <div class="absolute top-5 right-5 z-50">
        <button
          onClick={() => setIsSettingsOpen(true)}
          class="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center text-white hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          <Settings class="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div class="flex flex-col w-64 bg-gray-800 border-r border-gray-700">
        <div class="p-4 border-b border-gray-700">
          <button
            onClick={handleNewChat}
            class="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-600 rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-orange-500 w-full justify-center"
          >
            <PlusCircle class="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat List */}
        <div class="flex-1 overflow-y-auto">
          {state().conversations.map((chat) => (
            <div
              class={`group flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-gray-700/50 ${
                chat.id === state().currentConversationId
                  ? 'bg-gray-700/50'
                  : ''
              }`}
              onClick={() => actions.setCurrentConversationId(chat.id)}
            >
              <MessageCircle class="w-4 h-4 text-gray-400" />
              {editingChatId() === chat.id ? (
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
                  class="flex-1 bg-transparent text-sm text-white focus:outline-none"
                  autofocus
                />
              ) : (
                <span class="flex-1 text-sm text-gray-300 truncate">
                  {chat.title}
                </span>
              )}
              <div class="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingChatId(chat.id)
                  }}
                  class="p-1 text-gray-400 hover:text-white"
                >
                  <Edit2 class="w-3 h-3" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteChat(chat.id)
                  }}
                  class="p-1 text-gray-400 hover:text-red-500"
                >
                  <Trash2 class="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div class="flex-1 flex flex-col">
        {state().currentConversationId ? (
          <>
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              class="flex-1 overflow-y-auto pb-24"
            >
              <div class="max-w-3xl mx-auto w-full px-4">
                {[...messages(), pendingMessage()]
                  .filter((v) => v)
                  .map((message) => (
                    <div
                      class={`py-6 ${
                        message!.role === 'assistant'
                          ? 'bg-gradient-to-r from-orange-500/5 to-red-600/5'
                          : 'bg-transparent'
                      }`}
                    >
                      <div class="flex items-start gap-4 max-w-3xl mx-auto w-full">
                        {message!.role === 'assistant' ? (
                          <div class="w-8 h-8 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 mt-2 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                            AI
                          </div>
                        ) : (
                          <div class="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-sm font-medium text-white flex-shrink-0">
                            Y
                          </div>
                        )}
                        <div
                          innerHTML={md.render(message!.content)}
                          class="flex-1 min-w-0 text-white"
                        ></div>
                      </div>
                    </div>
                  ))}
                {state().isLoading && (
                  <div class="py-6 bg-gradient-to-r from-orange-500/5 to-red-600/5">
                    <div class="flex items-start gap-4 max-w-3xl mx-auto w-full">
                      <div class="relative w-8 h-8 flex-shrink-0">
                        <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-[spin_2s_linear_infinite]"></div>
                        <div class="absolute inset-[2px] rounded-lg bg-gray-900 flex items-center justify-center">
                          <div class="relative w-full h-full rounded-lg bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center">
                            <div class="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500 to-red-600 animate-pulse"></div>
                            <span class="relative z-10 text-sm font-medium text-white">
                              AI
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="flex items-center gap-3">
                        <div class="text-gray-400 font-medium text-lg">
                          Thinking
                        </div>
                        <div class="flex gap-2">
                          <div
                            class="w-2 h-2 rounded-full bg-orange-500 animate-[bounce_0.8s_infinite]"
                            style={{ 'animation-delay': '0ms' }}
                          ></div>
                          <div
                            class="w-2 h-2 rounded-full bg-orange-500 animate-[bounce_0.8s_infinite]"
                            style={{ 'animation-delay': '200ms' }}
                          ></div>
                          <div
                            class="w-2 h-2 rounded-full bg-orange-500 animate-[bounce_0.8s_infinite]"
                            style={{ 'animation-delay': '400ms' }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input */}
            <div class="absolute bottom-0 right-0 left-64 bg-gray-900/80 backdrop-blur-sm border-t border-orange-500/10">
              <div class="max-w-3xl mx-auto w-full px-4 py-3">
                <form onSubmit={handleSubmit}>
                  <div class="relative">
                    <textarea
                      value={input()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleSubmit(e)
                        }
                      }}
                      placeholder="Type something clever (or don't, we won't judge)..."
                      class="w-full rounded-lg border border-orange-500/20 bg-gray-800/50 pl-4 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none overflow-hidden shadow-lg"
                      rows={1}
                      style={{ 'min-height': '44px', 'max-height': '200px' }}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height =
                          Math.min(target.scrollHeight, 200) + 'px'
                        handleInputChange(e)
                      }}
                    />
                    <button
                      type="submit"
                      disabled={!input().trim() || state().isLoading}
                      class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                    >
                      <Send class="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        ) : (
          <div class="flex-1 flex items-center justify-center px-4">
            <div class="text-center max-w-3xl mx-auto w-full">
              <h1 class="text-6xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-600 text-transparent bg-clip-text uppercase">
                <span class="text-white">TanStack</span> Chat
              </h1>
              <p class="text-gray-400 mb-6 w-2/3 mx-auto text-lg">
                You can ask me about anything, I might or might not have a good
                answer, but you can still ask.
              </p>
              <form onSubmit={handleSubmit}>
                <div class="relative max-w-xl mx-auto">
                  <textarea
                    value={input()}
                    onInput={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSubmit(e)
                      }
                    }}
                    placeholder="Type something clever (or don't, we won't judge)..."
                    class="w-full rounded-lg border border-orange-500/20 bg-gray-800/50 pl-4 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent resize-none overflow-hidden"
                    rows={1}
                    style={{ 'min-height': '88px' }}
                  />
                  <button
                    type="submit"
                    disabled={!input().trim() || state().isLoading}
                    class="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-orange-500 hover:text-orange-400 disabled:text-gray-500 transition-colors focus:outline-none"
                  >
                    <Send class="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* Settings Dialog */}
      <Show when={isSettingsOpen()}>
        <SettingsDialog
          isOpen={isSettingsOpen()}
          onClose={() => setIsSettingsOpen(false)}
        />
      </Show>
    </div>
  )
}

export const Route = createFileRoute('/example/chat')({
  component: Home,
})
