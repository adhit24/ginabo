"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";

function GoogleCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const idToken = searchParams.get("id_token");

    if (!idToken) {
      router.replace("/auth/login?error=google_failed");
      return;
    }

    const supabase = createClient();

    supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    }).then(async ({ data, error }) => {
      if (error || !data.user) {
        router.replace("/auth/login?error=google_failed");
        return;
      }

      await supabase.from("profiles").upsert({
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "User",
        loyalty_points: 100,
      } as never);

      router.replace("/member");
    });
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
