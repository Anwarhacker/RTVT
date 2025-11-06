"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallButtonProps {
  variant?: "icon" | "full";
}

export function InstallButton({ variant = "full" }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    console.log("[Install] InstallButton component mounted");
    
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      console.log("[Install] App is already installed");
      setIsInstalled(true);
      return;
    }

    console.log("[Install] Waiting for beforeinstallprompt event...");
    console.log("[Install] Current protocol:", window.location.protocol);
    console.log("[Install] Is HTTPS or localhost?", 
      window.location.protocol === "https:" || 
      window.location.hostname === "localhost"
    );

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      console.log("[Install] ✅ beforeinstallprompt event fired - App is installable!");
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show install prompt after 5 seconds
      setTimeout(() => {
        console.log("[Install] Showing install prompt card");
        setShowInstallPrompt(true);
      }, 5000);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      console.log("[Install] App was installed");
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("[Install] No deferred prompt available");
      return;
    }

    console.log("[Install] Showing install prompt");
    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[Install] User response: ${outcome}`);

    if (outcome === "accepted") {
      console.log("[Install] User accepted the install prompt");
    } else {
      console.log("[Install] User dismissed the install prompt");
    }

    // Clear the deferred prompt
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem(
      "install-prompt-dismissed",
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );
  };

  // Full install prompt card (only when conditions are met)
  if (showInstallPrompt && deferredPrompt) {
    return (
      <>
        <Button
          onClick={handleInstallClick}
          variant="outline"
          size="icon"
          className="relative"
          title="Install App"
        >
          <Download className="h-4 w-4" />
        </Button>
        <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50 p-4 shadow-lg border-2 border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Install RTVT App</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Install this app on your device for quick access and offline
                support.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  size="sm"
                  className="flex-1"
                >
                  Install
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="flex-1"
                >
                  Not Now
                </Button>
              </div>
            </div>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="icon"
              className="flex-shrink-0 h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </>
    );
  }

  // Always show button, but behavior depends on installability
  if (isInstalled) {
    return variant === "full" ? (
      <Button
        variant="outline"
        size="lg"
        className="relative min-w-[160px]"
        title="App Already Installed"
        disabled
      >
        <Download className="h-5 w-5 text-green-500 mr-2" />
        Installed
      </Button>
    ) : (
      <Button
        variant="outline"
        size="icon"
        className="relative"
        title="App Already Installed"
        disabled
      >
        <Download className="h-4 w-4 text-green-500" />
      </Button>
    );
  }

  if (deferredPrompt) {
    return variant === "full" ? (
      <Button
        onClick={handleInstallClick}
        size="lg"
        className="relative min-w-[160px] bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
        title="Install App"
      >
        <Download className="h-5 w-5 mr-2" />
        Install RTVT
      </Button>
    ) : (
      <Button
        onClick={handleInstallClick}
        variant="outline"
        size="icon"
        className="relative"
        title="Install App"
      >
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  // Show button even if not installable yet (for visibility)
  const handleNotInstallableClick = () => {
    alert(
      "📱 Install Feature\n\n" +
      "The install feature requires:\n" +
      "✓ HTTPS connection (or localhost)\n" +
      "✓ Valid web manifest\n" +
      "✓ Service worker registered\n" +
      "✓ Chrome, Edge, or supported browser\n\n" +
      "Current status: Waiting for browser install prompt...\n\n" +
      "💡 Tip: Deploy to Vercel/Netlify to enable full PWA installation!"
    );
  };

  return variant === "full" ? (
    <Button
      variant="outline"
      size="lg"
      className="relative cursor-pointer hover:bg-accent min-w-[160px]"
      title="Click for install information"
      onClick={handleNotInstallableClick}
    >
      <Download className="h-5 w-5 mr-2" />
      Install RTVT
    </Button>
  ) : (
    <Button
      variant="outline"
      size="icon"
      className="relative cursor-pointer hover:bg-accent"
      title="Click for install information"
      onClick={handleNotInstallableClick}
    >
      <Download className="h-4 w-4" />
    </Button>
  );
}
