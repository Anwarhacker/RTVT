"use client"

import { useState, useEffect, useRef, useCallback } from "react"

interface TextToSpeechOptions {
  rate?: number
  pitch?: number
  volume?: number
  voice?: SpeechSynthesisVoice | null
  onStart?: () => void
  onEnd?: () => void
  onError?: (error: string) => void
}

interface TextToSpeechHook {
  isSupported: boolean
  isSpeaking: boolean
  voices: SpeechSynthesisVoice[]
  speak: (text: string, language?: string) => void
  stop: () => void
  pause: () => void
  resume: () => void
  setVoice: (voice: SpeechSynthesisVoice | null) => void
  setRate: (rate: number) => void
  setPitch: (pitch: number) => void
  setVolume: (volume: number) => void
  downloadAudio: (text: string, language?: string, filename?: string) => void
  error: string | null
}

// Language code mapping for speech synthesis with Indian accent preference
const TTS_LANGUAGE_CODES: Record<string, string> = {
  en: "en-IN", // Use Indian English accent
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  it: "it-IT",
  pt: "pt-PT",
  ru: "ru-RU",
  ja: "ja-JP",
  ko: "ko-KR",
  zh: "zh-CN",
  ar: "ar-SA",
  hi: "hi-IN",
  bn: "bn-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  pa: "pa-IN",
  ur: "ur-IN",
  or: "or-IN",
  as: "as-IN",
}

export function useTextToSpeech(options: TextToSpeechOptions = {}): TextToSpeechHook {
  const { rate = 0.8, pitch = 1, volume = 1, voice = null, onStart, onEnd, onError } = options

  const [isSupported, setIsSupported] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(voice)
  const [speechRate, setSpeechRate] = useState(rate)
  const [speechPitch, setSpeechPitch] = useState(pitch)
  const [speechVolume, setSpeechVolume] = useState(volume)
  const [error, setError] = useState<string | null>(null)

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Check for browser support and load voices
  useEffect(() => {
    const synth = window.speechSynthesis
    setIsSupported(!!synth)

    if (synth) {
      const loadVoices = () => {
        const availableVoices = synth.getVoices()
        setVoices(availableVoices)
      }

      loadVoices()

      // Some browsers load voices asynchronously
      if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = loadVoices
      }
    }
  }, [])

  const speak = useCallback(
    (text: string, language?: string) => {
      if (!isSupported || !text.trim()) return

      const synth = window.speechSynthesis

      // Stop any current speech
      synth.cancel()

      try {
        const utterance = new SpeechSynthesisUtterance(text)
        utteranceRef.current = utterance

        // Set voice based on language or selected voice with Indian accent preference
        if (language && TTS_LANGUAGE_CODES[language]) {
          const langCode = TTS_LANGUAGE_CODES[language]
          
          // For English, prefer Indian accent voices
          if (language === 'en') {
            const indianVoice = voices.find(
              (voice) => voice.lang === 'en-IN' || 
                        voice.name.toLowerCase().includes('indian') ||
                        voice.name.toLowerCase().includes('india')
            )
            if (indianVoice) {
              utterance.voice = indianVoice
              utterance.lang = 'en-IN'
            } else {
              // Fallback to any English voice
              const englishVoice = voices.find(
                (voice) => voice.lang.startsWith('en')
              )
              if (englishVoice) {
                utterance.voice = englishVoice
                utterance.lang = englishVoice.lang
              }
            }
          } else {
            // For other languages, find appropriate voice
            const languageVoice = voices.find(
              (voice) => voice.lang.startsWith(langCode) || voice.lang.startsWith(language)
            )
            if (languageVoice) {
              utterance.voice = languageVoice
            }
            utterance.lang = langCode
          }
        } else if (selectedVoice) {
          utterance.voice = selectedVoice
          utterance.lang = selectedVoice.lang
        }

        // Set speech parameters
        utterance.rate = speechRate
        utterance.pitch = speechPitch
        utterance.volume = speechVolume

        // Event handlers
        utterance.onstart = () => {
          setIsSpeaking(true)
          setError(null)
          onStart?.()
        }

        utterance.onend = () => {
          setIsSpeaking(false)
          onEnd?.()
        }

        utterance.onerror = (event) => {
          const errorMessage = `Speech synthesis error: ${event.error}`
          setError(errorMessage)
          setIsSpeaking(false)
          onError?.(errorMessage)
        }

        synth.speak(utterance)
      } catch (error) {
        const errorMessage = "Failed to start speech synthesis"
        setError(errorMessage)
        onError?.(errorMessage)
      }
    },
    [isSupported, voices, selectedVoice, speechRate, speechPitch, speechVolume, onStart, onEnd, onError],
  )

  const stop = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isSupported])

  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.pause()
    }
  }, [isSupported, isSpeaking])

  const resume = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.resume()
    }
  }, [isSupported])

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice)
  }, [])

  const setRate = useCallback((rate: number) => {
    setSpeechRate(Math.max(0.1, Math.min(10, rate)))
  }, [])

  const setPitch = useCallback((pitch: number) => {
    setSpeechPitch(Math.max(0, Math.min(2, pitch)))
  }, [])

  const setVolume = useCallback((volume: number) => {
    setSpeechVolume(Math.max(0, Math.min(1, volume)))
  }, [])

  const downloadAudio = useCallback(
    (text: string, language?: string, filename?: string) => {
      if (!isSupported || !text.trim()) return

      try {
        // Create a new utterance for recording
        const utterance = new SpeechSynthesisUtterance(text)
        
        // Set voice and language
        if (language && TTS_LANGUAGE_CODES[language]) {
          const langCode = TTS_LANGUAGE_CODES[language]
          const languageVoice = voices.find(
            (voice) => voice.lang.startsWith(langCode) || voice.lang.startsWith(language)
          )
          if (languageVoice) {
            utterance.voice = languageVoice
          }
          utterance.lang = langCode
        }

        // Set speech parameters
        utterance.rate = speechRate
        utterance.pitch = speechPitch
        utterance.volume = speechVolume

        // Create audio context for recording
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
        const mediaStreamDestination = audioContext.createMediaStreamDestination()
        
        // Create MediaRecorder
        const mediaRecorder = new MediaRecorder(mediaStreamDestination.stream, {
          mimeType: 'audio/webm'
        })
        
        const audioChunks: Blob[] = []
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data)
          }
        }
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          const url = URL.createObjectURL(audioBlob)
          
          // Create download link
          const a = document.createElement('a')
          a.href = url
          a.download = filename || `voice-translation-${Date.now()}.webm`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          
          // Clean up
          URL.revokeObjectURL(url)
          audioContext.close()
        }
        
        // Start recording
        mediaRecorder.start()
        
        // Speak and stop recording when done
        utterance.onend = () => {
          setTimeout(() => {
            mediaRecorder.stop()
          }, 500) // Small delay to ensure audio is captured
        }
        
        utterance.onerror = () => {
          mediaRecorder.stop()
          audioContext.close()
        }
        
        // Speak the text
        window.speechSynthesis.speak(utterance)
        
      } catch (error) {
        console.error('Audio download error:', error)
        setError('Failed to download audio')
      }
    },
    [isSupported, voices, speechRate, speechPitch, speechVolume]
  )

  return {
    isSupported,
    isSpeaking,
    voices,
    speak,
    stop,
    pause,
    resume,
    setVoice,
    setRate,
    setPitch,
    setVolume,
    downloadAudio,
    error,
  }
}
