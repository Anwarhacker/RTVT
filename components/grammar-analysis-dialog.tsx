"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { BookOpen, Loader2 } from "lucide-react"

interface GrammarWord {
  word: string
  pos: string
  definition: string
  role: string
}

interface GrammarAnalysis {
  words: GrammarWord[]
  sentence_structure: string
  grammar_notes: string
}

interface GrammarAnalysisDialogProps {
  text: string
  language: string
  children: React.ReactNode
}

const POS_COLORS: Record<string, string> = {
  noun: "bg-blue-100 text-blue-800 border-blue-200",
  verb: "bg-green-100 text-green-800 border-green-200",
  adjective: "bg-purple-100 text-purple-800 border-purple-200",
  adverb: "bg-orange-100 text-orange-800 border-orange-200",
  pronoun: "bg-pink-100 text-pink-800 border-pink-200",
  preposition: "bg-yellow-100 text-yellow-800 border-yellow-200",
  conjunction: "bg-indigo-100 text-indigo-800 border-indigo-200",
  interjection: "bg-red-100 text-red-800 border-red-200",
  article: "bg-gray-100 text-gray-800 border-gray-200",
  determiner: "bg-teal-100 text-teal-800 border-teal-200",
  auxiliary: "bg-cyan-100 text-cyan-800 border-cyan-200",
  modal: "bg-emerald-100 text-emerald-800 border-emerald-200",
}

export function GrammarAnalysisDialog({ text, language, children }: GrammarAnalysisDialogProps) {
  const [analysis, setAnalysis] = useState<GrammarAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const analyzeGrammar = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/grammar-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, language }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Grammar analysis failed")
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis)
      } else {
        throw new Error("No analysis received")
      }
    } catch (error) {
      console.error("Grammar analysis error:", error)
      setError(error instanceof Error ? error.message : "Analysis failed")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !analysis && !isLoading) {
      analyzeGrammar()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Grammar Analysis - {language}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Original Text */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Original Text:</h3>
            <p className="text-sm bg-muted p-3 rounded border">{text}</p>
          </Card>

          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Analyzing grammar...</span>
            </div>
          )}

          {error && (
            <Card className="p-4 border-destructive">
              <p className="text-destructive text-sm">{error}</p>
              <Button onClick={analyzeGrammar} variant="outline" size="sm" className="mt-2 bg-transparent">
                Try Again
              </Button>
            </Card>
          )}

          {analysis && (
            <>
              {/* Word Analysis */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4">Parts of Speech:</h3>
                <div className="space-y-3">
                  {analysis.words.map((word, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-muted/50 rounded border"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{word.word}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${POS_COLORS[word.pos] || "bg-gray-100 text-gray-800 border-gray-200"}`}
                        >
                          {word.pos}
                        </Badge>
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        <div>
                          <strong>Definition:</strong> {word.definition}
                        </div>
                        <div>
                          <strong>Role:</strong> {word.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Sentence Structure */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2">Sentence Structure:</h3>
                <p className="text-sm text-muted-foreground">{analysis.sentence_structure}</p>
              </Card>

              {/* Grammar Notes */}
              {analysis.grammar_notes && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Grammar Notes:</h3>
                  <p className="text-sm text-muted-foreground">{analysis.grammar_notes}</p>
                </Card>
              )}

              {/* Legend */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Parts of Speech Legend:</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {Object.entries(POS_COLORS).map(([pos, colorClass]) => (
                    <Badge key={pos} variant="outline" className={`text-xs justify-center ${colorClass}`}>
                      {pos}
                    </Badge>
                  ))}
                </div>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
