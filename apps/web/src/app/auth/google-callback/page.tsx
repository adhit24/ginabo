"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildProfileUpsert } from "@/lib/auth/profileContract";

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

      try {
        // handle_new_user already created the row from auth.users metadata —
        // update it, don't upsert (see AuthProvider.signup for why upsert fails RLS).
        const profile = buildProfileUpsert({
          id: data.user.id,
          email: data.user.email ?? "",
          name: data.user.user_metadata?.full_name ?? data.user.email?.split("@")[0] ?? "User",
          phone: data.user.user_metadata?.phone_number ?? null,
        });
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ full_name: profile.full_name, phone_number: profile.phone_number } as never)
          .eq("id", profile.id);
        if (profileError) {
          router.replace("/auth/login?error=profile_failed");
          return;
        }
      } catch {
        router.replace("/auth/login?error=profile_failed");
        return;
      }

      router.replace("/member");
    }).catch(() => {
      router.replace("/auth/login?error=google_failed");
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
