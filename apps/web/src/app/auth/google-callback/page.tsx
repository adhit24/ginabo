"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const email = searchParams.get("email");
    const name = searchParams.get("name");

    if (!email) {
      router.replace("/auth/login?error=google_failed");
      return;
    }

    const displayName = name ?? email.split("@")[0];
    const user = {
      id: `usr_${Math.random().toString(36).slice(2, 10)}`,
      name: displayName.charAt(0).toUpperCase() + displayName.slice(1),
      email,
      tier: "Regular" as const,
      points: 100,
      joinedAt: new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(new Date()),
      provider: "google",
    };

    try {
      localStorage.setItem("ginabo_user", JSON.stringify(user));
    } catch {
      // ignore
    }

    router.replace("/member");
  }, [searchParams, router]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "linear-gradient(135deg,#0f0a1e 0%,#1e0a38 50%,#2a1040 100%)" }}
    >
      <div className="text-center">
        <div
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full"
          style={{ border: "3px solid rgba(255,255,255,0.1)", borderTopColor: "#a855f7" }}
        />
        <p className="text-sm text-white/50">Menghubungkan akun Google...</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense>
      <GoogleCallbackInner />
    </Suspense>
  );
}
