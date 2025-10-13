import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyCH11Alz5Zq7vqna7bC4-Up81JVmQx6zBI"
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] Grammar correction request:", { text })

    const response = await fetch(GEMINI_API_URL, {
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
                text: `Please correct the grammar, spelling, punctuation, and improve the clarity of the following text. Keep the original meaning and tone. Only return the corrected text without any explanations or additional formatting:

"${text}"`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("[v0] Gemini API error:", errorData)
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("[v0] Grammar correction response:", data)

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const correctedText = data.candidates[0].content.parts[0].text.trim()

      return NextResponse.json({
        success: true,
        originalText: text,
        correctedText: correctedText,
      })
    } else {
      throw new Error("Invalid response format from Gemini API")
    }
  } catch (error) {
    console.error("[v0] Grammar correction error:", error)
    return NextResponse.json(
      {
        error: "Grammar correction failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
