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
import { BookOpen, Mic, MicOff } from "lucide-react";

interface OutputLanguage {
  code: string;
  name: string;
  text: string;
}

const VoiceTranslatorComponent = memo(function VoiceTranslatorComponent() {
  const [showIntro, setShowIntro] = useState(false);
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
  const [voiceInteractionMode, setVoiceInteractionMode] = useState(false);

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
    autoStopTimeout: 3000, // Auto-stop after 3 seconds of silence
    onResult: async (transcript: string, isFinal: boolean) => {
      console.log("[v0] Speech result callback:", {
        transcript,
        isFinal,
        autoTranslate,
        voiceInteractionMode,
      });

      if (isFinal) {
        if (voiceInteractionMode) {
          // Voice interaction mode: translate to Hindi and speak
          let processedText = transcript;
          if (grammarCorrectionEnabled) {
            processedText = await correctGrammar(transcript);
          }
          await handleVoiceInteraction(processedText);
        } else if (autoTranslate) {
          // Normal auto-translate mode
          let processedText = transcript;
          if (grammarCorrectionEnabled) {
            processedText = await correctGrammar(transcript);
          }

          // Update input text with processed transcript
          setInputText((prev) => {
            const newText = prev + processedText;
            console.log("[v0] Updated input text:", newText);
            return newText;
          });

          // Start translation
          setTimeout(async () => {
            if (streamingMode) {
              await startStreamingTranslation();
            } else {
              await translateText();
            }
          }, 500);
        }
      }
    },
    onInterimResult: async (interimTranscript: string) => {
      if (autoTranslate && interimTranscript.trim()) {
        // Real-time translation for interim results
        let processedText = interimTranscript;
        if (grammarCorrectionEnabled) {
          processedText = await correctGrammar(interimTranscript);
        }

        // Update input text temporarily for real-time display
        setInputText(processedText);

        // Perform real-time translation
        if (streamingMode) {
          startStreamingTranslation();
        } else {
          translateTextRealtime(processedText);
        }
      }
    },
    onError: (error: string) => setSpeechError(error),
    onStart: () => setSpeechError(null),
    onAutoStop: () => {
      console.log(
        "[v0] Auto-stopped due to silence - processing final transcript:",
        transcript
      );
      // Process any remaining transcript when auto-stopped
      if (transcript.trim()) {
        if (voiceInteractionMode) {
          // Voice interaction mode: translate to Hindi and speak (only once)
          let processedText = transcript;
          // Use a flag to prevent duplicate processing
          if (
            !lastTranscriptRef.current ||
            lastTranscriptRef.current !== processedText
          ) {
            lastTranscriptRef.current = processedText;
            setTimeout(async () => {
              if (grammarCorrectionEnabled) {
                processedText = await correctGrammar(transcript);
              }
              await handleVoiceInteraction(processedText);
            }, 200);
          }
        } else if (autoTranslate) {
          // Normal auto-translate mode
          setTimeout(async () => {
            let processedText = transcript;
            if (grammarCorrectionEnabled) {
              processedText = await correctGrammar(transcript);
            }
            setInputText((prev) => {
              const newText = prev + processedText;
              console.log("[v0] Auto-stop updated input text:", newText);
              return newText;
            });

            if (streamingMode) {
              await startStreamingTranslation();
            } else {
              await translateText();
            }
          }, 500);
        }
      }
    },
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

  // Manual transcript handling removed - now handled in speech recognition callbacks

  // Auto-translate typed text with debouncing
  useEffect(() => {
    if (interimTimeoutRef.current) clearTimeout(interimTimeoutRef.current);

    // Only auto-translate if we have typed text and auto-translate is enabled
    if (inputText.trim() && autoTranslate && !isListening) {
      interimTimeoutRef.current = setTimeout(async () => {
        console.log("[v0] Auto-translating typed text:", inputText);

        // Process text with grammar correction if enabled
        let processedText = inputText;
        if (grammarCorrectionEnabled) {
          processedText = await correctGrammar(inputText);
          if (processedText !== inputText) {
            setInputText(processedText);
          }
        }

        // Perform translation
        if (streamingMode) {
          startStreamingTranslation();
        } else {
          translateTextRealtime(processedText);
        }
      }, 1000); // 1 second debounce for typed text
    }

    return () => {
      if (interimTimeoutRef.current) clearTimeout(interimTimeoutRef.current);
    };
  }, [inputText, autoTranslate, isListening, streamingMode, grammarCorrectionEnabled]);

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

  const translateTextRealtime = async (text: string) => {
    if (!text.trim()) return;
    setTranslationError(null);

    try {
      let textToTranslate = text;
      if (grammarCorrectionEnabled) {
        textToTranslate = await correctGrammar(text);
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

        // Auto-play first translation if enabled
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
    }
  };

  const playAudio = useCallback(
    (text: string, languageCode: string, index?: number) => {
      if (!text.trim() || !isTTSSupported) return;

      // Prevent duplicate speech in voice interaction mode
      if (voiceInteractionMode && isSpeaking) {
        console.log("[VOICE] Already speaking, skipping duplicate speech");
        return;
      }

      if (isSpeaking && !voiceInteractionMode) {
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
      voiceInteractionMode,
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
      setVoiceInteractionMode(false);
    } else {
      if (!isSpeechSupported) {
        setSpeechError("Speech recognition is not supported in this browser.");
        return;
      }
      setSpeechError(null);
      setTranslationError(null);
      resetTranscript();
      setInputText("");
      // Clear previous translations when starting new recording
      setOutputLanguages((prev) =>
        prev.map((output) => ({ ...output, text: "" }))
      );
      setVoiceInteractionMode(true);
      startListening();
    }
  };

  const handleVoiceInteraction = async (recognizedText: string) => {
    if (!recognizedText.trim()) return;

    console.log("[VOICE] Processing voice interaction:", recognizedText);

    try {
      // Step 1: Grammar correction
      let processedText = recognizedText;
      if (grammarCorrectionEnabled) {
        console.log("[VOICE] Applying grammar correction...");
        processedText = await correctGrammar(recognizedText);
        console.log("[VOICE] Grammar corrected:", processedText);
      }

      // Step 2: Translate to Hindi
      console.log("[VOICE] Translating to Hindi...");
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: processedText,
          inputLang: "auto", // Auto-detect input language
          outputLangs: ["hi"], // Always translate to Hindi
          stream: false,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Translation failed");

      if (data.success && data.translations) {
        const hindiTranslation = data.translations.find(
          (t: any) => t.language === "hi"
        );
        if (hindiTranslation?.text) {
          console.log("[VOICE] Hindi translation:", hindiTranslation.text);

          // Step 3: Speak the Hindi translation (only once)
          setTimeout(() => {
            if (voiceInteractionMode && !isSpeaking) {
              console.log("[VOICE] Speaking Hindi response...");
              playAudio(hindiTranslation.text, "hi");
            }
          }, 300); // Reduced delay for faster response
        }
      }
    } catch (error) {
      console.error("Voice interaction translation error:", error);
      setTranslationError("Failed to translate voice input");
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
    setVoiceInteractionMode(false);
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

            {/* Floating Voice Button */}
            <div className="fixed bottom-8 right-8 z-50">
              <div className="relative">
                {/* Voice interaction indicator */}
                {voiceInteractionMode && (
                  <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                )}
                <Button
                  onClick={toggleRecording}
                  variant={isListening ? "destructive" : "default"}
                  size="lg"
                  className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 ${
                    isListening
                      ? "bg-red-500 hover:bg-red-600 animate-pulse"
                      : voiceInteractionMode
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-primary hover:bg-primary/90"
                  }`}
                  disabled={!isSpeechSupported}
                  title={
                    voiceInteractionMode
                      ? "Voice Interaction Mode - Click to stop"
                      : isListening
                      ? "Stop Recording"
                      : "Start Voice Interaction"
                  }
                >
                  {isSpeaking ? (
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  ) : isListening ? (
                    <MicOff className="h-6 w-6" />
                  ) : (
                    <Mic className="h-6 w-6" />
                  )}
                </Button>
                {/* Status text */}
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-center whitespace-nowrap">
                  {voiceInteractionMode ? (
                    <span className="bg-green-500 text-white px-2 py-1 rounded">
                      Voice Mode
                    </span>
                  ) : isListening ? (
                    <span className="bg-red-500 text-white px-2 py-1 rounded animate-pulse">
                      Listening...
                    </span>
                  ) : isSpeaking ? (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded">
                      Speaking...
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

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
