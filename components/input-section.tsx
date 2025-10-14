"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Sparkles,
  Volume2,
  Zap,
  Globe,
  RotateCcw,
  Square,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Language {
  code: string;
  name: string;
}

interface InputSectionProps {
  inputText: string;
  inputLanguage: string;
  detectedLanguage: string | null;
  languages: Language[];
  isListening: boolean;
  isSpeechSupported: boolean;
  interimTranscript: string;
  autoTranslate: boolean;
  autoPlay: boolean;
  grammarCorrectionEnabled: boolean;
  streamingMode: boolean;
  speechSpeed: number;
  isCorrectingGrammar: boolean;
  isTranslating: boolean;
  isStreaming: boolean;
  onInputTextChange: (value: string) => void;
  onInputLanguageChange: (value: string) => void;
  onToggleRecording: () => void;
  onAutoTranslateChange: (checked: boolean) => void;
  onAutoPlayChange: (checked: boolean) => void;
  onGrammarCorrectionChange: (checked: boolean) => void;
  onStreamingModeChange: (checked: boolean) => void;
  onSpeechSpeedChange: (speed: number) => void;
  onTranslate: () => void;
  onReset: () => void;
}

export function InputSection({
  inputText,
  inputLanguage,
  detectedLanguage,
  languages,
  isListening,
  isSpeechSupported,
  interimTranscript,
  autoTranslate,
  autoPlay,
  grammarCorrectionEnabled,
  streamingMode,
  speechSpeed,
  isCorrectingGrammar,
  isTranslating,
  isStreaming,
  onInputTextChange,
  onInputLanguageChange,
  onToggleRecording,
  onAutoTranslateChange,
  onAutoPlayChange,
  onGrammarCorrectionChange,
  onStreamingModeChange,
  onSpeechSpeedChange,
  onTranslate,
  onReset,
}: InputSectionProps) {
  const [showSmartFeatures, setShowSmartFeatures] = useState(false);

  return (
    <Card className="p-6 lg:p-8 border-2 border-border bg-card hover:border-primary/50 transition-all duration-300 rounded-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#10B981] rounded-lg">
              <Mic className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl lg:text-2xl font-bold text-card-foreground">
              Input
            </h2>
          </div>
        </div>

        <Textarea
          placeholder="Type or speak your text here..."
          value={inputText}
          onChange={(e) => onInputTextChange(e.target.value)}
          className="min-h-32 lg:min-h-40 resize-none text-base bg-background/60 border-border/40 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
        />

        <div className="space-y-4">
          <Button
            onClick={onToggleRecording}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            className="w-full bg-[#10B981] h-14 text-base font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
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

          <div className="flex gap-3">
            <Button
              onClick={onTranslate}
              disabled={
                !inputText.trim() ||
                (isTranslating && !streamingMode) ||
                isCorrectingGrammar
              }
              className="flex-1 h-12 font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
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
                  <div className="w-4 h-4 mr-2 border-2 border-primary-foreground bg-[#E5E7EB] border-t-transparent rounded-full animate-spin" />
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
              className="px-6 h-12 font-semibold bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] rounded-xl"
              title="Reset all inputs and outputs"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-3 p-4 bg-secondary/20 rounded-xl border-2 border-border">
          <button
            onClick={() => setShowSmartFeatures(!showSmartFeatures)}
            className="w-full text-left"
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Smart Features
              </span>
              {showSmartFeatures ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </h3>
          </button>
          {showSmartFeatures && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="auto-translate"
                  checked={autoTranslate}
                  onChange={(e) => onAutoTranslateChange(e.target.checked)}
                  className="rounded border-border bg-[#10B981] accent-primary"
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
                  onChange={(e) => onAutoPlayChange(e.target.checked)}
                  className="rounded border-border bg-[#10B981]"
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
                  onChange={(e) => onGrammarCorrectionChange(e.target.checked)}
                  className="rounded border-border accent-primary"
                />
                <label
                  htmlFor="grammar-correction"
                  className="text-sm text-muted-foreground"
                >
                  Auto-correct grammar & spelling
                </label>
              </div>

              <div className="flex items-center gap-3 sm:col-span-2">
                <input
                  type="checkbox"
                  id="streaming-mode"
                  checked={streamingMode}
                  onChange={(e) => onStreamingModeChange(e.target.checked)}
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

              <div className="flex flex-col border border-black py-3 mt-2 items-center rounded-2xl gap-3 sm:col-span-2">
                <label
                  htmlFor="speech-speed"
                  className="text-sm text-muted-foreground flex items-center gap-2"
                >
                  <Volume2 className="h-4 w-4 text-primary" />
                  Speech Speed: {speechSpeed}x
                </label>
                <input
                  type="range"
                  id="speech-speed"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={speechSpeed}
                  onChange={(e) =>
                    onSpeechSpeedChange(parseFloat(e.target.value))
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
          )}
        </div>

        {isListening && (
          <div className="space-y-3 p-4 bg-primary/10 border border-primary/30 rounded-xl animate-scale-in shadow-sm">
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
}
