"use client";

import { Globe, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AppFooter() {
  return (
    <footer className="mt-8 sm:mt-12 lg:mt-16 mb-4 sm:mb-6 lg:mb-8">
      <div className="bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/30 shadow-lg">
        <div className="py-4 sm:py-6 lg:py-8 px-4 sm:px-6">
          {/* Header Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg sm:rounded-xl">
                <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                Voice Translator
              </h3>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto px-4">
              Breaking language barriers with AI-powered translation
            </p>
          </div>

          {/* Developers Section */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex flex-col xs:flex-row items-center gap-1 xs:gap-2 px-3 sm:px-4 py-2 bg-primary/5 rounded-full border border-primary/20">
              <span className="text-primary font-medium text-xs sm:text-sm">Developers:</span>
              <span className="text-foreground text-xs sm:text-sm text-center">
                Anwar Patel • Goussoddin • Pooja Pasarge • Shreya Reddy
              </span>
            </div>
          </div>

          {/* Features & Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6 pt-4 sm:pt-6 border-t border-border/30">
            <div className="flex flex-col xs:flex-row items-center gap-1 xs:gap-2 text-xs sm:text-sm text-muted-foreground">
              <span>© 2024 Voice Translator</span>
              <span className="hidden xs:block w-1 h-1 bg-muted-foreground rounded-full" />
              <span>Open Source</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
                <Globe className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">25+ Languages</span>
                <span className="xs:hidden">25+</span>
              </Badge>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
                <Zap className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Real-time AI</span>
                <span className="xs:hidden">AI</span>
              </Badge>
              <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                <span className="hidden xs:inline">Grammar Check</span>
                <span className="xs:hidden">Grammar</span>
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
