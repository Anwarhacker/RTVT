"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings } from "lucide-react"
import { useTextToSpeech } from "@/hooks/use-text-to-speech"

interface SettingsDialogProps {
  children?: React.ReactNode
}

interface AppSettings {
  ttsRate: number
  ttsPitch: number
  ttsVolume: number
  selectedVoice: string | null
  autoTranslate: boolean
  autoPlay: boolean
  streamingMode: boolean
}

const DEFAULT_SETTINGS: AppSettings = {
  ttsRate: 1,
  ttsPitch: 1,
  ttsVolume: 1,
  selectedVoice: "Default",
  autoTranslate: false,
  autoPlay: false,
  streamingMode: false,
}

export function SettingsDialog({ children }: SettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)

  const { voices, setRate, setPitch, setVolume, setVoice } = useTextToSpeech()

  // Load settings from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("voice-translator-settings")
      if (stored) {
        const parsed = JSON.parse(stored)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      }
    } catch (error) {
      console.error("Failed to load settings:", error)
    }
  }, [])

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("voice-translator-settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Failed to save settings:", error)
    }
  }, [settings])

  // Apply TTS settings
  useEffect(() => {
    setRate(settings.ttsRate)
    setPitch(settings.ttsPitch)
    setVolume(settings.ttsVolume)

    if (settings.selectedVoice) {
      const voice = voices.find((v) => v.name === settings.selectedVoice)
      setVoice(voice || null)
    }
  }, [settings, voices, setRate, setPitch, setVolume, setVoice])

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Text-to-Speech Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Text-to-Speech</h3>

            <div className="space-y-2">
              <Label htmlFor="voice-select">Voice</Label>
              <Select
                value={settings.selectedVoice || "Default"}
                onValueChange={(value) => updateSetting("selectedVoice", value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Default">Default</SelectItem>
                  {voices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Rate: {settings.ttsRate.toFixed(1)}</Label>
              <Slider
                value={[settings.ttsRate]}
                onValueChange={([value]) => updateSetting("ttsRate", value)}
                min={0.1}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Pitch: {settings.ttsPitch.toFixed(1)}</Label>
              <Slider
                value={[settings.ttsPitch]}
                onValueChange={([value]) => updateSetting("ttsPitch", value)}
                min={0}
                max={2}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Volume: {Math.round(settings.ttsVolume * 100)}%</Label>
              <Slider
                value={[settings.ttsVolume]}
                onValueChange={([value]) => updateSetting("ttsVolume", value)}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </div>

          {/* App Preferences */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Preferences</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-translate-setting">Auto-translate as I speak</Label>
              <input
                id="auto-translate-setting"
                type="checkbox"
                checked={settings.autoTranslate}
                onChange={(e) => updateSetting("autoTranslate", e.target.checked)}
                className="rounded border-border"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="auto-play-setting">Auto-play translated speech</Label>
              <input
                id="auto-play-setting"
                type="checkbox"
                checked={settings.autoPlay}
                onChange={(e) => updateSetting("autoPlay", e.target.checked)}
                className="rounded border-border"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="streaming-mode-setting">Real-time streaming mode</Label>
              <input
                id="streaming-mode-setting"
                type="checkbox"
                checked={settings.streamingMode}
                onChange={(e) => updateSetting("streamingMode", e.target.checked)}
                className="rounded border-border"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={resetSettings} variant="outline" className="flex-1 bg-transparent">
              Reset to Defaults
            </Button>
            <Button onClick={() => setOpen(false)} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
