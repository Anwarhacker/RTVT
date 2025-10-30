"use client";

import React, { useState, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Mic,
  MicOff,
  AlertCircle,
  Sparkles,
  Volume2,
  Zap,
  Square,
  Globe,
  RotateCcw,
  Languages,
} from "lucide-react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { LoadingSpinner } from "@/components/loading-spinner";

interface InputControlsProps {
  inputText: string;
  setInputText: (text: string) => void;
  inputLanguage: string;
  detectedLanguage: string | null;
  autoTranslate: boolean;
  setAutoTranslate: (enabled: boolean) => void;
  autoPlay: boolean;
  setAutoPlay: (enabled: boolean) => void;
  grammarCorrectionEnabled: boolean;
  setGrammarCorrectionEnabled: (enabled: boolean) => void;
  streamingMode: boolean;
  setStreamingMode: (enabled: boolean) => void;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;
  onTranslate: () => void;
  onReset: () => void;
  isTranslating: boolean;
  isCorrectingGrammar: boolean;
  speechError: string | null;
  translationError: string | null;
  isSpeechSupported: boolean;
  isTTSSupported: boolean;
  onRecordingToggle: () => void;
  isListening: boolean;
  interimTranscript: string;
  isStreaming: boolean;
  speechOutputLanguage: string;
  setSpeechOutputLanguage: (language: string) => void;
  languages: Array<{ code: string; name: string }>;
}

const InputControlsComponent = memo(function InputControlsComponent({
  inputText,
  setInputText,
  inputLanguage,
  detectedLanguage,
  autoTranslate,
  setAutoTranslate,
  autoPlay,
  setAutoPlay,
  grammarCorrectionEnabled,
  setGrammarCorrectionEnabled,
  streamingMode,
  setStreamingMode,
  speechSpeed,
  setSpeechSpeed,
  onTranslate,
  onReset,
  isTranslating,
  isCorrectingGrammar,
  speechError,
  translationError,
  isSpeechSupported,
  isTTSSupported,
  onRecordingToggle,
  isListening,
  interimTranscript,
  isStreaming,
  speechOutputLanguage,
  setSpeechOutputLanguage,
  languages,
}: InputControlsProps) {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingSpinner size="lg" message="Loading input controls..." />;
  }

  return (
    <Card className="p-6 lg:p-8 shadow-lg border border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
              <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-card-foreground">
              Input
            </h2>
          </div>
          <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 flex-wrap">
            {detectedLanguage && inputLanguage === "auto" && (
              <Badge variant="secondary" className="text-xs animate-scale-in">
                Detected: {detectedLanguage}
              </Badge>
            )}
          </div>
        </div>

        <Textarea
          placeholder="Type or speak your text here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="min-h-24 sm:min-h-32 lg:min-h-40 resize-none text-sm sm:text-base bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
        />

        <div className="space-y-3 sm:space-y-4 p-3 sm:p-5 bg-muted/20 rounded-lg sm:rounded-xl border border-border/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Smart Features
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto-translate"
                checked={autoTranslate}
                onChange={(e) => setAutoTranslate(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <label
                htmlFor="auto-translate"
                className="text-sm text-muted-foreground"
              >
                Auto-translate as I speak
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="auto-play"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <label
                htmlFor="auto-play"
                className="text-sm text-muted-foreground"
              >
                Auto-play translated speech
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="grammar-correction"
                checked={grammarCorrectionEnabled}
                onChange={(e) => setGrammarCorrectionEnabled(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <label
                htmlFor="grammar-correction"
                className="text-sm text-muted-foreground"
              >
                Auto-correct grammar & spelling
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="streaming-mode"
                checked={streamingMode}
                onChange={(e) => setStreamingMode(e.target.checked)}
                className="rounded border-border accent-primary"
              />
              <label
                htmlFor="streaming-mode"
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                <Zap className="h-4 w-4 text-primary" />
                Real-time streaming mode
              </label>
            </div>

            <div className="flex flex-col gap-2 p-3 bg-background/50 rounded-lg">
              <label
                htmlFor="speech-speed"
                className="text-sm text-muted-foreground flex items-center gap-2"
              >
                <Volume2 className="h-4 w-4 text-primary" />
                Speech Speed: {speechSpeed}x
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  id="speech-speed"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechSpeed}
                  onChange={(e) =>
                    setSpeechSpeed(Number.parseFloat(e.target.value))
                  }
                  className="flex-1 accent-primary"
                />
                <span className="text-xs text-muted-foreground min-w-[3rem] text-right">
                  {speechSpeed === 0.5
                    ? "Slow"
                    : speechSpeed === 1
                    ? "Normal"
                    : speechSpeed === 2
                    ? "Fast"
                    : "Custom"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-3 sm:p-5 bg-muted/20 rounded-lg sm:rounded-xl border border-border/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Languages className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            Speech Translation Language
          </h3>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="speech-output-language"
              className="text-sm text-muted-foreground"
            >
              Translate speech to:
            </label>
            <select
              id="speech-output-language"
              value={speechOutputLanguage}
              onChange={(e) => setSpeechOutputLanguage(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {languages
                .filter((lang) => lang.code !== "auto")
                .map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onRecordingToggle}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="w-full h-12 sm:h-14 lg:h-16 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-lg sm:rounded-xl shadow-lg"
            disabled={!isSpeechSupported}
          >
            {isListening ? (
              <>
                <MicOff className="h-5 w-5 mr-3" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="h-5 w-5 mr-3" />
                Start Recording
              </>
            )}
          </Button>

          <div className="flex flex-col xs:flex-row gap-2 xs:gap-3">
            <Button
              onClick={onTranslate}
              disabled={
                !inputText.trim() ||
                (isTranslating && !streamingMode) ||
                isCorrectingGrammar
              }
              className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-lg sm:rounded-xl"
            >
              {isCorrectingGrammar ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Correcting Grammar...
                </>
              ) : streamingMode ? (
                isStreaming ? (
                  <>
                    <Square className="h-4 w-4 mr-2" />
                    Stop Stream
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Start Stream
                  </>
                )
              ) : isTranslating ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Globe className="h-4 w-4 mr-2" />
                  Translate
                </>
              )}
            </Button>

            <Button
              onClick={onReset}
              variant="outline"
              className="px-4 sm:px-6 h-10 sm:h-12 text-sm sm:text-base font-semibold bg-background/50 hover:bg-background transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] rounded-lg sm:rounded-xl"
              title="Reset all inputs and outputs"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {isListening && (
          <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg animate-scale-in">
            <div className="flex items-center gap-3 text-sm font-medium text-primary">
              <div className="relative">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-ping opacity-75" />
              </div>
              Listening for speech...
            </div>
            {interimTranscript && isListening && (
              <div className="text-sm text-muted-foreground italic p-3 bg-background/50 rounded border border-border/50">
                "{interimTranscript}"
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
});

export const InputControls = InputControlsComponent;
