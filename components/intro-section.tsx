"use client"

import { Mic, Languages, Volume2, Zap, BookOpen, Brain, ArrowRight } from "lucide-react"

interface IntroSectionProps {
  onContinue: () => void
}

export function IntroSection({ onContinue }: IntroSectionProps) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4 py-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full text-emerald-700 text-sm font-medium">
              <Mic className="w-4 h-4" />
              AI-Powered Voice Translation
            </div>
            <h1 className="text-5xl font-bold text-gray-900 text-balance">
              Real-Time Voice Translator
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto text-pretty">
              Break language barriers instantly with our advanced AI translator featuring speech recognition,
              grammar correction, and natural voice synthesis.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Mic className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Recognition</h3>
              <p className="text-gray-600 text-sm">
                Real-time speech-to-text conversion with high accuracy across multiple languages
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Languages className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Multi-Language Support</h3>
              <p className="text-gray-600 text-sm">
                Support for 25+ languages including major Indian languages like Hindi, Tamil, Bengali
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Volume2 className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Natural Voice Synthesis</h3>
              <p className="text-gray-600 text-sm">
                High-quality text-to-speech with adjustable speed and natural pronunciation
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-Time Streaming</h3>
              <p className="text-gray-600 text-sm">
                See translations appear word-by-word as you speak for instant communication
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grammar Correction</h3>
              <p className="text-gray-600 text-sm">
                AI-powered grammar and spelling correction before translation for better accuracy
              </p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analysis</h3>
              <p className="text-gray-600 text-sm">
                Grammatical analysis with parts of speech tagging and contextual word definitions
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-emerald-600 to-green-700 rounded-2xl p-8 mt-12" style={{ backgroundColor: "#059669" }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: "#ffffff" }}>
              Advanced Features
            </h3>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span style={{ color: "#ffffff" }}>Auto-translate as you speak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span style={{ color: "#ffffff" }}>Translation history with export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span style={{ color: "#ffffff" }}>Customizable voice settings</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span style={{ color: "#ffffff" }}>Clickable word definitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span style={{ color: "#ffffff" }}>Multiple output languages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span style={{ color: "#ffffff" }}>Responsive design for all devices</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-sm text-gray-500 mt-3">Start translating in seconds • No signup required</p>
          </div>
        </div>
      </div>
    </div>
  )
}