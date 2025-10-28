import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const LANGUAGE_CODES: Record<string, string> = {
  en: 'en',
  es: 'es',
  fr: 'fr',
  de: 'de',
  zh: 'zh-cn',
  hi: 'hi',
};

async function translateWithGemini(
  text: string,
  sourceLang: string,
  targetLang: string,
): Promise<string> {
  const API_KEY = 'AIzaSyCH11Alz5Zq7vqna7bC4-Up81JVmQx6zBI';
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    'zh-cn': 'Chinese',
    hi: 'Hindi',
  };

  const targetLanguageName = languageNames[targetLang] || targetLang;
  const sourceLanguageName = sourceLang === 'auto' ? 'the detected language' : languageNames[sourceLang] || sourceLang;

  const prompt = `Translate the following text from ${sourceLanguageName} to ${targetLanguageName}. Only return the translated text, nothing else: "${text}"`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': API_KEY,
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
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Translation failed');
    }

    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!translatedText) {
      throw new Error('No translation received from Gemini');
    }

    return translatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrl, prompt, languages = ['en'] } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'No image URL provided' }, { status: 400 });
    }

    // Fetch the image from Cloudinary URL
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch image from URL' }, { status: 500 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString('base64');

    // Detect mime type from response or default to jpeg
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Analyze with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt || 'Analyze this image and provide a detailed summary of its content, including any text, objects, people, or scenes visible. Describe the overall theme and any notable details.' },
            {
              inlineData: {
                mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    });

    const summary = response.text || 'No summary generated';

    // Translate summary to requested languages
    const translations: Record<string, string> = {};
    for (const lang of languages) {
      if (lang === 'en') {
        translations[lang] = summary;
      } else {
        try {
          const translated = await translateWithGemini(summary, 'en', LANGUAGE_CODES[lang] || lang);
          translations[lang] = translated;
        } catch (error) {
          console.error(`Translation error for ${lang}:`, error);
          translations[lang] = `Translation error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        }
      }
    }

    return NextResponse.json({ summary: translations });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
