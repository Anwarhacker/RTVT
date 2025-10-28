"use client";

import {
  Globe,
  Sparkles,
  Volume2,
  Languages,
  BookOpen,
  ImageIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function AppHeader() {
  return (
    <div className="text-center py-8 sm:py-12 mb-8 ">
      <div className="flex items-center justify-center gap-3 mb-4">
        {/* <div className="p-3 bg-black rounded-2xl">
          <Globe className="h-8 w-8 text-white" />
        </div> */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground">
          <span
            className="inline-block animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            Real-Time
          </span>{" "}
          <span
            className="inline-block animate-fade-in bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            style={{ animationDelay: "0.3s" }}
          >
            Voice
          </span>{" "}
          <span
            className="inline-block animate-fade-in"
            style={{ animationDelay: "0.5s" }}
          >
            Translator
          </span>
        </h1>
      </div>
      <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 text-balance">
        Break language barriers instantly with AI-powered real-time speech
        translation
      </p>

      <div
        className="flex flex-wrap justify-center gap-4 mb-8 animate-slide-in-up"
        style={{ animationDelay: "0.7s" }}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-card/60 rounded-full border border-border/30 backdrop-blur-sm">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Real-time Translation
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card/60 rounded-full border border-border/30 backdrop-blur-sm">
          <Volume2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            Voice Recognition
          </span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card/60 rounded-full border border-border/30 backdrop-blur-sm">
          <Languages className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            25+ Languages
          </span>
        </div>
      </div>

      <div className="overflow-x-auto flex gap-4  py-4 rounded-lg  px-4">
        <Button
          asChild
          variant="outline"
          // size="sm"
          className="bg-background/60 py-6 px-6 transition-all duration-300 hover:scale-[1.02] rounded-lg shadow-sm"
        >
          <Link href="/dictionary">
            <BookOpen className="h-4 w-4 mr-2" />
            Dictionary
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="bg-background/60 py-6 px-6 transition-all duration-300 hover:scale-[1.02] rounded-lg shadow-sm"
        >
          <Link href="/image-analysis">
            <ImageIcon className="h-4 w-4 mr-2" />
            Image Analysis
          </Link>
        </Button>
      </div>
    </div>
  );
}
