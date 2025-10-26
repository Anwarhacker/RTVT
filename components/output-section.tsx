"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ClickableText } from "@/components/clickable-text";
import { GrammarAnalysisDialog } from "@/components/grammar-analysis-dialog";
import { Languages, Plus, X, Play, Square, Copy, BookOpen } from "lucide-react";

interface Language {
  code: string;
  name: string;
}

interface OutputLanguage {
  code: string;
  name: string;
  text: string;
}

interface OutputSectionProps {
  outputLanguages: OutputLanguage[];
  languages: Language[];
  isStreaming: boolean;
  streamingResults: Record<string, string>;
  isTTSSupported: boolean;
  currentPlayingIndex: number | null;
  isSpeaking: boolean;
  onAddOutputLanguage: () => void;
  onRemoveOutputLanguage: (index: number) => void;
  onUpdateOutputLanguage: (index: number, code: string) => void;
  onPlayAudio: (text: string, languageCode: string, index: number) => void;
  onCopyToClipboard: (text: string) => void;
}

export function OutputSection({
  outputLanguages,
  languages,
  isStreaming,
  streamingResults,
  isTTSSupported,
  currentPlayingIndex,
  isSpeaking,
  onAddOutputLanguage,
  onRemoveOutputLanguage,
  onUpdateOutputLanguage,
  onPlayAudio,
  onCopyToClipboard,
}: OutputSectionProps) {
  return (
    <Card className="p-6 lg:p-8 border-2 border-border bg-card border-primary/50 transition-all duration-300 rounded-2xl bg-gray-100">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2 bg-secondary/10 rounded-lg">
              <Languages className="h-5 w-5 text-black text-center" />
            </div>
            <h2 className="text-2xl lg:text-2xl font-bold text-card-foreground">
              Output
            </h2>
          </div>
          <Button
            onClick={onAddOutputLanguage}
            variant="outline"
            size="sm"
            className="self-end sm:self-auto bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4">
          {outputLanguages.map((output, index) => (
            <Card
              key={index}
              className="p-4 lg:p-5 bg-gray-50 border border-primary/40 hover:bg-gray-100 transition-all duration-200 animate-slide-up rounded-xl min-w-70 flex-shrink-0"
            >
              <div className="space-y-4 ">
                <div className="flex justify-between gap-3 ">
                  <Select
                    value={output.code}
                    onValueChange={(value) =>
                      onUpdateOutputLanguage(index, value)
                    }
                  >
                    <SelectTrigger className="w-36 ">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages
                        .filter((lang) => lang.code !== "auto")
                        .map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {isStreaming && streamingResults[output.code] && (
                      <Badge
                        variant="secondary"
                        className="text-xs animate-scale-in"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                          Streaming
                        </div>
                      </Badge>
                    )}
                    <Button
                      onClick={() => onRemoveOutputLanguage(index)}
                      variant="ghost"
                      size="sm"
                      className="hover:bg-gray-200 hover:text-black transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="min-h-20 lg:min-h-24 p-4 bg-white rounded-xl border-2 border-gray-300 text-sm lg:text-base overflow-hidden">
                  {output.text ? (
                    <ClickableText
                      text={output.text}
                      language={output.name}
                      className="leading-relaxed break-words word-wrap overflow-wrap-anywhere whitespace-pre-wrap"
                    />
                  ) : (
                    <span className="text-muted-foreground italic">
                      Translation will appear here...
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => onPlayAudio(output.text, output.code, index)}
                    variant="outline"
                    size="sm"
                    disabled={!output.text || !isTTSSupported}
                    className="flex-1 sm:flex-none bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02] py-2 rounded-xl"
                  >
                    {currentPlayingIndex === index && isSpeaking ? (
                      <>
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Play
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => onCopyToClipboard(output.text)}
                    variant="outline"
                    size="sm"
                    disabled={!output.text}
                    className="flex-1 sm:flex-none bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02] py-2 rounded-xl"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <GrammarAnalysisDialog
                    text={output.text}
                    language={output.name}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!output.text}
                      className="flex-1 sm:flex-none bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02] py-2 rounded-xl"
                    >
                      <BookOpen className="h-4 w-4 mr-2" />
                      Grammar
                    </Button>
                  </GrammarAnalysisDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {outputLanguages.length === 0 && (
          <div className="text-center py-8 lg:py-12 text-muted-foreground animate-fade-in">
            <div className="p-4 bg-muted/30 rounded-2xl inline-block mb-4">
              <Languages className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <p className="text-base lg:text-lg mb-4">
              No output languages selected
            </p>
            <Button
              onClick={onAddOutputLanguage}
              variant="outline"
              className="bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add your first language
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
