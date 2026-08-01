"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function CallbackInner() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          router.replace("/auth/login?error=auth_failed");
        } else {
          router.replace("/member");
        }
      });
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        router.replace(session ? "/member" : "/auth/login");
      });
    }
  }, [router]);

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
        <p className="text-sm text-white/50">Menghubungkan akun...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <CallbackInner />
    </Suspense>
  );
}
