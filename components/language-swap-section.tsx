"use client";

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

interface OutputLanguage {
  code: string;
  name: string;
  text: string;
}

interface LanguageSwapSectionProps {
  inputLanguage: string;
  outputLanguages: OutputLanguage[];
  languages: Language[];
  onInputLanguageChange: (value: string) => void;
  onOutputLanguageChange: (index: number, value: string) => void;
  onSwapLanguages: () => void;
}

export function LanguageSwapSection({
  inputLanguage,
  outputLanguages,
  languages,
  onInputLanguageChange,
  onOutputLanguageChange,
  onSwapLanguages,
}: LanguageSwapSectionProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-2xl border-2 border-border">
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
        disabled={inputLanguage === "auto" || outputLanguages.length === 0}
        className="p-2 hover:bg-primary/10 transition-all duration-200 hover:scale-110"
        title="Swap languages"
      >
        <ArrowLeftRight className="h-4 w-4 text-primary" />
      </Button>

      <div className="flex items-center gap-2">
        <Select
          value={outputLanguages[0]?.code || "en"}
          onValueChange={(value) => onOutputLanguageChange(0, value)}
        >
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
}
