import { useCallback, useRef, useState, useEffect } from 'react'
import { useMicVAD, utils } from '@ricky0123/vad-react'

interface TranscriptionResult {
  text: string
  language?: string
  duration?: number
}

export interface UseVADRecorderOptions {
  /** API endpoint for transcription */
  apiEndpoint?: string
  /** Called when speech is detected */
  onSpeechStart?: () => void
  /** Called when speech ends and transcription is complete */
  onSpeechEnd?: (result: TranscriptionResult | null) => void
  /** Called during speech with audio data */
  onSpeechProgress?: (audio: Float32Array) => void
  /** Whether VAD should be actively listening */
  enabled?: boolean
}

/**
 * Hook for voice activity detection (VAD) based recording.
 * Automatically detects when the user starts/stops speaking and transcribes the audio.
 */
export function useVADRecorder({
  apiEndpoint = '/api/transcription',
  onSpeechStart,
  onSpeechEnd,
  onSpeechProgress,
  enabled = true,
}: UseVADRecorderOptions = {}) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)

  // Keep track of callbacks in refs to avoid re-creating VAD
  const onSpeechStartRef = useRef(onSpeechStart)
  const onSpeechEndRef = useRef(onSpeechEnd)
  const onSpeechProgressRef = useRef(onSpeechProgress)

  useEffect(() => {
    onSpeechStartRef.current = onSpeechStart
    onSpeechEndRef.current = onSpeechEnd
    onSpeechProgressRef.current = onSpeechProgress
  }, [onSpeechStart, onSpeechEnd, onSpeechProgress])

  // Transcribe audio data
  const transcribeAudio = useCallback(
    async (audioData: Float32Array): Promise<TranscriptionResult | null> => {
      setIsTranscribing(true)
      setError(null)

      try {
        // Convert Float32Array to WAV blob
        const wavBlob = utils.encodeWAV(audioData)

        const formData = new FormData()
        formData.append(
          'audio',
          new File([wavBlob], 'recording.wav', { type: 'audio/wav' }),
        )
        formData.append('model', 'whisper-1')

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Transcription failed')
        }

        const result = await response.json()
        setIsTranscribing(false)

        return {
          text: result.text || '',
          language: result.language,
          duration: result.duration,
        }
      } catch (err: any) {
        console.error('[VADRecorder] Transcription error:', err)
        setError(err.message || 'Transcription failed')
        setIsTranscribing(false)
        return null
      }
    },
    [apiEndpoint],
  )

  // Initialize VAD
  const vad = useMicVAD({
    startOnLoad: false,
    positiveSpeechThreshold: 0.8,
    negativeSpeechThreshold: 0.5,
    redemptionFrames: 10,
    preSpeechPadFrames: 5,
    minSpeechFrames: 5,

    onSpeechStart: () => {
      console.log('[VAD] Speech started')
      setIsSpeaking(true)
      onSpeechStartRef.current?.()
    },

    onSpeechEnd: async (audio: Float32Array) => {
      console.log('[VAD] Speech ended, transcribing...')
      setIsSpeaking(false)

      const result = await transcribeAudio(audio)
      onSpeechEndRef.current?.(result)
    },

    onVADMisfire: () => {
      console.log('[VAD] Misfire (too short)')
      setIsSpeaking(false)
    },

    onFrameProcessed: (probs) => {
      // Update volume visualization based on speech probability
      setVolume(probs.isSpeech)
      onSpeechProgressRef.current?.(new Float32Array(0)) // Could pass actual audio if needed
    },
  })

  // Track listening state
  useEffect(() => {
    setIsListening(vad.listening)
  }, [vad.listening])

  // Handle enabled state
  useEffect(() => {
    if (enabled && !vad.listening) {
      vad.start()
    } else if (!enabled && vad.listening) {
      vad.pause()
    }
  }, [enabled, vad])

  // Start listening
  const start = useCallback(() => {
    setError(null)
    vad.start()
  }, [vad])

  // Stop listening
  const stop = useCallback(() => {
    vad.pause()
    setIsSpeaking(false)
    setVolume(0)
  }, [vad])

  // Toggle listening
  const toggle = useCallback(() => {
    if (vad.listening) {
      stop()
    } else {
      start()
    }
  }, [vad.listening, start, stop])

  return {
    /** Whether VAD is actively listening for speech */
    isListening,
    /** Whether speech is currently being detected */
    isSpeaking,
    /** Whether audio is being transcribed */
    isTranscribing,
    /** Current error message, if any */
    error,
    /** Speech probability (0-1) for visualizations */
    volume,
    /** Start listening for speech */
    start,
    /** Stop listening for speech */
    stop,
    /** Toggle listening state */
    toggle,
    /** Whether VAD is loading (model initialization) */
    isLoading: vad.loading,
    /** Whether VAD encountered an error during initialization */
    vadError: vad.errored,
  }
}

