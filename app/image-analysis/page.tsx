"use client";

import { ImageAnalysis } from "../../components/image-analysis";
import { ArrowLeft, ImageIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import Link from "next/link";

export default function ImageAnalysisPage() {
  return (
    <div className="min-h-screen gradient-bg p-3 sm:p-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <div className="flex flex-col xs:flex-row items-start xs:items-center gap-3 xs:gap-4 mb-6 sm:mb-8">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg shadow-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Translator
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
          <div className="p-2 sm:p-3 bg-primary/10 rounded-lg sm:rounded-xl">
            <ImageIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            Image Analysis
          </h1>
        </div>

        <ImageAnalysis />
      </div>
    </div>
  );
}
