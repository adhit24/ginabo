"use client";

import { useState, useEffect, type ReactNode } from "react";
import { initAttributionTracker, getOrCreateSessionId } from "@/lib/attribution/attributionTracker";
import { trackCustomerEvent } from "@/lib/analytics/events";

export function ClientShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const attribution = initAttributionTracker();
      const sessId = getOrCreateSessionId();
      const sessionLoggedKey = `ginabo_session_${sessId}_logged`;
      if (!sessionStorage.getItem(sessionLoggedKey)) {
        sessionStorage.setItem(sessionLoggedKey, "1");
        trackCustomerEvent({
          event_name: "session_started",
          metadata: {
            channel: attribution.attribution_channel,
            source: attribution.utm_source,
            campaign: attribution.utm_campaign,
          },
        });
      }
    } catch {
      // Safe fallback
    }
  }, []);

  return (
    <div className="min-h-dvh bg-[#fffafa]" suppressHydrationWarning>
      {mounted ? children : (
        <div className="min-h-screen" />
      )}
    </div>
  );
}
