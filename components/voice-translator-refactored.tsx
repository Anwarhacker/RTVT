"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import dynamic from "next/dynamic";
import { IntroSection } from "@/components/intro-section";
import { AppHeader } from "@/components/app-header";
import { AppFooter } from "@/components/app-footer";
import { QuickTips } from "@/components/quick-tips";
import { StatusIndicator } from "@/components/status-indicator";
import { LanguageSwapSection } from "@/components/language-swap-section";
import { InputSection } from "@/components/input-section";
import { OutputSection } from "@/components/output-section";
import { ErrorAlerts } from "@/components/error-alerts";
import { SettingsDialog } from "@/components/settings-dialog";
import { HistoryDialog } from "@/components/history-dialog";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useStreamingTranslation } from "@/hooks/use-streaming-translation";
import { useTranslationHistory } from "@/hooks/use-translation-history";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

interface OutputLanguage {
  code: string;
  name: string;
  text: string;
}

const VoiceTranslatorComponent = memo(function VoiceTranslatorComponent() {
  const [showIntro, setShowIntro] = useState(true);
  const [inputText, setInputText] = useState("");
  const [inputLanguage, setInputLanguage] = useState("auto");
  const [outputLanguages, setOutputLanguages] = useState<OutputLanguage[]>([
    { code: "hi", name: "Hindi", text: "" },
    { code: "kn", name: "Kannada", text: "" },
    { code: "mr", name: "Marathi", text: "" },
  ]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [autoPlay, setAutoPlay] = useState(false);
  const [currentPlayingIndex, setCurrentPlayingIndex] = useState<number | null>(
    null
  );
  const [streamingMode, setStreamingMode] = useState(false);
  const [isCorrectingGrammar, setIsCorrectingGrammar] = useState(false);
  const [grammarCorrectionEnabled, setGrammarCorrectionEnabled] =
    useState(true);
  const [speechSpeed, setSpeechSpeed] = useState(0.8);
  const [mounted, setMounted] = useState(false);

  const languages = [
    { code: "auto", name: "Auto-detect" },
    { code: "en", name: "English" },
    { code: "hi", name: "Hindi" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "bn", name: "Bengali" },
    { code: "ta", name: "Tamil" },
    { code: "te", name: "Telugu" },
    { code: "mr", name: "Marathi" },
    { code: "gu", name: "Gujarati" },
    { code: "kn", name: "Kannada" },
    { code: "ml", name: "Malayalam" },
    { code: "pa", name: "Punjabi" },
    { code: "ur", name: "Urdu" },
    { code: "or", name: "Odia" },
    { code: "as", name: "Assamese" },
    { code: "ne", name: "Nepali" },
    { code: "si", name: "Sinhala" },
  ];

  // BCP 47 language codes for speech recognition
  const speechLanguageMap: Record<string, string> = {
    auto: "en-US",
    en: "en-US",
    hi: "hi-IN",
    es: "es-ES",
    fr: "fr-FR",
    de: "de-DE",
    it: "it-IT",
    pt: "pt-BR",
    ru: "ru-RU",
    ja: "ja-JP",
    ko: "ko-KR",
    zh: "zh-CN",
    ar: "ar-SA",
    bn: "bn-IN",
    ta: "ta-IN",
    te: "te-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    ml: "ml-IN",
    pa: "pa-IN",
    ur: "ur-IN",
    or: "or-IN",
    as: "as-IN",
    ne: "ne-NP",
    si: "si-LK",
  };

  const { addEntry } = useTranslationHistory();

  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    error: speechRecognitionError,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    language: speechLanguageMap[inputLanguage] || "en-US",
    onResult: (transcript: string, isFinal: boolean) => {
      if (isFinal && autoTranslate) {
        setTimeout(() => {
          if (streamingMode) {
            startStreamingTranslation();
          } else {
            translateText();
          }
        }, 1000);
      }
    },
    onError: (error: string) => setSpeechError(error),
    onStart: () => setSpeechError(null),
  });

  const {
    isSupported: isTTSSupported,
    isSpeaking,
    speak,
    stop: stopSpeaking,
    setRate,
    downloadAudio,
    error: ttsError,
  } = useTextToSpeech({
    rate: speechSpeed,
    pitch: 1,
    volume: 1,
    onEnd: () => setCurrentPlayingIndex(null),
    onError: (error: string) => {
      setSpeechError(error);
      setCurrentPlayingIndex(null);
    },
  });

  const {
    isStreaming,
    streamingResults,
    startStreaming,
    stopStreaming,
    error: streamingError,
  } = useStreamingTranslation({
    onProgress: (language: string, text: string) => {
      setOutputLanguages((prev) =>
        prev.map((output) =>
          output.code === language ? { ...output, text } : output
        )
      );
    },
    onComplete: (results: Record<string, string>) => {
      saveToHistory(results);
      if (autoPlay && outputLanguages.length > 0) {
        const firstLang = outputLanguages[0];
        const firstResult = results[firstLang.code];
        if (firstResult) {
          setTimeout(() => playAudio(firstResult, firstLang.code, 0), 500);
        }
      }
    },
    onError: (error: string) => setTranslationError(error),
  });

  // Refs to prevent duplicate processing
  const lastTranscriptRef = useRef("");
  const interimTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      setInputText((prev) => prev + transcript + " ");
    }
  }, [transcript]);

  useEffect(() => {
    if (interimTimeoutRef.current) clearTimeout(interimTimeoutRef.current);
    interimTimeoutRef.current = setTimeout(() => {
      console.log("[v0] Interim transcript:", interimTranscript);
    }, 100);
    return () => {
      if (interimTimeoutRef.current) clearTimeout(interimTimeoutRef.current);
    };
  }, [interimTranscript]);

  useEffect(() => {
    if (speechRecognitionError) setSpeechError(speechRecognitionError);
  }, [speechRecognitionError]);

  useEffect(() => {
    if (ttsError) setSpeechError(ttsError);
  }, [ttsError]);

  useEffect(() => {
    if (streamingError) setTranslationError(streamingError);
  }, [streamingError]);

  const translateText = async () => {
    if (!inputText.trim()) return;
    setIsTranslating(true);
    setTranslationError(null);

    try {
      let textToTranslate = inputText;
      if (grammarCorrectionEnabled) {
        textToTranslate = await correctGrammar(inputText);
        if (textToTranslate !== inputText) {
          setInputText(textToTranslate);
        }
      }

      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: textToTranslate,
          inputLang: inputLanguage,
          outputLangs: outputLanguages.map((lang) => lang.code),
          stream: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Translation failed");

      if (data.success && data.translations) {
        const updatedOutputs = outputLanguages.map((output) => {
          const translation = data.translations.find(
            (t: any) => t.language === output.code
          );
          return {
            ...output,
            text: translation?.text || "Translation not available",
          };
        });

        setOutputLanguages(updatedOutputs);
        if (inputLanguage === "auto" && data.detectedLanguage) {
          setDetectedLanguage(data.detectedLanguage);
        }

        saveToHistory();
        if (autoPlay && updatedOutputs.length > 0 && updatedOutputs[0].text) {
          setTimeout(
            () => playAudio(updatedOutputs[0].text, updatedOutputs[0].code, 0),
            500
          );
        }
      }
    } catch (error) {
      setTranslationError(
        error instanceof Error ? error.message : "Translation failed"
      );
    } finally {
      setIsTranslating(false);
    }
  };

  const correctGrammar = async (text: string): Promise<string> => {
    if (!grammarCorrectionEnabled || !text.trim()) return text;
    setIsCorrectingGrammar(true);

    try {
      const response = await fetch("/api/correct-grammar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Grammar correction failed");
      return data.success && data.correctedText ? data.correctedText : text;
    } catch (error) {
      return text;
    } finally {
      setIsCorrectingGrammar(false);
    }
  };

  const startStreamingTranslation = async () => {
    if (!inputText.trim()) return;
    setTranslationError(null);

    let textToTranslate = inputText;
    if (grammarCorrectionEnabled) {
      textToTranslate = await correctGrammar(inputText);
      if (textToTranslate !== inputText) setInputText(textToTranslate);
    }

    setOutputLanguages((prev) =>
      prev.map((output) => ({ ...output, text: "" }))
    );
    startStreaming(
      textToTranslate,
      inputLanguage,
      outputLanguages.map((lang) => lang.code)
    );
  };

  const playAudio = useCallback(
    (text: string, languageCode: string, index?: number) => {
      if (!text.trim() || !isTTSSupported) return;
      if (isSpeaking) {
        stopSpeaking();
        if (currentPlayingIndex === index) {
          setCurrentPlayingIndex(null);
          return;
        }
      }
      setCurrentPlayingIndex(index ?? null);
      setRate(speechSpeed);
      speak(text, languageCode);
    },
    [
      isTTSSupported,
      isSpeaking,
      currentPlayingIndex,
      speechSpeed,
      stopSpeaking,
      setRate,
      speak,
    ]
  );

  const swapLanguages = useCallback(() => {
    if (inputLanguage === "auto" || outputLanguages.length === 0) return;
    const firstOutputLang = outputLanguages[0];
    const newInputLang = firstOutputLang.code;
    const newOutputLang = inputLanguage;

    setInputLanguage(newInputLang);
    setOutputLanguages((prev) => [
      {
        ...prev[0],
        code: newOutputLang,
        name:
          languages.find((l) => l.code === newOutputLang)?.name ||
          newOutputLang,
      },
      ...prev.slice(1),
    ]);

    const inputTextContent = inputText;
    const outputTextContent = firstOutputLang.text;
    setInputText(outputTextContent);
    setOutputLanguages((prev) => [
      { ...prev[0], text: inputTextContent },
      ...prev.slice(1),
    ]);
  }, [inputLanguage, outputLanguages, inputText, languages]);

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      if (!isSpeechSupported) {
        setSpeechError("Speech recognition is not supported in this browser.");
        return;
      }
      setSpeechError(null);
      setTranslationError(null);
      resetTranscript();
      setInputText("");
      startListening();
    }
  };

  const handleTranslate = () => {
    if (streamingMode) {
      if (isStreaming) stopStreaming();
      else startStreamingTranslation();
    } else {
      translateText();
    }
  };

  const resetAll = () => {
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();
    if (isStreaming) stopStreaming();

    setInputText("");
    resetTranscript();
    setOutputLanguages((prev) =>
      prev.map((output) => ({ ...output, text: "" }))
    );
    setTranslationError(null);
    setSpeechError(null);
    setDetectedLanguage(null);
    setCurrentPlayingIndex(null);
    setIsTranslating(false);
  };

  const addOutputLanguage = () => {
    const availableLanguages = languages.filter(
      (lang) =>
        lang.code !== "auto" &&
        !outputLanguages.some((output) => output.code === lang.code)
    );
    if (availableLanguages.length > 0) {
      setOutputLanguages([
        ...outputLanguages,
        {
          code: availableLanguages[0].code,
          name: availableLanguages[0].name,
          text: "",
        },
      ]);
    }
  };

  const removeOutputLanguage = (index: number) => {
    setOutputLanguages(outputLanguages.filter((_, i) => i !== index));
  };

  const updateOutputLanguage = (index: number, code: string) => {
    const language = languages.find((lang) => lang.code === code);
    if (language) {
      const updated = [...outputLanguages];
      updated[index] = { ...updated[index], code, name: language.name };
      setOutputLanguages(updated);
    }
  };

  const saveToHistory = (results?: Record<string, string>) => {
    if (!inputText.trim()) return;
    const translations = outputLanguages
      .map((output) => ({
        language: output.code,
        languageName: output.name,
        text: results ? results[output.code] || output.text : output.text,
      }))
      .filter((t) => t.text && t.text.trim());

    if (translations.length > 0) {
      addEntry({
        inputText: inputText.trim(),
        inputLanguage,
        detectedLanguage: detectedLanguage || undefined,
        translations,
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDownloadAudio = useCallback(
    (text: string, languageCode: string, languageName: string) => {
      if (!text.trim() || !isTTSSupported) return;
      const filename = `translation-${languageName}-${Date.now()}.wav`;
      downloadAudio(text, languageCode, filename);
    },
    [isTTSSupported, downloadAudio]
  );

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 relative overflow-hidden">
      {showIntro && <IntroSection onContinue={() => setShowIntro(false)} />}

      {!showIntro && (
        <>
          <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl">
            <AppHeader />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4 animate-slide-up">
              <div className="flex self-end gap-2">
                <HistoryDialog />
                <SettingsDialog />
                {/* <Button
                  onClick={() => window.open("/dictionary", "_blank")}
                  variant="outline"
                  size="sm"
                  className="bg-background/50 hover:bg-background transition-all duration-200 hover:scale-[1.02]"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Dictionary
                </Button> */}
              </div>

              <LanguageSwapSection
                inputLanguage={inputLanguage}
                outputLanguages={outputLanguages}
                languages={languages}
                onInputLanguageChange={setInputLanguage}
                onOutputLanguageChange={updateOutputLanguage}
                onSwapLanguages={swapLanguages}
              />
            </div>

            <ErrorAlerts
              translationError={translationError}
              speechError={speechError}
              isSpeechSupported={isSpeechSupported}
              isTTSSupported={isTTSSupported}
            />

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 animate-slide-up">
              <InputSection
                inputText={inputText}
                inputLanguage={inputLanguage}
                detectedLanguage={detectedLanguage}
                languages={languages}
                isListening={isListening}
                isSpeechSupported={isSpeechSupported}
                interimTranscript={interimTranscript}
                autoTranslate={autoTranslate}
                autoPlay={autoPlay}
                grammarCorrectionEnabled={grammarCorrectionEnabled}
                streamingMode={streamingMode}
                speechSpeed={speechSpeed}
                isCorrectingGrammar={isCorrectingGrammar}
                isTranslating={isTranslating}
                isStreaming={isStreaming}
                onInputTextChange={setInputText}
                onInputLanguageChange={setInputLanguage}
                onToggleRecording={toggleRecording}
                onAutoTranslateChange={setAutoTranslate}
                onAutoPlayChange={setAutoPlay}
                onGrammarCorrectionChange={setGrammarCorrectionEnabled}
                onStreamingModeChange={setStreamingMode}
                onSpeechSpeedChange={setSpeechSpeed}
                onTranslate={handleTranslate}
                onReset={resetAll}
              />

              <OutputSection
                outputLanguages={outputLanguages}
                languages={languages}
                isStreaming={isStreaming}
                streamingResults={streamingResults}
                isTTSSupported={isTTSSupported}
                currentPlayingIndex={currentPlayingIndex}
                isSpeaking={isSpeaking}
                onAddOutputLanguage={addOutputLanguage}
                onRemoveOutputLanguage={removeOutputLanguage}
                onUpdateOutputLanguage={updateOutputLanguage}
                onPlayAudio={playAudio}
                onCopyToClipboard={copyToClipboard}
                onDownloadAudio={handleDownloadAudio}
              />
            </div>

            <StatusIndicator
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

export const VoiceTranslator = dynamic(
  () => Promise.resolve(VoiceTranslatorComponent),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-black"></div>
      </div>
    ),
  }
);
