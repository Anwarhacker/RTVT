"use client"

import { useState, useCallback, useRef } from "react"

interface StreamingTranslationOptions {
  onProgress?: (language: string, text: string, isComplete: boolean) => void
  onComplete?: (results: Record<string, string>) => void
  onError?: (error: string) => void
}

interface StreamingTranslationHook {
  isStreaming: boolean
  streamingResults: Record<string, string>
  startStreaming: (text: string, inputLang: string, outputLangs: string[]) => void
  stopStreaming: () => void
  error: string | null
}

export function useStreamingTranslation(options: StreamingTranslationOptions = {}): StreamingTranslationHook {
  const { onProgress, onComplete, onError } = options

  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingResults, setStreamingResults] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const eventSourceRef = useRef<EventSource | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const stopStreaming = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setIsStreaming(false)
  }, [])

  const startStreaming = useCallback(
    async (text: string, inputLang: string, outputLangs: string[]) => {
      if (isStreaming) {
        stopStreaming()
      }

      setIsStreaming(true)
      setError(null)
      setStreamingResults({})

      try {
        abortControllerRef.current = new AbortController()

        const response = await fetch("/api/translate/stream", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text,
            inputLang,
            outputLangs,
          }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const reader = response.body?.getReader()
        const decoder = new TextDecoder()

        if (!reader) {
          throw new Error("No response body reader available")
        }

        const results: Record<string, string> = {}

        while (true) {
          const { done, value } = await reader.read()

          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split("\n")

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6))

                if (data.type === "translation") {
                  results[data.language] = data.text
                  setStreamingResults({ ...results })
                  onProgress?.(data.language, data.text, data.isComplete)
                } else if (data.type === "complete") {
                  setIsStreaming(false)
                  onComplete?.(results)
                } else if (data.type === "error") {
                  throw new Error(data.message)
                }
              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError)
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // Request was aborted, this is expected
          return
        }

        const errorMessage = error instanceof Error ? error.message : "Streaming translation failed"
        setError(errorMessage)
        onError?.(errorMessage)
        setIsStreaming(false)
      }
    },
    [isStreaming, stopStreaming, onProgress, onComplete, onError],
  )

  return {
    isStreaming,
    streamingResults,
    startStreaming,
    stopStreaming,
    error,
  }
}
