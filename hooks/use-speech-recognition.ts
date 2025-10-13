"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  onResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
}

interface SpeechRecognitionHook {
  isSupported: boolean
  isListening: boolean
  transcript: string
  interimTranscript: string
  startListening: () => void
  stopListening: () => void
  resetTranscript: () => void
  error: string | null
}

// Web Speech API types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
  message: string
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  abort(): void
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null
  onend: ((this: SpeechRecognition, ev: Event) => any) | null
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition
    webkitSpeechRecognition: new () => SpeechRecognition
  }
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
  const { continuous = true, interimResults = true, language = "en-US", onResult, onError, onStart, onEnd } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)

  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Check for browser support
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setIsSupported(!!SpeechRecognition)

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
    }
  }, [])

  // Configure recognition
  useEffect(() => {
    const recognition = recognitionRef.current
    if (!recognition) return

    console.log("[v0] Configuring speech recognition:", { continuous, interimResults, language })

    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.lang = language

    recognition.onstart = () => {
      console.log("[v0] Speech recognition started")
      setIsListening(true)
      setError(null)
      onStart?.()
    }

    recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
      onEnd?.()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = ""
      let interimTranscript = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      console.log("[v0] Speech recognition result:", { finalTranscript, interimTranscript })

      // Batch state updates to prevent multiple renders
      if (finalTranscript) {
        setTranscript(finalTranscript) // Set only the new transcript, not accumulated
        onResult?.(finalTranscript, true)
      }
      
      if (interimTranscript) {
        setInterimTranscript(interimTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`
      console.error("[v0] Speech recognition error:", event.error, event.message)
      setError(errorMessage)
      setIsListening(false)
      onError?.(errorMessage)
    }
  }, [continuous, interimResults, language, onResult, onError, onStart, onEnd])

  const startListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition || isListening) {
      console.log("[v0] Cannot start listening:", { hasRecognition: !!recognition, isListening })
      return
    }

    try {
      console.log("[v0] Starting speech recognition")
      recognition.start()
    } catch (error) {
      const errorMessage = "Failed to start speech recognition"
      console.error("[v0] Failed to start speech recognition:", error)
      setError(errorMessage)
      onError?.(errorMessage)
    }
  }, [isListening, onError])

  const stopListening = useCallback(() => {
    const recognition = recognitionRef.current
    if (!recognition || !isListening) return

    recognition.stop()
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
  }, [])

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error,
  }
}
