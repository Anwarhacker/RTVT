"use client";

import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  showDebugInfo?: boolean;
  className?: string;
}

export function PerformanceMonitor({
  onMetricsUpdate,
  showDebugInfo = false,
  className,
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if Performance API is supported
    if (
      typeof window !== "undefined" &&
      "performance" in window &&
      "PerformanceObserver" in window
    ) {
      setIsSupported(true);
      initializeObservers();
    }
  }, []);

  const initializeObservers = useCallback(() => {
    if (!isSupported) return;

    // First Contentful Paint
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics((prev) => {
          const newMetrics = { ...prev, fcp: lastEntry.startTime };
          onMetricsUpdate?.(newMetrics);
          return newMetrics;
        });
      });
      fcpObserver.observe({ entryTypes: ["paint"] });
    } catch (e) {
      console.warn("FCP observer not supported");
    }

    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        setMetrics((prev) => {
          const newMetrics = { ...prev, lcp: lastEntry.startTime };
          onMetricsUpdate?.(newMetrics);
          return newMetrics;
        });
      });
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch (e) {
      console.warn("LCP observer not supported");
    }

    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          setMetrics((prev) => {
            const newMetrics = {
              ...prev,
              fid: entry.processingStart - entry.startTime,
            };
            onMetricsUpdate?.(newMetrics);
            return newMetrics;
          });
        });
      });
      fidObserver.observe({ entryTypes: ["first-input"] });
    } catch (e) {
      console.warn("FID observer not supported");
    }

    // Cumulative Layout Shift
    try {
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        setMetrics((prev) => {
          const newMetrics = { ...prev, cls: clsValue };
          onMetricsUpdate?.(newMetrics);
          return newMetrics;
        });
      });
      clsObserver.observe({ entryTypes: ["layout-shift"] });
    } catch (e) {
      console.warn("CLS observer not supported");
    }

    // Time to First Byte (from navigation timing)
    try {
      const navigation = performance.getEntriesByType(
        "navigation"
      )[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setMetrics((prev) => {
          const newMetrics = { ...prev, ttfb };
          onMetricsUpdate?.(newMetrics);
          return newMetrics;
        });
      }
    } catch (e) {
      console.warn("TTFB calculation failed");
    }
  }, [isSupported, onMetricsUpdate]);

  const getScoreColor = (
    metric: keyof PerformanceMetrics,
    value: number | null
  ) => {
    if (value === null) return "text-gray-400";

    switch (metric) {
      case "fcp":
      case "lcp":
        if (value < 1800) return "text-green-600";
        if (value < 3000) return "text-yellow-600";
        return "text-red-600";
      case "fid":
        if (value < 100) return "text-green-600";
        if (value < 300) return "text-yellow-600";
        return "text-red-600";
      case "cls":
        if (value < 0.1) return "text-green-600";
        if (value < 0.25) return "text-yellow-600";
        return "text-red-600";
      case "ttfb":
        if (value < 800) return "text-green-600";
        if (value < 1800) return "text-yellow-600";
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatMetric = (
    metric: keyof PerformanceMetrics,
    value: number | null
  ) => {
    if (value === null) return "N/A";

    switch (metric) {
      case "fcp":
      case "lcp":
      case "ttfb":
        return `${Math.round(value)}ms`;
      case "fid":
        return `${Math.round(value * 100) / 100}ms`;
      case "cls":
        return value.toFixed(4);
      default:
        return value.toString();
    }
  };

  if (!showDebugInfo) return null;

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-50 bg-black/80 text-white p-3 rounded-lg text-xs font-mono max-w-xs",
        className
      )}
    >
      <div className="font-bold mb-2">Performance Metrics</div>
      <div className="space-y-1">
        <div>
          FCP:{" "}
          <span className={getScoreColor("fcp", metrics.fcp)}>
            {formatMetric("fcp", metrics.fcp)}
          </span>
        </div>
        <div>
          LCP:{" "}
          <span className={getScoreColor("lcp", metrics.lcp)}>
            {formatMetric("lcp", metrics.lcp)}
          </span>
        </div>
        <div>
          FID:{" "}
          <span className={getScoreColor("fid", metrics.fid)}>
            {formatMetric("fid", metrics.fid)}
          </span>
        </div>
        <div>
          CLS:{" "}
          <span className={getScoreColor("cls", metrics.cls)}>
            {formatMetric("cls", metrics.cls)}
          </span>
        </div>
        <div>
          TTFB:{" "}
          <span className={getScoreColor("ttfb", metrics.ttfb)}>
            {formatMetric("ttfb", metrics.ttfb)}
          </span>
        </div>
      </div>
      {!isSupported && (
        <div className="text-yellow-400 mt-2">
          Performance API not supported
        </div>
      )}
    </div>
  );
}

// Performance monitoring hook
export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
  });

  const updateMetrics = useCallback((newMetrics: PerformanceMetrics) => {
    setMetrics(newMetrics);

    // Send to analytics if available
    if (typeof window !== "undefined" && (window as any).gtag) {
      Object.entries(newMetrics).forEach(([key, value]) => {
        if (value !== null) {
          (window as any).gtag("event", "web_vitals", {
            name: key.toUpperCase(),
            value: Math.round(value),
            event_category: "Web Vitals",
          });
        }
      });
    }
  }, []);

  return { metrics, updateMetrics };
}
