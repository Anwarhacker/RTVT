"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Settings, RotateCcw } from "lucide-react";
import { useAccessibility } from "@/components/accessibility-provider";

export function AccessibilitySettings() {
  const { settings, updateSetting, resetSettings } = useAccessibility();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
        <CardDescription>
          Customize your experience for better accessibility
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast" className="text-base">
                High Contrast
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) =>
                updateSetting("highContrast", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text" className="text-base">
                Large Text
              </Label>
              <p className="text-sm text-muted-foreground">
                Increase text size for better readability
              </p>
            </div>
            <Switch
              id="large-text"
              checked={settings.largeText}
              onCheckedChange={(checked) => updateSetting("largeText", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion" className="text-base">
                Reduced Motion
              </Label>
              <p className="text-sm text-muted-foreground">
                Minimize animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) =>
                updateSetting("reducedMotion", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader" className="text-base">
                Screen Reader Support
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable screen reader announcements
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={(checked) =>
                updateSetting("screenReader", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="keyboard-nav" className="text-base">
                Keyboard Navigation
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable keyboard navigation shortcuts
              </p>
            </div>
            <Switch
              id="keyboard-nav"
              checked={settings.keyboardNavigation}
              onCheckedChange={(checked) =>
                updateSetting("keyboardNavigation", checked)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-visible" className="text-base">
                Focus Indicators
              </Label>
              <p className="text-sm text-muted-foreground">
                Show focus rings on interactive elements
              </p>
            </div>
            <Switch
              id="focus-visible"
              checked={settings.focusVisible}
              onCheckedChange={(checked) =>
                updateSetting("focusVisible", checked)
              }
            />
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button variant="outline" onClick={resetSettings} className="w-full">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
