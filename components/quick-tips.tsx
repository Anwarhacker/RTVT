"use client"

import { Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"

export function QuickTips() {
  return (
    <div className="mt-12 mb-8 animate-fade-in">
      <Card className="p-6 lg:p-8 bg-card/50 border-0">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Quick Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p>Click the microphone to start voice input and speak clearly for best results</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p>Enable auto-translate to get instant translations as you speak</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
            <p>Use streaming mode for real-time word-by-word translation</p>
          </div>
        </div>
      </Card>
    </div>
  )
}