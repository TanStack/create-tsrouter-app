import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Square, Sparkles, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { clientTools } from '@tanstack/ai-client'
import type { UIMessage } from '@tanstack/ai-react'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'

import { selectAddOnsToolDef, unselectAddOnsToolDef } from '../lib/ai-tools'

import { useAddOns } from '../store/project'

import type { AddOnInfo } from '../types'

export interface AIChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiEndpoint?: string
}

function Messages({
  messages,
}: {
  messages: Array<UIMessage>
}) {
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight
    }
  }, [messages])

  if (!messages.length) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center space-y-3">
          <Sparkles className="w-12 h-12 mx-auto text-cyan-400/50" />
          <p className="text-lg">How can I help you configure your app?</p>
          <p className="text-sm text-gray-500">
            Ask me to add features like authentication, database connections, or
            API integrations.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
    >
      {messages.map((message) => {
        return (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === 'assistant'
                  ? 'bg-gray-800/80 text-gray-100'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
              }`}
            >
              <div className="flex items-start gap-3">
                {message.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5">
                    AI
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text' && part.content) {
                      return (
                        <div
                          key={`text-${index}`}
                          className="prose prose-sm prose-invert max-w-none [&_p]:my-1 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-0.5"
                        >
                          <ReactMarkdown
                            rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            remarkPlugins={[remarkGfm]}
                          >
                            {part.content}
                          </ReactMarkdown>
                        </div>
                      )
                    }

                    // Show tool calls with their status
                    if (part.type === 'tool-call') {
                      const hasOutput = part.output !== undefined
                      const isApprovalRequested = part.state === 'approval-requested'
                      return (
                        <div
                          key={part.id}
                          className={`mt-2 px-3 py-2 rounded-lg text-sm ${
                            hasOutput
                              ? 'bg-green-500/10 border border-green-500/20 text-green-300'
                              : isApprovalRequested
                                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-300'
                                : 'bg-blue-500/10 border border-blue-500/20 text-blue-300'
                          }`}
                        >
                          <span className="font-mono text-xs">
                            {hasOutput ? '✓' : isApprovalRequested ? '⏸' : '⏳'}{' '}
                            {part.name}
                          </span>
                        </div>
                      )
                    }

                    return null
                  })}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function AIChatDialog({
  open,
  onOpenChange,
  apiEndpoint = '/api/ai-chat',
}: AIChatDialogProps) {
  const [input, setInput] = useState('')
  const { availableAddOns, addOnState, toggleAddOn } = useAddOns()

  // Ref to keep add-on state fresh for tool callbacks
  const addOnStateRef = useRef(addOnState)
  addOnStateRef.current = addOnState

  // Build add-ons list for the API
  const getAddOnsList = useCallback(() => {
    return availableAddOns.map((addOn: AddOnInfo) => ({
      id: addOn.id,
      name: addOn.name,
      description: addOn.description,
      aiDescription: addOn.aiDescription,
      type: addOn.type,
      selected: addOnState[addOn.id]?.selected ?? false,
      enabled: addOnState[addOn.id]?.enabled ?? true,
    }))
  }, [availableAddOns, addOnState])

  // Create client tools that interact with the add-on state
  const selectAddOnsClient = useCallback(() => {
    return selectAddOnsToolDef.client((args) => {
      const currentState = addOnStateRef.current
      const selectedAddOns: string[] = []
      for (const addOnId of args.addOnIds) {
        const state = currentState[addOnId]
        if (state && !state.selected && state.enabled) {
          toggleAddOn(addOnId)
          selectedAddOns.push(addOnId)
        }
      }
      return {
        success: selectedAddOns.length > 0,
        selectedAddOns,
        message:
          selectedAddOns.length > 0
            ? `Successfully selected: ${selectedAddOns.join(', ')}`
            : 'No add-ons were selected (may not be available or already selected).',
      }
    })
  }, [toggleAddOn])

  const unselectAddOnsClient = useCallback(() => {
    return unselectAddOnsToolDef.client((args) => {
      const currentState = addOnStateRef.current
      const unselectedAddOns: string[] = []
      for (const addOnId of args.addOnIds) {
        const state = currentState[addOnId]
        if (state && state.selected && state.enabled) {
          toggleAddOn(addOnId)
          unselectedAddOns.push(addOnId)
        }
      }
      return {
        success: unselectedAddOns.length > 0,
        unselectedAddOns,
        message:
          unselectedAddOns.length > 0
            ? `Successfully unselected: ${unselectedAddOns.join(', ')}`
            : 'No add-ons were unselected (may not be available or already unselected).',
      }
    })
  }, [toggleAddOn])

  const tools = clientTools(selectAddOnsClient(), unselectAddOnsClient())

  const { messages, sendMessage, isLoading, stop } = useChat({
    connection: fetchServerSentEvents(apiEndpoint),
    tools,
    body: {
      addOns: getAddOnsList(),
    },
  })

  // Log messages changes
  useEffect(() => {
    console.log('[Chat] Messages updated, count:', messages.length)
    messages.forEach((msg, i) => {
      console.log(`[Chat] Message ${i}: role=${msg.role}, parts=${msg.parts.length}`)
      msg.parts.forEach((part, j) => {
        if (part.type === 'text') {
          console.log(`[Chat]   Part ${j}: text="${(part as any).content?.slice(0, 100)}..."`)
        } else if (part.type === 'tool-call') {
          console.log(`[Chat]   Part ${j}: tool-call name=${(part as any).name} state=${(part as any).state} hasOutput=${(part as any).output !== undefined}`)
          if ((part as any).input) {
            console.log(`[Chat]     Input:`, JSON.stringify((part as any).input))
          }
          if ((part as any).output !== undefined) {
            console.log(`[Chat]     Output:`, JSON.stringify((part as any).output))
          }
        }
      })
    })
  }, [messages])

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      console.log('[Chat] Sending message:', input)
      sendMessage(input)
      setInput('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl h-[80vh] flex flex-col p-0 gap-0 bg-gray-900/95 border-gray-700/50"
        hideCloseButton
      >
        <DialogHeader className="px-6 py-4 border-b border-gray-700/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-white">AI Assistant</DialogTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                Powered by GPT-4o
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-white"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Messages messages={messages} />

        <div className="border-t border-gray-700/50 p-4">
          {isLoading && (
            <div className="flex items-center justify-center mb-3">
              <Button
                onClick={stop}
                variant="destructive"
                size="sm"
                className="flex items-center gap-2"
              >
                <Square className="w-3 h-3 fill-current" />
                Stop
              </Button>
            </div>
          )}
          <div className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me to configure your app..."
              className="w-full rounded-xl border border-gray-600/50 bg-gray-800/50 pl-4 pr-12 py-3 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none"
              rows={1}
              style={{ minHeight: '48px', maxHeight: '150px' }}
              disabled={isLoading}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement
                target.style.height = 'auto'
                target.style.height = Math.min(target.scrollHeight, 150) + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 rounded-lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          {/* Powered by TanStack AI */}
          <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-700/30">
            <span className="text-xs text-gray-500">
              Powered by{' '}
              <a
                href="https://tanstack.com/ai"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
              >
                TanStack AI
              </a>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AISparkleButton({
  onClick,
}: {
  onClick: () => void
}) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group"
      title="AI Assistant"
    >
      <Sparkles className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
    </Button>
  )
}

