// Core types for the translation application
import React from "react";

export interface Language {
  code: string;
  name: string;
}

export interface OutputLanguage extends Language {
  text: string;
}

export interface TranslationResult {
  language: string;
  languageName: string;
  text: string;
}

export interface TranslationHistoryEntry {
  id: string;
  timestamp: number;
  inputText: string;
  inputLanguage: string;
  detectedLanguage?: string;
  translations: TranslationResult[];
}

export interface TranslationRequest {
  text: string;
  inputLang: string;
  outputLangs: string[];
  stream?: boolean;
}

export interface TranslationResponse {
  success: boolean;
  translations?: Array<{
    language: string;
    text: string;
  }>;
  detectedLanguage?: string;
  error?: string;
}

export interface GrammarCorrectionRequest {
  text: string;
}

export interface GrammarCorrectionResponse {
  success: boolean;
  correctedText?: string;
  error?: string;
}

export interface TextToSpeechRequest {
  text: string;
  language?: string;
  voice?: string;
  format?: 'mp3' | 'wav';
}

export interface SpeechRecognitionOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}

export interface SpeechRecognitionHook {
  isSupported: boolean;
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
  error: string | null;
}

export interface TextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice | null;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: string) => void;
}

export interface TextToSpeechHook {
  isSupported: boolean;
  isSpeaking: boolean;
  voices: SpeechSynthesisVoice[];
  speak: (text: string, language?: string) => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setVoice: (voice: SpeechSynthesisVoice | null) => void;
  setRate: (rate: number) => void;
  setPitch: (pitch: number) => void;
  setVolume: (volume: number) => void;
  downloadAudio: (text: string, language?: string, filename?: string) => void;
  error: string | null;
}

export interface StreamingTranslationOptions {
  onProgress?: (language: string, text: string, isComplete: boolean) => void;
  onComplete?: (results: Record<string, string>) => void;
  onError?: (error: string) => void;
}

export interface StreamingTranslationHook {
  isStreaming: boolean;
  streamingResults: Record<string, string>;
  startStreaming: (text: string, inputLang: string, outputLangs: string[]) => void;
  stopStreaming: () => void;
  error: string | null;
}

export interface TranslationHistoryHook {
  history: TranslationHistoryEntry[];
  addEntry: (entry: Omit<TranslationHistoryEntry, "id" | "timestamp">) => void;
  removeEntry: (id: string) => void;
  clearHistory: () => void;
  exportHistory: () => void;
}

export interface TranslationContextType {
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
  startStreaming: (text: string, inputLang: string, outputLangs: string[]) => void;
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
  languages: Language[];
  speechLanguageMap: Record<string, string>;
}

// Component Props Types
export interface InputControlsProps {
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
}

export interface OutputControlsProps {
  outputLanguages: OutputLanguage[];
  onAddOutputLanguage: () => void;
  onRemoveOutputLanguage: (index: number) => void;
  onUpdateOutputLanguage: (index: number, code: string) => void;
  onPlayAudio: (text: string, languageCode: string, index?: number) => void;
  onCopyToClipboard: (text: string) => void;
  onDownloadAudio: (text: string, language?: string, filename?: string) => void;
  currentPlayingIndex: number | null;
  isSpeaking: boolean;
  isTTSSupported: boolean;
  isStreaming: boolean;
  streamingResults: Record<string, string>;
  languages: Language[];
}

export interface LanguageSelectorProps {
  inputLanguage: string;
  outputLanguage: string;
  onInputLanguageChange: (language: string) => void;
  onOutputLanguageChange: (language: string) => void;
  onSwapLanguages: () => void;
  languages: Language[];
}

export interface ErrorDisplayProps {
  translationError: string | null;
  speechError: string | null;
  isSpeechSupported: boolean;
  isTTSSupported: boolean;
}

export interface TranslationStatusProps {
  isTranslating: boolean;
  isSpeaking: boolean;
  isStreaming: boolean;
  isCorrectingGrammar: boolean;
}

// Performance monitoring types
export interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

// Notification types
export interface NotificationItem {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}

export interface NotificationContainerProps {
  notifications: NotificationItem[];
  onRemove: (id: string) => void;
}

export interface NotificationToastProps {
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  onClose?: () => void;
  className?: string;
}

export interface NotificationHook {
  notifications: NotificationItem[];
  addNotification: (message: string, type?: "success" | "error" | "warning" | "info", duration?: number) => string;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

// Loading component types
export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
}

// Error boundary types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;