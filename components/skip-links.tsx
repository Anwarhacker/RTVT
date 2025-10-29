"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/components/accessibility-provider";

export function SkipLinks() {
  const { settings } = useAccessibility();

  if (!settings.keyboardNavigation) return null;

  const handleSkipToContent = () => {
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({
        behavior: settings.reducedMotion ? "auto" : "smooth",
      });
    }
  };

  const handleSkipToNavigation = () => {
    const navigation = document.querySelector("nav, [role='navigation']");
    if (navigation) {
      (navigation as HTMLElement).focus();
      navigation.scrollIntoView({
        behavior: settings.reducedMotion ? "auto" : "smooth",
      });
    }
  };

  return (
    <div className="sr-only focus-within:not-sr-only focus-within:absolute focus-within:top-0 focus-within:left-0 focus-within:z-50 focus-within:flex focus-within:gap-2 focus-within:p-4 focus-within:bg-background focus-within:border focus-within:border-border focus-within:shadow-lg">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipToContent}
        className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to main content
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSkipToNavigation}
        className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Skip to navigation
      </Button>
    </div>
  );
}
