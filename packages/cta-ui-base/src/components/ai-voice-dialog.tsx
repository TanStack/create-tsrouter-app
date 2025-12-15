import { useCallback, useEffect, useRef, useState } from 'react'
import { Mic, MicOff, X, Volume2, VolumeX, Radio } from 'lucide-react'
import { fetchServerSentEvents, useChat } from '@tanstack/ai-react'
import { clientTools } from '@tanstack/ai-client'

import { Button } from './ui/button'
import { Dialog, DialogContent } from './ui/dialog'
import { AIVoiceOrb } from './ai-voice-orb'

import { useVADRecorder } from '../hooks/use-vad-recorder'
import { useTTS } from '../hooks/use-tts'
import { selectAddOnsToolDef, unselectAddOnsToolDef } from '../lib/ai-tools'
import { getTranscriptionEndpoint, getTTSEndpoint } from '../lib/api'
import { useAddOns } from '../store/project'

import type { AddOnInfo } from '../types'

export interface AIVoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  apiEndpoint?: string
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking'

export function AIVoiceDialog({
  open,
  onOpenChange,
  apiEndpoint = '/api/ai-chat',
}: AIVoiceDialogProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle')
  const [transcript, setTranscript] = useState('')
  const [lastResponse, setLastResponse] = useState('')
  const [isMuted, setIsMuted] = useState(false)
  const [vadEnabled, setVadEnabled] = useState(false)

  const { availableAddOns, addOnState, toggleAddOn } = useAddOns()

  const {
    speak,
    stop: stopSpeaking,
    isSpeaking,
    isLoading: ttsLoading,
    volume: ttsVolume,
  } = useTTS(getTTSEndpoint())

  // Ref to sendMessage to avoid recreating VAD callbacks
  const sendMessageRef = useRef<(message: string) => void>(() => {})

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

  const { messages, sendMessage, isLoading } = useChat({
    connection: fetchServerSentEvents(apiEndpoint),
    tools,
    body: {
      addOns: getAddOnsList(),
    },
  })

  // Keep sendMessage ref updated
  useEffect(() => {
    sendMessageRef.current = sendMessage
  }, [sendMessage])

  // VAD-based voice activity detection
  const {
    isListening,
    isSpeaking: isUserSpeaking,
    isTranscribing,
    volume: vadVolume,
    stop: stopVAD,
    isLoading: vadLoading,
    vadError,
  } = useVADRecorder({
    apiEndpoint: getTranscriptionEndpoint(),
    enabled: vadEnabled && !isSpeaking && !ttsLoading && !isLoading,
    onSpeechStart: () => {
      console.log('[Voice] User started speaking')
      setTranscript('')
    },
    onSpeechEnd: (result) => {
      console.log('[Voice] User stopped speaking, transcript:', result?.text)
      if (result?.text) {
        setTranscript(result.text)
        sendMessageRef.current(result.text)
      }
    },
  })

  // Log messages changes
  useEffect(() => {
    console.log('[Voice] Messages updated, count:', messages.length)
    messages.forEach((msg, i) => {
      console.log(
        `[Voice] Message ${i}: role=${msg.role}, parts=${msg.parts.length}`,
      )
      msg.parts.forEach((part, j) => {
        if (part.type === 'text') {
          console.log(
            `[Voice]   Part ${j}: text="${(part as any).content?.slice(0, 100)}..."`,
          )
        } else if (part.type === 'tool-call') {
          console.log(
            `[Voice]   Part ${j}: tool-call name=${(part as any).name} state=${(part as any).state} hasOutput=${(part as any).output !== undefined}`,
          )
          if ((part as any).input) {
            console.log(
              `[Voice]     Input:`,
              JSON.stringify((part as any).input),
            )
          }
          if ((part as any).output !== undefined) {
            console.log(
              `[Voice]     Output:`,
              JSON.stringify((part as any).output),
            )
          }
        }
      })
    })
  }, [messages])

  // Update voice state based on current activities
  useEffect(() => {
    if (isUserSpeaking) {
      setVoiceState('listening')
    } else if (isTranscribing || isLoading || ttsLoading) {
      setVoiceState('thinking')
    } else if (isSpeaking) {
      setVoiceState('speaking')
    } else if (isListening) {
      setVoiceState('idle') // Actively listening but no speech detected yet
    } else {
      setVoiceState('idle')
    }
  }, [
    isUserSpeaking,
    isTranscribing,
    isLoading,
    ttsLoading,
    isSpeaking,
    isListening,
  ])

  // Watch for new AI responses and speak them
  useEffect(() => {
    if (!isMuted && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === 'assistant') {
        // Extract text content from the message parts
        const textParts = lastMessage.parts
          .filter((p) => p.type === 'text' && p.content)
          .map((p) => (p as any).content)
          .join(' ')

        if (textParts && textParts !== lastResponse && !isLoading) {
          setLastResponse(textParts)
          speak(textParts)
        }
      }
    }
  }, [messages, isMuted, speak, lastResponse, isLoading])

  // Auto-enable VAD when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay to let dialog render
      const timer = setTimeout(() => {
        setVadEnabled(true)
      }, 500)
      return () => clearTimeout(timer)
    } else {
      setVadEnabled(false)
    }
  }, [open])

  // Handle orb click - toggle VAD or interrupt speech
  const handleOrbClick = useCallback(async () => {
    if (isSpeaking) {
      stopSpeaking()
      return
    }

    // Toggle VAD listening
    setVadEnabled((prev) => !prev)
  }, [isSpeaking, stopSpeaking])

  // Cleanup on close
  const handleClose = useCallback(() => {
    stopVAD()
    stopSpeaking()
    setVadEnabled(false)
    onOpenChange(false)
  }, [stopVAD, stopSpeaking, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-xl h-[80vh] flex flex-col p-0 gap-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-slate-700/50 overflow-hidden"
        hideCloseButton
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
              <Volume2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Voice Assistant
              </h2>
              <p className="text-xs text-slate-400">
                {vadLoading
                  ? 'Loading voice detection...'
                  : 'Just start talking'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 w-9 p-0 ${isMuted ? 'text-red-400' : 'text-slate-400'} hover:text-white`}
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-slate-400 hover:text-white"
              onClick={handleClose}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Main orb area */}
        <div className="flex-1 flex flex-col items-center justify-center relative">
          {/* Background particles/effects */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
          </div>

          {/* Orb - clickable area */}
          <button
            onClick={handleOrbClick}
            className="relative z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-full transition-transform active:scale-95"
            disabled={isTranscribing || ttsLoading || vadLoading}
          >
            <AIVoiceOrb
              volume={isSpeaking ? ttsVolume : vadVolume}
              state={voiceState}
              size={220}
            />
          </button>

          {/* VAD Status indicator */}
          {vadEnabled &&
            isListening &&
            !isUserSpeaking &&
            !isSpeaking &&
            !isLoading && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/30 rounded-full">
                <Radio className="w-3 h-3 text-green-400 animate-pulse" />
                <span className="text-xs text-green-400 font-medium">
                  Listening...
                </span>
              </div>
            )}

          {/* Transcript display */}
          {transcript && (
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-md text-center px-6">
              <p className="text-slate-300 text-sm bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-700/50">
                "{transcript}"
              </p>
            </div>
          )}
        </div>

        {/* Footer with controls */}
        <div className="px-6 py-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-4">
            {/* VAD Toggle button */}
            <Button
              onClick={() => setVadEnabled((prev) => !prev)}
              disabled={vadLoading}
              className={`h-14 w-14 rounded-full p-0 transition-all ${
                vadEnabled
                  ? isUserSpeaking
                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                  : 'bg-slate-600 hover:bg-slate-500'
              }`}
              title={vadEnabled ? 'Stop listening' : 'Start listening'}
            >
              {vadEnabled ? (
                isUserSpeaking ? (
                  <Radio className="w-6 h-6 text-white animate-pulse" />
                ) : (
                  <Mic className="w-6 h-6 text-white" />
                )
              ) : (
                <MicOff className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>

          {/* Status text */}
          <p className="text-center text-xs text-slate-500 mt-3">
            {vadLoading && 'Loading voice detection model...'}
            {vadError && 'Voice detection failed to load'}
            {!vadLoading &&
              !vadError &&
              isUserSpeaking &&
              'Listening to you...'}
            {!vadLoading && !vadError && isTranscribing && 'Transcribing...'}
            {!vadLoading && !vadError && isLoading && 'AI is thinking...'}
            {!vadLoading && !vadError && ttsLoading && 'Generating speech...'}
            {!vadLoading && !vadError && isSpeaking && 'Tap orb to interrupt'}
            {!vadLoading &&
              !vadError &&
              vadEnabled &&
              isListening &&
              !isUserSpeaking &&
              !isSpeaking &&
              !isLoading &&
              !isTranscribing &&
              'Ready - just start talking!'}
            {!vadLoading &&
              !vadError &&
              !vadEnabled &&
              'Click mic to enable hands-free mode'}
          </p>

          {/* Powered by TanStack AI */}
          <div className="flex items-center justify-center mt-4 pt-3 border-t border-slate-700/30">
            <span className="text-xs text-slate-500">
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

export function AIVoiceButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      size="sm"
      className="h-9 w-9 p-0 rounded-lg bg-gradient-to-r from-pink-500/10 to-purple-500/10 hover:from-pink-500/20 hover:to-purple-500/20 border border-pink-500/20 hover:border-pink-500/40 transition-all duration-300 group"
      title="Voice Assistant"
    >
      <Mic className="w-4 h-4 text-pink-400 group-hover:text-pink-300 transition-colors" />
    </Button>
  )
}
