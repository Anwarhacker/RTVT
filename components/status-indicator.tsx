"use client";

import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";

interface StatusIndicatorProps {
  isTranslating: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  isCorrectingGrammar: boolean;
  isProcessingVoice: boolean;
}

export function StatusIndicator({
  isTranslating,
  isSpeaking,
  isStreaming,
  isCorrectingGrammar,
  isProcessingVoice,
}: StatusIndicatorProps) {
  if (
    !isTranslating &&
    !isSpeaking &&
    !isStreaming &&
    !isCorrectingGrammar &&
    !isProcessingVoice
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 shadow-2xl right-6 z-50 animate-scale-in">
      <Badge
        variant="secondary"
        className="px-4 py-3 shadow-lg backdrop-blur-sm border border-border/50"
      >
        <div className="flex items-center gap-3">
          <LoadingSpinner size="sm" />
          <span className="text-sm font-medium">
            {isProcessingVoice
              ? "Processing voice..."
              : isCorrectingGrammar
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
