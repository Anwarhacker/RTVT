import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "YOUR_API_KEY_HERE",
});

export async function POST(request: NextRequest) {
  console.log("[DICTIONARY API] Received request");

  try {
    const { text, targetLanguage } = await request.json();
    console.log("[DICTIONARY API] Request body:", { text, targetLanguage });

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Both 'text' and 'targetLanguage' are required" },
        { status: 400 }
      );
    }

    // Split text into individual words
    const words = text
      .split(/\s+/)
      .map((w: string) => w.trim())
      .filter(Boolean);

    // Simple word-to-word translation format
    const prompt = `Translate each word from "${text}" to ${targetLanguage}.

Return only JSON array like: [{"word": "english", "translation": "translated_word"}]

Example: [{"word": "hello", "translation": "नमस्ते"}, {"word": "world", "translation": "दुनिया"}]

No explanations, just JSON.`;

    console.log("[DICTIONARY API] Sending prompt to Groq...");

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "openai/gpt-oss-20b",
      temperature: 0.3,
      max_completion_tokens: 2048,
      top_p: 1,
      stream: false,
    });

    const content = chatCompletion.choices[0]?.message?.content?.trim() || "";
    console.log("[DICTIONARY API] Groq raw output:", content);

    try {
      const translations = JSON.parse(content);
      console.log("[DICTIONARY API] Parsed translations successfully");
      return NextResponse.json({ translations });
    } catch (parseError) {
      console.warn("[DICTIONARY API] JSON parse error:", parseError);
      return NextResponse.json({
        translations: [{ error: "Failed to parse response", raw: content }],
      });
    }
  } catch (error) {
    console.error("[DICTIONARY API] Error:", error);
    return NextResponse.json(
      { error: "Failed to translate words" },
      { status: 500 }
    );
  }
}
