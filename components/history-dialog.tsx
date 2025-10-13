"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { History, Download, Trash2, Copy, Play } from "lucide-react"
import { useTranslationHistory } from "@/hooks/use-translation-history"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface HistoryDialogProps {
  children?: React.ReactNode
}

export function HistoryDialog({ children }: HistoryDialogProps) {
  const [open, setOpen] = useState(false)
  const { history, removeEntry, clearHistory, exportHistory } = useTranslationHistory()
  const { speak, isSpeaking, stop } = useTextToSpeech()

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const playTranslation = (text: string, languageCode: string) => {
    if (isSpeaking) {
      stop()
    } else {
      speak(text, languageCode)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <History className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Translation History
            <div className="flex gap-2">
              <Button onClick={exportHistory} variant="outline" size="sm" disabled={history.length === 0}>
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button onClick={clearHistory} variant="outline" size="sm" disabled={history.length === 0}>
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[60vh]">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No translation history yet.</p>
                <p className="text-sm">Your translations will appear here.</p>
              </div>
            ) : (
              history.map((entry) => (
                <Card key={entry.id} className="p-4">
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(entry.timestamp)}
                        </Badge>
                        {entry.detectedLanguage && (
                          <Badge variant="outline" className="text-xs">
                            Detected: {entry.detectedLanguage}
                          </Badge>
                        )}
                      </div>
                      <Button onClick={() => removeEntry(entry.id)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Input Text */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Input ({entry.inputLanguage})</h4>
                        <Button onClick={() => copyToClipboard(entry.inputText)} variant="ghost" size="sm">
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm bg-muted p-2 rounded">{entry.inputText}</p>
                    </div>

                    {/* Translations */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Translations</h4>
                      <div className="space-y-2">
                        {entry.translations.map((translation, index) => (
                          <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-xs">
                                  {translation.languageName}
                                </Badge>
                              </div>
                              <p className="text-sm">{translation.text}</p>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => playTranslation(translation.text, translation.language)}
                                variant="ghost"
                                size="sm"
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => copyToClipboard(translation.text)} variant="ghost" size="sm">
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
