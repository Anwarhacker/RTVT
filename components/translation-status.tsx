"use client";

import React, { memo } from "react";
import { Badge } from "@/components/ui/badge";
import { StatusIndicator } from "@/components/status-indicator";

interface TranslationStatusProps {
  isTranslating: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  isCorrectingGrammar: boolean;
}

const TranslationStatusComponent = memo(function TranslationStatusComponent({
  isTranslating,
  isSpeaking,
  isStreaming,
  isCorrectingGrammar,
}: TranslationStatusProps) {
  return (
    <StatusIndicator
      isTranslating={isTranslating}
      isSpeaking={isSpeaking}
      isStreaming={isStreaming}
      isCorrectingGrammar={isCorrectingGrammar}
    />
  );
});

export const TranslationStatus = TranslationStatusComponent;
