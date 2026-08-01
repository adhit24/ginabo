"use client";

import { useState, useEffect, type ReactNode } from "react";

export function ClientShell({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-dvh bg-[#fffafa]" suppressHydrationWarning>
      {mounted ? children : (
        <div className="min-h-screen" />
      )}
    </div>
  );
}
