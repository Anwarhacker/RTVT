"use client";

import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";

interface StatusIndicatorProps {
  isTranslating: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  isCorrectingGrammar: boolean;
}

export function StatusIndicator({
  isTranslating,
  isSpeaking,
  isStreaming,
  isCorrectingGrammar,
}: StatusIndicatorProps) {
  if (!isTranslating && !isSpeaking && !isStreaming && !isCorrectingGrammar) {
    return null;
  }

  return (
    <div className="fixed  bg-red-700 bottom-6 right-6 z-50 animate-scale-in">
      <Badge
        variant="secondary"
        className="px-4 py-3 shadow-lg bg-card/90 backdrop-blur-sm border border-border/50"
      >
        <div className="flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <span className="text-sm font-medium">
            {isCorrectingGrammar
              ? "Correcting grammar..."
              : isStreaming
              ? "Streaming translation..."
              : isTranslating
              ? "Translating..."
              : "Speaking..."}
          </span>
        </div>
      </Badge>
    </div>
  );
}
