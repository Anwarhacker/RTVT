"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface SpeechRecognitionOptions {
  continuous?: boolean
  interimResults?: boolean
  language?: string
  autoStopTimeout?: number // Auto-stop after silence (in milliseconds)
  onResult?: (transcript: string, isFinal: boolean) => void
  onInterimResult?: (transcript: string) => void
  onError?: (error: string) => void
  onStart?: () => void
  onEnd?: () => void
  onAutoStop?: () => void // Called when auto-stopped due to silence
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
  const { continuous = true, interimResults = true, language = "en-US", autoStopTimeout = 3000, onResult, onInterimResult, onError, onStart, onEnd, onAutoStop } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [interimTranscript, setInterimTranscript] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastSpeechTimeRef = useRef<number>(0)

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
      lastSpeechTimeRef.current = Date.now()
      onStart?.()
    }

    recognition.onend = () => {
      console.log("[v0] Speech recognition ended")
      setIsListening(false)
      // Clear auto-stop timeout when recognition ends
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current)
        autoStopTimeoutRef.current = null
      }
      onEnd?.()
    }

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      console.log("[v0] Raw speech recognition event:", {
        resultIndex: event.resultIndex,
        resultsLength: event.results.length,
        results: Array.from(event.results).map((result, index) => ({
          index,
          isFinal: result.isFinal,
          transcript: result[0]?.transcript || "",
          confidence: result[0]?.confidence || 0
        }))
      })

      let finalTranscript = ""
      let interimTranscript = ""

      // Process all results from the current resultIndex
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (!result || !result[0]) continue

        const transcript = result[0].transcript

        if (result.isFinal) {
          finalTranscript += transcript
          console.log(`[v0] Final result ${i}: "${transcript}"`)
        } else {
          interimTranscript = transcript
          console.log(`[v0] Interim result ${i}: "${transcript}"`)
        }
      }

      console.log("[v0] Processed speech recognition:", { finalTranscript, interimTranscript })

      // Update last speech time for auto-stop functionality
      if (finalTranscript.trim() || interimTranscript.trim()) {
        lastSpeechTimeRef.current = Date.now()

        // Clear existing auto-stop timeout
        if (autoStopTimeoutRef.current) {
          clearTimeout(autoStopTimeoutRef.current)
        }

        // Set new auto-stop timeout
        autoStopTimeoutRef.current = setTimeout(() => {
          console.log("[v0] Auto-stopping due to silence")
          if (recognitionRef.current && isListening) {
            recognitionRef.current.stop()
            onAutoStop?.()
          }
        }, autoStopTimeout)
      }

      // Update state with results
      if (finalTranscript.trim()) {
        setTranscript(prev => {
          const newTranscript = prev + finalTranscript
          console.log(`[v0] Updated transcript: "${newTranscript}"`)
          return newTranscript
        })
        onResult?.(finalTranscript, true)
      }

      if (interimTranscript.trim()) {
        setInterimTranscript(interimTranscript)
        onInterimResult?.(interimTranscript)
      }
    }

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = `Speech recognition error: ${event.error}`
      console.error("[v0] Speech recognition error:", event.error, event.message)
      setError(errorMessage)
      setIsListening(false)
      onError?.(errorMessage)
    }
  }, [continuous, interimResults, language, autoStopTimeout, onResult, onInterimResult, onError, onStart, onEnd, onAutoStop])

  const startListening = useCallback(async () => {
    const recognition = recognitionRef.current
    if (!recognition || isListening) {
      console.log("[v0] Cannot start listening:", { hasRecognition: !!recognition, isListening })
      return
    }

    try {
      console.log("[v0] Starting speech recognition")
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        audioChunksRef.current = [];
      };
      mediaRecorderRef.current.start();
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

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    recognition.stop()
  }, [isListening])

  const resetTranscript = useCallback(() => {
    setTranscript("")
    setInterimTranscript("")
    lastSpeechTimeRef.current = 0
    // Clear any pending auto-stop timeout
    if (autoStopTimeoutRef.current) {
      clearTimeout(autoStopTimeoutRef.current)
      autoStopTimeoutRef.current = null
    }
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
    audioBlob
  }
}
