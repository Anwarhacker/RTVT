"use client";

import { useState, useEffect, memo } from "react";
import dynamic from "next/dynamic";
import {
  TranslationProvider,
  useTranslation,
} from "@/components/translation-provider";
import { IntroSection } from "@/components/intro-section";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { QuickTips } from "@/components/quick-tips";
import { InputControls } from "@/components/input-controls";
import { OutputControls } from "@/components/output-controls";
import { LanguageSelector } from "@/components/language-selector";
import { ErrorDisplay } from "@/components/error-display";
import { TranslationStatus } from "@/components/translation-status";
import { SettingsDialog } from "@/components/settings-dialog";
import { HistoryDialog } from "@/components/history-dialog";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

const VoiceTranslatorContent = memo(function VoiceTranslatorContent() {
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);

  const {
    inputText,
    setInputText,
    inputLanguage,
    setInputLanguage,
    outputLanguages,
    isTranslating,
    translationError,
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
    isCorrectingGrammar,
    speechError,
    isSpeechSupported,
    isTTSSupported,
    toggleRecording,
    isListening,
    interimTranscript,
    isStreaming,
    addOutputLanguage,
    removeOutputLanguage,
    updateOutputLanguage,
    playAudio,
    copyToClipboard,
    downloadAudio,
    currentPlayingIndex,
    isSpeaking,
    streamingResults,
    handleTranslate,
    resetAll,
    swapLanguages,
    languages,
    speechOutputLanguage,
    setSpeechOutputLanguage,
  } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleContinue = () => {
    setShowIntro(false);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg relative overflow-hidden">
      {showIntro && <IntroSection onContinue={handleContinue} />}

      {!showIntro && (
        <>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
            <AppHeader />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 lg:mb-8 gap-3 sm:gap-4 animate-slide-up">
              <div className="flex flex-wrap items-center gap-2">
                <HistoryDialog />
                <SettingsDialog />
                <Button
                  onClick={() => window.open("/dictionary", "_blank")}
                  variant="outline"
                  size="sm"
                  className="bg-background/60 hover:bg-background transition-all duration-300 hover:scale-[1.02] rounded-lg shadow-sm"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Dictionary
                </Button>
              </div>

              <LanguageSelector
                inputLanguage={inputLanguage}
                outputLanguage={outputLanguages[0]?.code || "en"}
                onInputLanguageChange={setInputLanguage}
                onOutputLanguageChange={(value) =>
                  updateOutputLanguage(0, value)
                }
                onSwapLanguages={swapLanguages}
                languages={languages}
              />
            </div>

            <ErrorDisplay
              translationError={translationError}
              speechError={speechError}
              isSpeechSupported={isSpeechSupported}
              isTTSSupported={isTTSSupported}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 animate-slide-up">
              <InputControls
                inputText={inputText}
                setInputText={setInputText}
                inputLanguage={inputLanguage}
                detectedLanguage={detectedLanguage}
                autoTranslate={autoTranslate}
                setAutoTranslate={setAutoTranslate}
                autoPlay={autoPlay}
                setAutoPlay={setAutoPlay}
                grammarCorrectionEnabled={grammarCorrectionEnabled}
                setGrammarCorrectionEnabled={setGrammarCorrectionEnabled}
                streamingMode={streamingMode}
                setStreamingMode={setStreamingMode}
                speechSpeed={speechSpeed}
                setSpeechSpeed={setSpeechSpeed}
                onTranslate={handleTranslate}
                onReset={resetAll}
                isTranslating={isTranslating}
                isCorrectingGrammar={isCorrectingGrammar}
                speechError={speechError}
                translationError={translationError}
                isSpeechSupported={isSpeechSupported}
                isTTSSupported={isTTSSupported}
                onRecordingToggle={toggleRecording}
                isListening={isListening}
                interimTranscript={interimTranscript}
                isStreaming={isStreaming}
                speechOutputLanguage={speechOutputLanguage}
                setSpeechOutputLanguage={setSpeechOutputLanguage}
                languages={languages}
              />

              <OutputControls
                outputLanguages={outputLanguages}
                onAddOutputLanguage={addOutputLanguage}
                onRemoveOutputLanguage={removeOutputLanguage}
                onUpdateOutputLanguage={updateOutputLanguage}
                onPlayAudio={playAudio}
                onCopyToClipboard={copyToClipboard}
                onDownloadAudio={downloadAudio}
                currentPlayingIndex={currentPlayingIndex}
                isSpeaking={isSpeaking}
                isTTSSupported={isTTSSupported}
                isStreaming={isStreaming}
                streamingResults={streamingResults}
                languages={languages}
              />
            </div>

            <TranslationStatus
              isTranslating={isTranslating}
              isSpeaking={isSpeaking}
              isStreaming={isStreaming}
              isCorrectingGrammar={isCorrectingGrammar}
            />

            <QuickTips />

            <AppFooter />
          </div>
        </>
      )}
    </div>
  );
});

const VoiceTranslatorComponent = memo(function VoiceTranslatorComponent() {
  return (
    <TranslationProvider>
      <VoiceTranslatorContent />
    </TranslationProvider>
  );
});

export const VoiceTranslator = dynamic(
  () => Promise.resolve(VoiceTranslatorComponent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    ),
  }
);
