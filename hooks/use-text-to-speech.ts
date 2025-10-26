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
    async (text: string, language?: string, filename?: string) => {
      if (!isSupported || !text.trim()) return

      try {
        // Try to use server-side TTS API first
        try {
          const response = await fetch('/api/text-to-speech', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              language: language || 'en',
              voice: 'preferred-voice',
              format: 'mp3'
            })
          })

          if (response.ok) {
            const audioBlob = await response.blob()
            const url = URL.createObjectURL(audioBlob)

            const a = document.createElement('a')
            a.href = url
            a.download = filename || `translation-${Date.now()}.mp3`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)

            URL.revokeObjectURL(url)
            return
          } else {
            // API endpoint exists but not implemented
            console.log('TTS API not implemented, using fallback')
          }
        } catch (apiError) {
          console.log('TTS API not available, using fallback')
        }

        // Fallback: create a notification sound when TTS API is unavailable
        if (audioBufferToWav) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
          const sampleRate = audioContext.sampleRate
          const duration = 0.5 // Short notification sound
          const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate)
          const data = buffer.getChannelData(0)

          // Create a simple notification beep
          for (let i = 0; i < sampleRate * duration; i++) {
            const t = i / sampleRate
            data[i] = Math.sin(2 * Math.PI * 800 * t) * Math.exp(-t * 5) * 0.1
          }

          const audioBlob = audioBufferToWav(buffer)
          const url = URL.createObjectURL(audioBlob)

          const a = document.createElement('a')
          a.href = url
          a.download = filename || `translation-${Date.now()}.wav`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)

          URL.revokeObjectURL(url)
          audioContext.close()
        }

        setError('TTS API unavailable - downloaded notification sound')

      } catch (error) {
        console.error('Audio download error:', error)
        setError('Failed to download audio - implement server-side TTS API')
      }
    },
    [isSupported]
  )

  // Helper function to convert AudioBuffer to WAV Blob
  const audioBufferToWav = (buffer: AudioBuffer): Blob => {
    const length = buffer.length
    const numberOfChannels = buffer.numberOfChannels
    const sampleRate = buffer.sampleRate
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2)
    const view = new DataView(arrayBuffer)

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + length * numberOfChannels * 2, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, numberOfChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * numberOfChannels * 2, true)
    view.setUint16(32, numberOfChannels * 2, true)
    view.setUint16(34, 16, true)
    writeString(36, 'data')
    view.setUint32(40, length * numberOfChannels * 2, true)

    // Convert float samples to 16-bit PCM
    let offset = 44
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]))
        view.setInt16(offset, sample * 0x7FFF, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

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
