"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";

interface TurnstileProps {
  onVerify: (token: string) => void;
  options?: {
    action?: string;
    cData?: string;
    theme?: "light" | "dark" | "auto";
  };
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          action?: string;
          cData?: string;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

export function Turnstile({ onVerify, options }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [widgetId, setWidgetId] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const CustomScript = Script as any;

  useEffect(() => {
    // Register script loading completion check if turnstile is already present in window
    if (typeof window !== "undefined" && window.turnstile) {
      setScriptLoaded(true);
    }
  }, []);

  useEffect(() => {
    // If turnstile script is loaded and we have a ref, render
    if (scriptLoaded && window.turnstile && containerRef.current && siteKey && !widgetId) {
      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          theme: options?.theme || "light",
          action: options?.action,
          cData: options?.cData,
        });
        setWidgetId(id);
      } catch (err) {
        console.error("Failed to render Cloudflare Turnstile:", err);
      }
    }

    return () => {
      if (widgetId && window.turnstile) {
        try {
          window.turnstile.remove(widgetId);
        } catch (e) {
          // ignore
        }
      }
    };
  }, [scriptLoaded, siteKey, options, onVerify, widgetId]);

  if (!siteKey) {
    return (
      <div className="p-3 border border-dashed border-amber-300 bg-amber-50 text-amber-800 text-[12.5px] rounded-[5px] text-center my-3">
        ⚠️ Cloudflare Turnstile: Site Key belum diatur di variabel lingkungan.
      </div>
    );
  }

  return (
    <div className="my-3 flex justify-center">
      <CustomScript
        src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} />
    </div>
  );
}
