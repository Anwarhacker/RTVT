"use client"

import { useState, useEffect, useCallback } from "react"

export interface TranslationHistoryEntry {
  id: string
  timestamp: number
  inputText: string
  inputLanguage: string
  detectedLanguage?: string
  translations: Array<{
    language: string
    languageName: string
    text: string
  }>
}

interface TranslationHistoryHook {
  history: TranslationHistoryEntry[]
  addEntry: (entry: Omit<TranslationHistoryEntry, "id" | "timestamp">) => void
  removeEntry: (id: string) => void
  clearHistory: () => void
  exportHistory: () => void
}

const STORAGE_KEY = "voice-translator-history"
const MAX_HISTORY_ENTRIES = 100

export function useTranslationHistory(): TranslationHistoryHook {
  const [history, setHistory] = useState<TranslationHistoryEntry[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setHistory(Array.isArray(parsed) ? parsed : [])
      }
    } catch (error) {
      console.error("Failed to load translation history:", error)
    }
  }, [])

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history))
    } catch (error) {
      console.error("Failed to save translation history:", error)
    }
  }, [history])

  const addEntry = useCallback((entry: Omit<TranslationHistoryEntry, "id" | "timestamp">) => {
    const newEntry: TranslationHistoryEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    }

    setHistory((prev) => {
      const updated = [newEntry, ...prev]
      // Keep only the most recent entries
      return updated.slice(0, MAX_HISTORY_ENTRIES)
    })
  }, [])

  const removeEntry = useCallback((id: string) => {
    setHistory((prev) => prev.filter((entry) => entry.id !== id))
  }, [])

  const clearHistory = useCallback(() => {
    setHistory([])
  }, [])

  const exportHistory = useCallback(() => {
    try {
      const dataStr = JSON.stringify(history, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      const link = document.createElement("a")
      link.href = url
      link.download = `translation-history-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export history:", error)
    }
  }, [history])

  return {
    history,
    addEntry,
    removeEntry,
    clearHistory,
    exportHistory,
  }
}
