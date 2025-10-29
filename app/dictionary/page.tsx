"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi" },
  { code: "kn", name: "Kannada" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "gu", name: "Gujarati" },
  { code: "mr", name: "Marathi" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "ur", name: "Urdu" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
];

interface WordMeaning {
  word: string;
  partOfSpeech: string;
  definition: string;
  example: string;
}

export default function DictionaryPage() {
  const [inputText, setInputText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [meanings, setMeanings] = useState<WordMeaning[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!inputText.trim()) return;

    console.log("[DICTIONARY PAGE] Starting search for:", inputText.trim());
    setIsLoading(true);
    try {
      const response = await fetch("/api/dictionary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: inputText.trim(),
          targetLanguage:
            languages.find((l) => l.code === targetLanguage)?.name || "English",
        }),
      });

      console.log("[DICTIONARY PAGE] Response status:", response.status);
      const data = await response.json();
      console.log("[DICTIONARY PAGE] Response data:", data);

      if (data.translations) {
        console.log(
          "[DICTIONARY PAGE] Setting translations:",
          data.translations
        );
        // Convert translations format to meanings format
        const formattedMeanings = data.translations.map((item: any) => ({
          word: item.word || Object.keys(item)[0],
          partOfSpeech: "noun", // Default part of speech
          definition: item.translation || Object.values(item)[0],
          example: "", // No example in this format
        }));
        setMeanings(formattedMeanings);
      } else if (data.meanings) {
        console.log("[DICTIONARY PAGE] Setting meanings:", data.meanings);
        setMeanings(data.meanings);
      } else {
        console.log(
          "[DICTIONARY PAGE] No translations or meanings in response"
        );
      }
    } catch (error) {
      console.error("[DICTIONARY PAGE] Dictionary search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4 mb-6 sm:mb-8">
          <Link href="/translator">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Translator
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
            <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Dictionary
          </h1>
        </div>

        <Card className="p-4 sm:p-6 shadow-lg border border-border/50 bg-card/95 backdrop-blur-sm rounded-xl sm:rounded-2xl">
          <div className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="lg:col-span-2">
                <Textarea
                  placeholder="Enter a word or sentence to get meanings..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-16 sm:min-h-20 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <Select
                  value={targetLanguage}
                  onValueChange={setTargetLanguage}
                >
                  <SelectTrigger className="text-sm sm:text-base">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleSearch}
                  disabled={!inputText.trim() || isLoading}
                  className="w-full rounded-lg shadow-sm text-sm sm:text-base h-9 sm:h-10"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {meanings.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Word Meanings
            </h2>
            <div className="grid gap-3 sm:gap-4">
              {meanings.map((meaning, index) => (
                <Card
                  key={index}
                  className="p-4 sm:p-5 hover:shadow-md transition-shadow border border-border/30 bg-card/90 rounded-lg sm:rounded-xl"
                >
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3">
                      <h3 className="text-lg sm:text-xl font-bold text-primary">
                        {meaning.word}
                      </h3>
                      <span className="px-2 sm:px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm rounded-full font-medium self-start">
                        {meaning.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-foreground leading-relaxed">
                      {meaning.definition}
                    </p>
                    {meaning.example && (
                      <div className="p-2 sm:p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                        <p className="text-xs sm:text-sm text-muted-foreground italic">
                          Example:
                        </p>
                        <p className="text-sm sm:text-base text-foreground">
                          {meaning.example}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
