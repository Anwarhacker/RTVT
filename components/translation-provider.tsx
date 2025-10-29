"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { useTextToSpeech } from "@/hooks/use-text-to-speech";
import { useStreamingTranslation } from "@/hooks/use-streaming-translation";
import { useTranslationHistory } from "@/hooks/use-translation-history";
import { apiCache } from "@/utils/api-cache";

interface OutputLanguage {
  code: string;
  name: string;
  text: string;
}

interface TranslationContextType {
  // State
  inputText: string;
  setInputText: (text: string) => void;
  inputLanguage: string;
  setInputLanguage: (language: string) => void;
  outputLanguages: OutputLanguage[];
  setOutputLanguages: React.Dispatch<React.SetStateAction<OutputLanguage[]>>;
  isTranslating: boolean;
  setIsTranslating: (translating: boolean) => void;
  translationError: string | null;
  setTranslationError: (error: string | null) => void;
  detectedLanguage: string | null;
  setDetectedLanguage: (language: string | null) => void;
  autoTranslate: boolean;
  setAutoTranslate: (enabled: boolean) => void;
  speechError: string | null;
  setSpeechError: (error: string | null) => void;
  autoPlay: boolean;
  setAutoPlay: (enabled: boolean) => void;
  currentPlayingIndex: number | null;
  setCurrentPlayingIndex: (index: number | null) => void;
  streamingMode: boolean;
  setStreamingMode: (enabled: boolean) => void;
  isCorrectingGrammar: boolean;
  setIsCorrectingGrammar: (correcting: boolean) => void;
  grammarCorrectionEnabled: boolean;
  setGrammarCorrectionEnabled: (enabled: boolean) => void;
  speechSpeed: number;
  setSpeechSpeed: (speed: number) => void;

  // Hooks
  isSpeechSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  speechRecognitionError: string | null;

  isTTSSupported: boolean;
  isSpeaking: boolean;
  speak: (text: string, language?: string) => void;
  stopSpeaking: () => void;
  setRate: (rate: number) => void;
  downloadAudio: (text: string, language?: string, filename?: string) => void;
  ttsError: string | null;

  isStreaming: boolean;
  streamingResults: Record<string, string>;
  startStreaming: (
    text: string,
    inputLang: string,
    outputLangs: string[]
  ) => void;
  stopStreaming: () => void;
  streamingError: string | null;

  addEntry: (entry: any) => void;

  // Actions
  toggleRecording: () => void;
  addOutputLanguage: () => void;
  removeOutputLanguage: (index: number) => void;
  updateOutputLanguage: (index: number, code: string) => void;
  startStreamingTranslation: () => Promise<void>;
  translateTextRealtime: (text: string) => Promise<void>;
  translateText: () => Promise<void>;
  playAudio: (text: string, languageCode: string, index?: number) => void;
  copyToClipboard: (text: string) => void;
  handleTranslate: () => void;
  saveToHistory: (results?: Record<string, string>) => void;
  resetAll: () => void;
  correctGrammar: (text: string) => Promise<string>;
  swapLanguages: () => void;

  // Constants
  languages: Array<{ code: string; name: string }>;
  speechLanguageMap: Record<string, string>;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}

interface TranslationProviderProps {
  children: React.ReactNode;
}

