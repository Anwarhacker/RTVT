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
      // Clean the content by removing markdown code blocks if present
      let cleanContent = content;
      if (content.startsWith('```json')) {
        cleanContent = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        cleanContent = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const translations = JSON.parse(cleanContent);
      console.log("[DICTIONARY API] Parsed translations successfully");
      return NextResponse.json({ translations });
    } catch (parseError) {
      console.warn("[DICTIONARY API] JSON parse error:", parseError);

      // Try to extract JSON from the content if it's embedded
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log("[DICTIONARY API] Extracted JSON successfully");
          return NextResponse.json({ translations: extractedJson });
        }
      } catch (extractError) {
        console.warn("[DICTIONARY API] Failed to extract JSON:", extractError);
      }

      // Try to manually construct translations from the raw content
      try {
        console.log("[DICTIONARY API] Attempting manual parsing of raw content");
        const lines = content.split('\n').filter(line => line.trim());

        // Look for word-translation pairs in the content
        const manualTranslations: Array<{word: string, translation: string}> = [];
        const wordRegex = /"word"\s*:\s*"([^"]+)"/g;
        const translationRegex = /"translation"\s*:\s*"([^"]+)"/g;

        let wordMatch;
        let translationMatch;
        const words: string[] = [];
        const translations: string[] = [];

        while ((wordMatch = wordRegex.exec(content)) !== null) {
          words.push(wordMatch[1]);
        }

        while ((translationMatch = translationRegex.exec(content)) !== null) {
          translations.push(translationMatch[1]);
        }

        // Pair words with translations
        const maxLength = Math.min(words.length, translations.length);
        for (let i = 0; i < maxLength; i++) {
          manualTranslations.push({
            word: words[i],
            translation: translations[i]
          });
        }

        if (manualTranslations.length > 0) {
          console.log("[DICTIONARY API] Manual parsing successful");
          return NextResponse.json({ translations: manualTranslations });
        }
      } catch (manualError) {
        console.warn("[DICTIONARY API] Manual parsing failed:", manualError);
      }

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
