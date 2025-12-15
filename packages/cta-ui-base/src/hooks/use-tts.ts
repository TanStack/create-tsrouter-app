import { useCallback, useRef, useState, useEffect } from 'react'

interface TTSOptions {
  voice?: string
  model?: string
  format?: string
  speed?: number
}

/**
 * Hook for text-to-speech playback with real-time volume analysis.
 * Exposes volume level (0-1) for visualizations like animated orbs.
 */
export function useTTS(apiEndpoint = '/api/tts') {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [volume, setVolume] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    }
  }, [])

  // Volume analysis loop
  const startVolumeAnalysis = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser) return

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const analyze = () => {
      if (!analyserRef.current) {
        setVolume(0)
        return
      }

      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume (0-255) and normalize to 0-1
      let sum = 0
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i]
      }
      const average = sum / dataArray.length
      const normalizedVolume = Math.min(average / 128, 1) // Normalize and clamp

      setVolume(normalizedVolume)

      animationFrameRef.current = requestAnimationFrame(analyze)
    }

    analyze()
  }, [])

  const stopVolumeAnalysis = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    setVolume(0)
  }, [])

  const speak = useCallback(
    async (text: string, options: TTSOptions = {}) => {
      // Stop any currently playing audio
      stop()

      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            voice: options.voice || 'nova',
            model: options.model || 'tts-1',
            format: options.format || 'mp3',
            speed: options.speed || 1.0,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'TTS failed')
        }

        const result = await response.json()

        // Convert base64 to audio blob
        const audioData = atob(result.audio)
        const bytes = new Uint8Array(audioData.length)
        for (let i = 0; i < audioData.length; i++) {
          bytes[i] = audioData.charCodeAt(i)
        }
        const blob = new Blob([bytes], { type: result.contentType || 'audio/mp3' })
        const url = URL.createObjectURL(blob)

        // Create audio element
        const audio = new Audio(url)
        audioRef.current = audio

        // Set up Web Audio API for volume analysis
        const audioContext = new AudioContext()
        audioContextRef.current = audioContext

        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 256
        analyser.smoothingTimeConstant = 0.8
        analyserRef.current = analyser

        const source = audioContext.createMediaElementSource(audio)
        sourceRef.current = source
        source.connect(analyser)
        analyser.connect(audioContext.destination)

        setIsLoading(false)
        setIsSpeaking(true)

        audio.onended = () => {
          URL.revokeObjectURL(url)
          setIsSpeaking(false)
          stopVolumeAnalysis()
          audioRef.current = null
        }

        audio.onerror = () => {
          URL.revokeObjectURL(url)
          setIsSpeaking(false)
          setError('Audio playback failed')
          stopVolumeAnalysis()
          audioRef.current = null
        }

        // Start playback and volume analysis
        await audio.play()
        startVolumeAnalysis()
      } catch (err: any) {
        console.error('[TTS] Error:', err)
        setError(err.message || 'TTS failed')
        setIsLoading(false)
        setIsSpeaking(false)
      }
    },
    [apiEndpoint, startVolumeAnalysis, stopVolumeAnalysis],
  )

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    stopVolumeAnalysis()
    setIsSpeaking(false)
    setIsLoading(false)
  }, [stopVolumeAnalysis])

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    error,
    volume, // 0-1 normalized volume level for visualizations
  }
}