export function TranslationProvider({ children }: TranslationProviderProps) {
  // State
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

  // Constants
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

  // Hooks
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
    onResult: async (transcript: string, isFinal: boolean) => {
      console.log("[v0] Speech recognition result:", {
        transcript,
        isFinal,
        autoTranslate,
      });
      if (isFinal && autoTranslate) {
        let processedText = transcript;
        if (grammarCorrectionEnabled) {
          processedText = await correctGrammar(transcript);
        }
        setInputText((prev) => prev + processedText);
        setTimeout(async () => {
          if (streamingMode) {
            await startStreamingTranslation();
          } else {
            await translateText();
          }
        }, 500);
      }
    },
    onInterimResult: async (interimTranscript: string) => {
      if (autoTranslate && interimTranscript.trim()) {
        console.log(
          "[v0] Real-time translation for interim result:",
          interimTranscript
        );
        let processedText = interimTranscript;
        if (grammarCorrectionEnabled) {
          processedText = await correctGrammar(interimTranscript);
        }
        setInputText(processedText);
        if (streamingMode) {
          startStreamingTranslation();
        } else {
          translateTextRealtime(processedText);
        }
      }
    },
    onError: (error: string) => {
      console.log("[v0] Speech recognition error:", error);
      setSpeechError(error);
    },
    onStart: () => {
      console.log("[v0] Speech recognition started");
      setSpeechError(null);
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
    onStart: () => {},
    onEnd: () => {
      setCurrentPlayingIndex(null);
    },
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
    onProgress: (language: string, text: string, isComplete: boolean) => {
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
          setTimeout(() => {
            playAudio(firstResult, firstLang.code, 0);
          }, 500);
        }
      }
    },
    onError: (error: string) => {
      setTranslationError(error);
    },
  });

  const lastTranscriptRef = useRef("");

  // Effects
  useEffect(() => {
    if (speechRecognitionError) {
      console.log("[v0] Setting speech error:", speechRecognitionError);
      setSpeechError(speechRecognitionError);
    }
  }, [speechRecognitionError]);

  useEffect(() => {
    if (ttsError) {
      console.log("[v0] Setting TTS error:", ttsError);
      setSpeechError(ttsError);
    }
  }, [ttsError]);

  useEffect(() => {
    if (streamingError) {
      console.log("[v0] Setting streaming error:", streamingError);
      setTranslationError(streamingError);
    }
  }, [streamingError]);

  // Auto-translate typed text with debouncing
  useEffect(() => {
    if (lastTranscriptRef.current)
      clearTimeout(lastTranscriptRef.current as any);

    if (inputText.trim() && autoTranslate && !isListening) {
      (lastTranscriptRef.current as any) = setTimeout(async () => {
        console.log("[v0] Auto-translating typed text:", inputText);

        let processedText = inputText;
        if (grammarCorrectionEnabled) {
          processedText = await correctGrammar(inputText);
          if (processedText !== inputText) {
            setInputText(processedText);
          }
        }

        if (streamingMode) {
          startStreamingTranslation();
        } else {
          translateTextRealtime(processedText);
        }
      }, 1000);
    }

    return () => {
      if (lastTranscriptRef.current)
        clearTimeout(lastTranscriptRef.current as any);
    };
  }, [
    inputText,
    autoTranslate,
    isListening,
    streamingMode,
    grammarCorrectionEnabled,
  ]);

  // Actions
  const toggleRecording = useCallback(() => {
    console.log("[v0] Toggle recording called:", {
      isListening,
      isSpeechSupported,
    });
    if (isListening) {
      stopListening();
    } else {
      if (!isSpeechSupported) {
        const errorMsg =
          "Speech recognition is not supported in this browser. Please try Chrome, Edge, or Safari.";
        console.log("[v0] Speech not supported:", errorMsg);
        setSpeechError(errorMsg);
        return;
      }
      setSpeechError(null);
      setTranslationError(null);
      resetTranscript();
      lastTranscriptRef.current = "";
      setInputText("");
      setOutputLanguages((prev) =>
        prev.map((output) => ({ ...output, text: "" }))
      );
      startListening();
    }
  }, [
    isListening,
    isSpeechSupported,
    stopListening,
    resetTranscript,
    startListening,
  ]);

  const addOutputLanguage = useCallback(() => {
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
  }, [languages, outputLanguages]);

  const removeOutputLanguage = useCallback(
    (index: number) => {
      setOutputLanguages(outputLanguages.filter((_, i) => i !== index));
    },
    [outputLanguages]
  );

  const updateOutputLanguage = useCallback(
    (index: number, code: string) => {
      const language = languages.find((lang) => lang.code === code);
      if (language) {
        const updated = [...outputLanguages];
        updated[index] = { ...updated[index], code, name: language.name };
        setOutputLanguages(updated);
      }
    },
    [languages, outputLanguages]
  );

  const startStreamingTranslation = useCallback(async () => {
    if (!inputText.trim()) {
      console.log("[v0] No input text for streaming translation");
      return;
    }

    console.log("[v0] Starting streaming translation:", {
      inputText,
      inputLanguage,
      outputLanguages,
    });
    setTranslationError(null);

    let textToTranslate = inputText;
    if (grammarCorrectionEnabled) {
      textToTranslate = await correctGrammar(inputText);
      if (textToTranslate !== inputText) {
        setInputText(textToTranslate);
      }
    }

    setOutputLanguages((prev) =>
      prev.map((output) => ({ ...output, text: "" }))
    );

    startStreaming(
      textToTranslate,
      inputLanguage,
      outputLanguages.map((lang) => lang.code)
    );
  }, [
    inputText,
    inputLanguage,
    outputLanguages,
    grammarCorrectionEnabled,
    startStreaming,
  ]);

  const translateTextRealtime = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setTranslationError(null);

      try {
        let textToTranslate = text;
        if (grammarCorrectionEnabled) {
          textToTranslate = await correctGrammar(text);
        }

        // Use cached translation if available
        const cacheKey = `translation:${inputLanguage}:${outputLanguages
          .map((l) => l.code)
          .sort()
          .join(",")}:${textToTranslate.slice(0, 100)}`;
        let data;

        if (apiCache.has(cacheKey)) {
          data = apiCache.get(cacheKey);
          console.log("[v0] Using cached translation");
        } else {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: textToTranslate,
              inputLang: inputLanguage,
              outputLangs: outputLanguages.map((lang) => lang.code),
              stream: false,
            }),
          });

          data = await response.json();
          console.log("[v0] Real-time translation response:", data);

          if (!response.ok) {
            throw new Error(data.error || "Translation failed");
          }

          // Cache successful translations
          if (data.success) {
            apiCache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes TTL
          }
        }

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

          console.log("[v0] Updated outputs for real-time:", updatedOutputs);
          setOutputLanguages(updatedOutputs);

          if (inputLanguage === "auto" && data.detectedLanguage) {
            console.log(
              "[v0] Detected language in real-time:",
              data.detectedLanguage
            );
            setDetectedLanguage(data.detectedLanguage);
          }

          if (autoPlay && updatedOutputs.length > 0 && updatedOutputs[0].text) {
            console.log("[v0] Auto-playing first translation in real-time");
            setTimeout(() => {
              playAudio(updatedOutputs[0].text, updatedOutputs[0].code, 0);
            }, 500);
          }
        }
      } catch (error) {
        console.error("[v0] Real-time translation error:", error);
        setTranslationError(
          error instanceof Error ? error.message : "Translation failed"
        );
      }
    },
    [inputLanguage, outputLanguages, grammarCorrectionEnabled, autoPlay]
  );

  const translateText = useCallback(async () => {
    if (!inputText.trim()) {
      console.log("[v0] No input text for translation");
      return;
    }

    console.log("[v0] Starting translation:", {
      inputText,
      inputLanguage,
      outputLanguages,
    });
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

      // Use cached translation if available
      const cacheKey = `translation:${inputLanguage}:${outputLanguages
        .map((l) => l.code)
        .sort()
        .join(",")}:${textToTranslate.slice(0, 100)}`;
      let data;

      if (apiCache.has(cacheKey)) {
        data = apiCache.get(cacheKey);
        console.log("[v0] Using cached translation");
      } else {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: textToTranslate,
            inputLang: inputLanguage,
            outputLangs: outputLanguages.map((lang) => lang.code),
            stream: false,
          }),
        });

        data = await response.json();
        console.log("[v0] Translation response:", data);

        if (!response.ok) {
          throw new Error(data.error || "Translation failed");
        }

        // Cache successful translations
        if (data.success) {
          apiCache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes TTL
        }
      }

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

        console.log("[v0] Updated outputs:", updatedOutputs);
        setOutputLanguages(updatedOutputs);

        if (inputLanguage === "auto" && data.detectedLanguage) {
          console.log("[v0] Detected language:", data.detectedLanguage);
          setDetectedLanguage(data.detectedLanguage);
        }

        saveToHistory();

        if (autoPlay && updatedOutputs.length > 0 && updatedOutputs[0].text) {
          console.log("[v0] Auto-playing first translation");
          setTimeout(() => {
            playAudio(updatedOutputs[0].text, updatedOutputs[0].code, 0);
          }, 500);
        }
      }
    } catch (error) {
      console.error("[v0] Translation error:", error);
      setTranslationError(
        error instanceof Error ? error.message : "Translation failed"
      );
    } finally {
      setIsTranslating(false);
    }
  }, [
    inputText,
    inputLanguage,
    outputLanguages,
    grammarCorrectionEnabled,
    autoPlay,
  ]);

  const playAudio = useCallback(
    (text: string, languageCode: string, index?: number) => {
      if (!text.trim()) {
        console.log("[v0] No text to play");
        return;
      }

      console.log("[v0] Playing audio:", {
        text,
        languageCode,
        index,
        speechSpeed,
      });

      if (!isTTSSupported) {
        const errorMsg = "Text-to-speech is not supported in this browser.";
        console.log("[v0] TTS not supported:", errorMsg);
        setSpeechError(errorMsg);
        return;
      }

      if (isSpeaking) {
        console.log("[v0] Stopping current speech");
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

  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const handleTranslate = useCallback(() => {
    if (streamingMode) {
      if (isStreaming) {
        stopStreaming();
      } else {
        startStreamingTranslation();
      }
    } else {
      translateText();
    }
  }, [
    streamingMode,
    isStreaming,
    stopStreaming,
    startStreamingTranslation,
    translateText,
  ]);

  const saveToHistory = useCallback(
    (results?: Record<string, string>) => {
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
    },
    [inputText, outputLanguages, inputLanguage, detectedLanguage, addEntry]
  );

  const resetAll = useCallback(() => {
    console.log("[v0] Resetting all state");
    if (isListening) {
      console.log("[v0] Stopping speech recognition");
      stopListening();
    }
    if (isSpeaking) {
      console.log("[v0] Stopping TTS");
      stopSpeaking();
    }
    if (isStreaming) {
      console.log("[v0] Stopping streaming");
      stopStreaming();
    }

    setInputText("");
    resetTranscript();
    lastTranscriptRef.current = "";
    setOutputLanguages((prev) =>
      prev.map((output) => ({ ...output, text: "" }))
    );
    setTranslationError(null);
    setSpeechError(null);
    setDetectedLanguage(null);
    setCurrentPlayingIndex(null);
    setIsTranslating(false);
    console.log("[v0] Reset complete");
  }, [
    isListening,
    isSpeaking,
    isStreaming,
    stopListening,
    stopSpeaking,
    stopStreaming,
    resetTranscript,
  ]);

  const correctGrammar = useCallback(
    async (text: string): Promise<string> => {
      if (!grammarCorrectionEnabled || !text.trim()) {
        return text;
      }

      console.log("[v0] Starting grammar correction:", { text });
      setIsCorrectingGrammar(true);

      try {
        const response = await fetch("/api/correct-grammar", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();
        console.log("[v0] Grammar correction response:", data);

        if (!response.ok) {
          throw new Error(data.error || "Grammar correction failed");
        }

        if (data.success && data.correctedText) {
          console.log("[v0] Grammar corrected:", {
            original: text,
            corrected: data.correctedText,
          });
          return data.correctedText;
        }

        return text;
      } catch (error) {
        console.error("[v0] Grammar correction error:", error);
        return text;
      } finally {
        setIsCorrectingGrammar(false);
      }
    },
    [grammarCorrectionEnabled]
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

  const value: TranslationContextType = {
    // State
    inputText,
    setInputText,
    inputLanguage,
    setInputLanguage,
    outputLanguages,
    setOutputLanguages,
    isTranslating,
    setIsTranslating,
    translationError,
    setTranslationError,
    detectedLanguage,
    setDetectedLanguage,
    autoTranslate,
    setAutoTranslate,
    speechError,
    setSpeechError,
    autoPlay,
    setAutoPlay,
    currentPlayingIndex,
    setCurrentPlayingIndex,
    streamingMode,
    setStreamingMode,
    isCorrectingGrammar,
    setIsCorrectingGrammar,
    grammarCorrectionEnabled,
    setGrammarCorrectionEnabled,
    speechSpeed,
    setSpeechSpeed,

    // Hooks
    isSpeechSupported,
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    speechRecognitionError,

    isTTSSupported,
    isSpeaking,
    speak,
    stopSpeaking,
    setRate,
    downloadAudio,
    ttsError,

    isStreaming,
    streamingResults,
    startStreaming,
    stopStreaming,
    streamingError,

    addEntry,

    // Actions
    toggleRecording,
    addOutputLanguage,
    removeOutputLanguage,
    updateOutputLanguage,
    startStreamingTranslation,
    translateTextRealtime,
    translateText,
    playAudio,
    copyToClipboard,
    handleTranslate,
    saveToHistory,
    resetAll,
    correctGrammar,
    swapLanguages,

    // Constants
    languages,
    speechLanguageMap,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}
