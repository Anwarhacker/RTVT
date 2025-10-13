"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, BookOpen, Loader2 } from "lucide-react"

interface ClickableTextProps {
  text: string
  language?: string
  className?: string
}

interface WordInfo {
  word: string
  explanation: string
  language: string
}

export function ClickableText({ text, language, className = "" }: ClickableTextProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [wordInfo, setWordInfo] = useState<WordInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPopup, setShowPopup] = useState(false)

  const handleWordClick = async (word: string, event: React.MouseEvent) => {
    // Clean the word (remove punctuation)
    const cleanWord = word.replace(/[^\w\s]/g, "").trim()
    if (!cleanWord) return

    setSelectedWord(cleanWord)
    setShowPopup(true)
    setIsLoading(true)
    setWordInfo(null)

    try {
      const response = await fetch("/api/word-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          word: cleanWord,
          sentence: text,
          language: language || "English",
        }),
      })

      const data = await response.json()

      if (data.success) {
        setWordInfo(data)
      } else {
        console.error("Failed to get word info:", data.error)
      }
    } catch (error) {
      console.error("Error fetching word info:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const closePopup = () => {
    setShowPopup(false)
    setSelectedWord(null)
    setWordInfo(null)
  }

  // Split text into words while preserving spaces and punctuation
  const renderClickableText = () => {
    const words = text.split(/(\s+)/)

    return words.map((part, index) => {
      if (/^\s+$/.test(part)) {
        // This is whitespace, render as-is
        return <span key={index}>{part}</span>
      } else {
        // This is a word, make it clickable
        return (
          <span
            key={index}
            className="cursor-pointer hover:bg-primary/10 hover:text-primary rounded px-1 py-0.5 transition-colors duration-200 inline-block"
            onClick={(e) => handleWordClick(part, e)}
            title="Click for word information"
          >
            {part}
          </span>
        )
      }
    })
  }

  return (
    <div className="relative">
      <div className={`select-text ${className}`}>{renderClickableText()}</div>

      {/* Word Information Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full max-h-[80vh] overflow-y-auto bg-card border shadow-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Word Information</h3>
                </div>
                <Button onClick={closePopup} variant="ghost" size="sm" className="hover:bg-muted">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {selectedWord && (
                <div className="mb-4">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    "{selectedWord}"
                  </Badge>
                  {language && (
                    <Badge variant="outline" className="ml-2">
                      {language}
                    </Badge>
                  )}
                </div>
              )}

              <div className="space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Getting word information...</span>
                  </div>
                ) : wordInfo ? (
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{wordInfo.explanation}</div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>Unable to load word information.</p>
                    <Button
                      onClick={() => handleWordClick(selectedWord || "", {} as React.MouseEvent)}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      Try Again
                    </Button>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t">
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Click on any word in translations to learn more about it
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
