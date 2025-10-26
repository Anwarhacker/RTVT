"use client"

import { Mic, Languages, Volume2, Zap, BookOpen, Brain, ArrowRight } from "lucide-react"

interface IntroSectionProps {
  onContinue: () => void
}

export function IntroSection({ onContinue }: IntroSectionProps) {
  return (
    <div className="absolute inset-0 gradient-bg z-50 overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-3 sm:p-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 rounded-full text-primary text-xs sm:text-sm font-medium">
              <Mic className="w-3 h-3 sm:w-4 sm:h-4" />
              AI-Powered Voice Translation
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance">
              <span className="inline-block animate-fade-in" style={{animationDelay: '0.2s'}}>
                Real-Time
              </span>
              {' '}
              <span className="inline-block animate-fade-in bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" style={{animationDelay: '0.4s'}}>
                Voice
              </span>
              {' '}
              <span className="inline-block animate-fade-in" style={{animationDelay: '0.6s'}}>
                Translator
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty px-4">
              Break language barriers instantly with our advanced AI translator featuring speech recognition,
              grammar correction, and natural voice synthesis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
            <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Mic className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Voice Recognition</h3>
              <p className="text-muted-foreground text-sm">
                Real-time speech-to-text conversion with high accuracy across multiple languages
              </p>
            </div>

            <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Languages className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Multi-Language Support</h3>
              <p className="text-muted-foreground text-sm">
                Support for 25+ languages including major Indian languages like Hindi, Tamil, Bengali
              </p>
            </div>

            <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Volume2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Natural Voice Synthesis</h3>
              <p className="text-muted-foreground text-sm">
                High-quality text-to-speech with adjustable speed and natural pronunciation
              </p>
            </div>

            <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Real-Time Streaming</h3>
              <p className="text-muted-foreground text-sm">
                See translations appear word-by-word as you speak for instant communication
              </p>
            </div>

            <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Grammar Correction</h3>
              <p className="text-muted-foreground text-sm">
                AI-powered grammar and spelling correction before translation for better accuracy
              </p>
            </div>

            <div className="bg-card/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border/30 hover:shadow-lg transition-all duration-300">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
                <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">Smart Analysis</h3>
              <p className="text-muted-foreground text-sm">
                Grammatical analysis with parts of speech tagging and contextual word definitions
              </p>
            </div>
          </div>

          <div className="bg-primary rounded-xl sm:rounded-2xl p-6 sm:p-8 mt-8 sm:mt-12">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 text-primary-foreground">
              Advanced Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span className="text-primary-foreground text-sm sm:text-base">Auto-translate as you speak</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span className="text-primary-foreground text-sm sm:text-base">Translation history with export</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span className="text-primary-foreground text-sm sm:text-base">Customizable voice settings</span>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span className="text-primary-foreground text-sm sm:text-base">Clickable word definitions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span className="text-primary-foreground text-sm sm:text-base">Multiple output languages</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary-foreground rounded-full"></div>
                  <span className="text-primary-foreground text-sm sm:text-base">Responsive design for all devices</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 sm:pt-8">
            <button
              onClick={onContinue}
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Get Started
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <p className="text-xs sm:text-sm text-muted-foreground mt-3">Start translating in seconds • No signup required</p>
          </div>
        </div>
      </div>
    </div>
  )
}