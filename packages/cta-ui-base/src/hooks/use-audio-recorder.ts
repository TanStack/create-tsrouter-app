import { useCallback, useRef, useState } from 'react'

interface TranscriptionResult {
  text: string
  language?: string
  duration?: number
}

/**
 * Hook for recording audio from the microphone and transcribing it via the API.
 */
export function useAudioRecorder(apiEndpoint = '/api/transcription') {
  const [isRecording, setIsRecording] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Try to use a supported MIME type
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/mp4'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (err: any) {
      console.error('[AudioRecorder] Failed to start recording:', err)
      setError(err.message || 'Could not access microphone')
      throw err
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<TranscriptionResult | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current
      if (!mediaRecorder) {
        resolve(null)
        return
      }

      mediaRecorder.onstop = async () => {
        setIsRecording(false)
        setIsTranscribing(true)
        setError(null)

        const mimeType = mediaRecorder.mimeType || 'audio/webm'
        const audioBlob = new Blob(chunksRef.current, { type: mimeType })

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop())
          streamRef.current = null
        }

        try {
          const formData = new FormData()
          const extension = mimeType.includes('webm') ? 'webm' : 'mp4'
          formData.append(
            'audio',
            new File([audioBlob], `recording.${extension}`, { type: mimeType }),
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
          resolve({
            text: result.text || '',
            language: result.language,
            duration: result.duration,
          })
        } catch (err: any) {
          console.error('[AudioRecorder] Transcription error:', err)
          setError(err.message || 'Transcription failed')
          setIsTranscribing(false)
          resolve(null)
        }
      }

      mediaRecorder.stop()
    })
  }, [apiEndpoint])

  const cancelRecording = useCallback(() => {
    const mediaRecorder = mediaRecorderRef.current
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsRecording(false)
    setIsTranscribing(false)
    chunksRef.current = []
  }, [isRecording])

  return {
    isRecording,
    isTranscribing,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
  }
}

