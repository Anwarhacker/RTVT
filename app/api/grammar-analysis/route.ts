import { type NextRequest, NextResponse } from "next/server"

const GEMINI_API_KEY = "AIzaSyCH11Alz5Zq7vqna7bC4-Up81JVmQx6zBI"

export async function POST(request: NextRequest) {
  try {
    const { text, language } = await request.json()

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    console.log("[v0] Grammar analysis request:", { text, language })

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
                  text: `Analyze the grammatical structure of this ${language} text and identify parts of speech for each word. Return a JSON object with the following structure:
                  {
                    "words": [
                      {
                        "word": "example",
                        "pos": "noun",
                        "definition": "brief definition",
                        "role": "grammatical role in sentence"
                      }
                    ],
                    "sentence_structure": "brief explanation of sentence structure",
                    "grammar_notes": "any notable grammatical features"
                  }
                  
                  Text to analyze: "${text}"
                  
                  Use these part-of-speech tags: noun, verb, adjective, adverb, pronoun, preposition, conjunction, interjection, article, determiner, auxiliary, modal.`,
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
    console.log("[v0] Gemini API response:", data)

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const analysisText = data.candidates[0].content.parts[0].text

      try {
        // Extract JSON from the response
        const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const analysis = JSON.parse(jsonMatch[0])
          return NextResponse.json({
            success: true,
            analysis,
          })
        } else {
          throw new Error("No JSON found in response")
        }
      } catch (parseError) {
        console.error("[v0] JSON parsing error:", parseError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to parse grammar analysis",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: "No analysis generated",
      },
      { status: 500 },
    )
  } catch (error) {
    console.error("[v0] Grammar analysis error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Grammar analysis failed",
      },
      { status: 500 },
    )
  }
}
