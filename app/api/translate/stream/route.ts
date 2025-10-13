import type { NextRequest } from "next/server"
import { ReadableStream } from "stream/web"

// Language code mapping for Google Translate API
const LANGUAGE_CODES: Record<string, string> = {
  auto: "auto",
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  it: "it",
  pt: "pt",
  ru: "ru",
  ja: "ja",
  ko: "ko",
  zh: "zh-cn",
  ar: "ar",
  // Indian languages
  hi: "hi",
  bn: "bn",
  ta: "ta",
  te: "te",
  mr: "mr",
  gu: "gu",
  kn: "kn",
  ml: "ml",
  pa: "pa",
  ur: "ur",
  or: "or",
  as: "as",
  ne: "ne",
  si: "si",
}

interface TranslateRequest {
  text: string
  inputLang: string
  outputLangs: string[]
}

interface StreamTranslationChunk {
  language: string
  text: string
  isComplete: boolean
  detectedLanguage?: string
}

async function* streamTranslateWithGemini(
  text: string,
  sourceLang: string,
  targetLangs: string[],
): AsyncGenerator<StreamTranslationChunk> {
  const API_KEY = "AIzaSyCH11Alz5Zq7vqna7bC4-Up81JVmQx6zBI"
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

  // Create language names for better translation context
  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    "zh-cn": "Chinese",
    ar: "Arabic",
    // Indian languages
    hi: "Hindi",
    bn: "Bengali",
    ta: "Tamil",
    te: "Telugu",
    mr: "Marathi",
    gu: "Gujarati",
    kn: "Kannada",
    ml: "Malayalam",
    pa: "Punjabi",
    ur: "Urdu",
    or: "Odia",
    as: "Assamese",
    ne: "Nepali",
    si: "Sinhala",
  }

  // Process each target language
  for (const targetLang of targetLangs) {
    const targetCode = LANGUAGE_CODES[targetLang]
    if (!targetCode) continue

    try {
      const targetLanguageName = languageNames[targetCode] || targetCode
      const sourceLanguageName =
        sourceLang === "auto" ? "the detected language" : languageNames[sourceLang] || sourceLang

      const prompt =
        sourceLang === "auto"
          ? `Translate the following text to ${targetLanguageName}. Only return the translated text, nothing else: "${text}"`
          : `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. Only return the translated text, nothing else: "${text}"`

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message || "Translation failed")
      }

      const fullTranslation = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

      if (!fullTranslation) {
        throw new Error("No translation received from Gemini")
      }

      const detectedLanguage = sourceLang === "auto" ? "auto-detected" : undefined

      // Simulate streaming by sending the translation word by word
      const words = fullTranslation.split(" ")
      let partialText = ""

      for (let i = 0; i < words.length; i++) {
        partialText += (i > 0 ? " " : "") + words[i]

        yield {
          language: targetLang,
          text: partialText,
          isComplete: i === words.length - 1,
          detectedLanguage: i === 0 ? detectedLanguage : undefined,
        }

        // Add delay to simulate real-time streaming
        await new Promise((resolve) => setTimeout(resolve, 150 + Math.random() * 200))
      }
    } catch (error) {
      console.error(`Streaming translation error for ${targetLang}:`, error)
      yield {
        language: targetLang,
        text: `Translation error for ${targetLang}`,
        isComplete: true,
      }
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json()
    const { text, inputLang, outputLangs } = body

    // Validate input
    if (!text || !text.trim()) {
      return new Response("Text is required", { status: 400 })
    }

    if (!outputLangs || outputLangs.length === 0) {
      return new Response("At least one output language is required", { status: 400 })
    }

    // Rate limiting check
    if (text.length > 5000) {
      return new Response("Text too long. Maximum 5000 characters allowed.", { status: 400 })
    }

    const sourceLang = LANGUAGE_CODES[inputLang] || "auto"

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()

        try {
          // Send initial event
          const startEvent = `data: ${JSON.stringify({
            type: "start",
            message: "Translation started",
          })}\n\n`
          controller.enqueue(encoder.encode(startEvent))

          for await (const chunk of streamTranslateWithGemini(text, sourceLang, outputLangs)) {
            const chunkEvent = `data: ${JSON.stringify({
              type: "translation",
              ...chunk,
            })}\n\n`
            controller.enqueue(encoder.encode(chunkEvent))
          }

          // Send completion event
          const endEvent = `data: ${JSON.stringify({
            type: "complete",
            message: "Translation completed",
          })}\n\n`
          controller.enqueue(encoder.encode(endEvent))
        } catch (error) {
          console.error("Streaming translation error:", error)
          const errorEvent = `data: ${JSON.stringify({
            type: "error",
            message: "Translation failed",
          })}\n\n`
          controller.enqueue(encoder.encode(errorEvent))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Stream translation API error:", error)
    return new Response("Internal server error", { status: 500 })
  }
}
