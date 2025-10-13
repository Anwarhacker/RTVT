"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ErrorAlertsProps {
  translationError: string | null;
  speechError: string | null;
  isSpeechSupported: boolean;
  isTTSSupported: boolean;
}

export function ErrorAlerts({
  translationError,
  speechError,
  isSpeechSupported,
  isTTSSupported,
}: ErrorAlertsProps) {
  return (
    <>
      {translationError && (
        <Alert variant="destructive" className="mb-6 animate-scale-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{translationError}</AlertDescription>
        </Alert>
      )}

      {speechError && (
        <Alert variant="destructive" className="mb-6 animate-scale-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{speechError}</AlertDescription>
        </Alert>
      )}

      {!isSpeechSupported && (
        <Alert className="mb-6 animate-scale-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Speech recognition is not supported in this browser. Voice input
            will not be available.
          </AlertDescription>
        </Alert>
      )}

      {!isTTSSupported && (
        <Alert className="mb-6 animate-scale-in">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Text-to-speech is not supported in this browser. Audio playback
            will not be available.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}