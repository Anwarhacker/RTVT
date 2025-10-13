"use client";

import { Globe, Sparkles, Volume2, Languages } from "lucide-react";

export function AppHeader() {
  return (
    <div className="text-center py-8 sm:py-12 mb-8 ">
      <div className="flex items-center justify-center gap-3 mb-4">
        {/* <div className="p-3 bg-black rounded-2xl">
          <Globe className="h-8 w-8 text-white" />
        </div> */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-black">
          Real-Time Voice Translator
        </h1>
      </div>
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 text-balance">
        Break language barriers instantly with AI-powered real-time speech
        translation
      </p>

      <div className="flex flex-wrap justify-center gap-4 mb-8 animate-slide-up">
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-black">
          <Sparkles className="h-4 w-4 text-black" />
          <span className="text-sm font-medium text-black">
            Real-time Translation
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-black">
          <Volume2 className="h-4 w-4 text-black" />
          <span className="text-sm font-medium text-black">
            Voice Recognition
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-black">
          <Languages className="h-4 w-4 text-black" />
          <span className="text-sm font-medium text-black">25+ Languages</span>
        </div>
      </div>
    </div>
  );
}
