"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeftRight } from "lucide-react";

interface Language {
  code: string;
  name: string;
}

interface LanguageSelectorProps {
  inputLanguage: string;
  outputLanguage: string;
  onInputLanguageChange: (language: string) => void;
  onOutputLanguageChange: (language: string) => void;
  onSwapLanguages: () => void;
  languages: Language[];
}

const LanguageSelectorComponent = memo(function LanguageSelectorComponent({
  inputLanguage,
  outputLanguage,
  onInputLanguageChange,
  onOutputLanguageChange,
  onSwapLanguages,
  languages,
}: LanguageSelectorProps) {
  return (
    <div className="flex flex-col xs:flex-row items-center gap-3 xs:gap-4 p-3 sm:p-4 bg-card/60 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-border/30 shadow-lg">
      <div className="flex items-center gap-2">
        <Select value={inputLanguage} onValueChange={onInputLanguageChange}>
          <SelectTrigger className="w-32 sm:w-36 bg-background/50 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={onSwapLanguages}
        variant="ghost"
        size="sm"
        disabled={inputLanguage === "auto"}
        className="p-2 hover:bg-primary/10 transition-all duration-300 hover:scale-110 rounded-lg"
        title="Swap languages"
      >
        <ArrowLeftRight className="h-4 w-4 text-primary" />
      </Button>

      <div className="flex items-center gap-2">
        <Select value={outputLanguage} onValueChange={onOutputLanguageChange}>
          <SelectTrigger className="w-32 sm:w-36 bg-background/50 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages
              .filter((lang) => lang.code !== "auto")
              .map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});

export const LanguageSelector = LanguageSelectorComponent;
