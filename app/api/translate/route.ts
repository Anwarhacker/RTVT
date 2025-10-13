import { type NextRequest, NextResponse } from "next/server"

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
  stream?: boolean
}

interface TranslationResult {
  language: string
  text: string
  detectedLanguage?: string
}

async function translateWithGemini(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<{ translatedText: string; detectedLanguage?: string }> {
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

  const targetLanguageName = languageNames[targetLang] || targetLang
  const sourceLanguageName = sourceLang === "auto" ? "the detected language" : languageNames[sourceLang] || sourceLang

  const prompt =
    sourceLang === "auto"
      ? `Translate the following text to ${targetLanguageName}. Only return the translated text, nothing else: "${text}"`
      : `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. Only return the translated text, nothing else: "${text}"`

  try {
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

    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim()

    if (!translatedText) {
      throw new Error("No translation received from Gemini")
    }

    return {
      translatedText,
      detectedLanguage: sourceLang === "auto" ? "auto-detected" : undefined,
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json()
    const { text, inputLang, outputLangs, stream = false } = body

    console.log("[v0] Translation request:", { text: text.substring(0, 100), inputLang, outputLangs, stream })

    // Validate input
    if (!text || !text.trim()) {
      console.log("[v0] Translation error: No text provided")
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!outputLangs || outputLangs.length === 0) {
      console.log("[v0] Translation error: No output languages")
      return NextResponse.json({ error: "At least one output language is required" }, { status: 400 })
    }

    // Rate limiting check (basic implementation)
    if (text.length > 5000) {
      console.log("[v0] Translation error: Text too long:", text.length)
      return NextResponse.json({ error: "Text too long. Maximum 5000 characters allowed." }, { status: 400 })
    }

    const sourceLang = LANGUAGE_CODES[inputLang] || "auto"
    const results: TranslationResult[] = []

    console.log("[v0] Processing translations for languages:", outputLangs)

    for (const targetLang of outputLangs) {
      const targetCode = LANGUAGE_CODES[targetLang]
      if (!targetCode) {
        console.log("[v0] Skipping unsupported language:", targetLang)
        continue
      }

      try {
        console.log("[v0] Translating to:", targetLang, targetCode)
        const translation = await translateWithGemini(text, sourceLang, targetCode)

        results.push({
          language: targetLang,
          text: translation.translatedText,
          detectedLanguage: translation.detectedLanguage,
        })
        console.log("[v0] Translation successful for:", targetLang)
      } catch (error) {
        console.error("[v0] Translation error for", targetLang, ":", error)
        results.push({
          language: targetLang,
          text: `Translation error: ${error instanceof Error ? error.message : "Unknown error"}`,
        })
      }
    }

    console.log("[v0] Translation results:", results.length, "translations completed")
    return NextResponse.json({
      success: true,
      translations: results,
      detectedLanguage: results[0]?.detectedLanguage,
    })
  } catch (error) {
    console.error("[v0] Translation API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
