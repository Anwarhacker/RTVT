import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyCH11Alz5Zq7vqna7bC4-Up81JVmQx6zBI"

export async function POST(request: NextRequest) {
  try {
    const { word, sentence, language } = await request.json()

    if (!word || !sentence) {
      return NextResponse.json({ error: "Word and sentence are required" }, { status: 400 })
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": GEMINI_API_KEY,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Provide detailed information about the word "${word}" as used in this sentence: "${sentence}". 
                
                Please provide:
                1. Definition: Clear meaning of the word in this context
                2. Part of Speech: (noun, verb, adjective, etc.)
                3. Usage Context: How it's being used in this specific sentence
                4. Etymology: Brief origin of the word (if interesting)
                5. Synonyms: 2-3 alternative words with similar meaning
                6. Example: Another sentence using this word
                
                Language context: ${language || "English"}
                
                Format your response as a structured explanation that's educational and easy to understand.`,
                },
              ],
            },
          ],
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const explanation = data.candidates[0].content.parts[0].text

      return NextResponse.json({
        success: true,
        word,
        explanation,
        language: language || "English",
      })
    }

    throw new Error("No explanation generated")
  } catch (error) {
    console.error("Word info API error:", error)
    return NextResponse.json({ error: "Failed to get word information" }, { status: 500 })
  }
}
