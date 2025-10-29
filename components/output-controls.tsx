"use client";

import React, { useCallback, memo } from "react";
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
import {
  Languages,
  Plus,
  X,
  Play,
  Copy,
  Volume2,
  BookOpen,
  Square,
} from "lucide-react";

interface OutputLanguage {
  code: string;
  name: string;
  text: string;
}

interface OutputControlsProps {
  outputLanguages: OutputLanguage[];
  onAddOutputLanguage: () => void;
  onRemoveOutputLanguage: (index: number) => void;
  onUpdateOutputLanguage: (index: number, code: string) => void;
  onPlayAudio: (text: string, languageCode: string, index?: number) => void;
  onCopyToClipboard: (text: string) => void;
  onDownloadAudio: (
    text: string,
    languageCode: string,
    filename: string
  ) => void;
  currentPlayingIndex: number | null;
  isSpeaking: boolean;
  isTTSSupported: boolean;
  isStreaming: boolean;
  streamingResults: Record<string, string>;
  languages: Array<{ code: string; name: string }>;
}

const OutputControlsComponent = memo(function OutputControlsComponent({
  outputLanguages,
  onAddOutputLanguage,
  onRemoveOutputLanguage,
  onUpdateOutputLanguage,
  onPlayAudio,
  onCopyToClipboard,
  onDownloadAudio,
  currentPlayingIndex,
  isSpeaking,
  isTTSSupported,
  isStreaming,
  streamingResults,
  languages,
}: OutputControlsProps) {
  return (
    <Card className="p-6 lg:p-8 shadow-lg border border-border/50 bg-card/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 rounded-2xl">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-2 sm:p-3 bg-accent/10 rounded-lg sm:rounded-xl">
              <Languages className="h-5 w-5 sm:h-6 sm:w-6 text-accent" />
            </div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-card-foreground">
              Output
            </h2>
          </div>
          <Button
            onClick={onAddOutputLanguage}
            variant="outline"
            size="sm"
            className="self-start sm:self-auto bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02] text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Language
          </Button>
        </div>

        <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 lg:max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          {outputLanguages.map((output, index) => (
            <Card
              key={index}
              className="p-3 sm:p-4 lg:p-6 bg-background/40 border border-border/30 hover:bg-background/60 transition-all duration-300 animate-slide-up rounded-lg sm:rounded-xl shadow-sm"
            >
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-2 xs:gap-3">
                  <Select
                    value={output.code}
                    onValueChange={(value) =>
                      onUpdateOutputLanguage(index, value)
                    }
                  >
                    <SelectTrigger className="w-full xs:w-32 sm:w-36 bg-background/50 text-sm">
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

                  <div className="flex items-center gap-2 self-start xs:self-auto">
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
                      className="hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="min-h-16 sm:min-h-20 lg:min-h-24 p-3 sm:p-4 bg-background/80 rounded-lg sm:rounded-xl border border-border/30 text-sm lg:text-base shadow-inner">
                  {output.text ? (
                    <div
                      className="max-h-32 sm:max-h-40 lg:max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                      style={{
                        width: "100%",
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      <ClickableText
                        text={output.text}
                        language={output.name}
                        className="leading-relaxed whitespace-pre-wrap break-words block w-full"
                      />
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Translation will appear here...
                    </span>
                  )}
                </div>

                <div className="flex flex-col xs:flex-row gap-2">
                  <Button
                    onClick={() => onPlayAudio(output.text, output.code, index)}
                    variant="outline"
                    size="sm"
                    disabled={!output.text || !isTTSSupported}
                    className="flex-1 xs:flex-none bg-background/60 hover:bg-background transition-all duration-300 hover:scale-[1.02] py-2 rounded-lg shadow-sm text-xs sm:text-sm"
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
                    className="flex-1 xs:flex-none bg-background/60 hover:bg-background transition-all duration-300 hover:scale-[1.02] py-2 rounded-lg shadow-sm text-xs sm:text-sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    onClick={() =>
                      onDownloadAudio(
                        output.text,
                        output.code,
                        `translation-${output.name}-${Date.now()}.wav`
                      )
                    }
                    variant="outline"
                    size="sm"
                    disabled={!output.text || !isTTSSupported}
                    className="flex-1 xs:flex-none bg-background/60 hover:bg-background transition-all duration-300 hover:scale-[1.02] py-2 rounded-lg shadow-sm text-xs sm:text-sm"
                    title="Download audio as file"
                  >
                    <Volume2 className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <GrammarAnalysisDialog
                    text={output.text}
                    language={output.name}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!output.text}
                      className="flex-1 xs:flex-none bg-background/60 hover:bg-background transition-all duration-300 hover:scale-[1.02] py-2 rounded-lg shadow-sm text-xs sm:text-sm"
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
});

export const OutputControls = OutputControlsComponent;
