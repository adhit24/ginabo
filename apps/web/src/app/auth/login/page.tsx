"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthModal } from "@/components/auth/AuthModal";

const ERROR_MESSAGES: Record<string, string> = {
  google_failed: "Gagal masuk dengan Google. Silakan coba lagi.",
  google_cancelled: "Login dengan Google dibatalkan.",
  profile_failed: "Akun berhasil masuk, tetapi data profil gagal disimpan. Silakan coba lagi.",
  not_configured: "Login dengan Google belum tersedia saat ini.",
  token_failed: "Gagal memverifikasi akun Google. Silakan coba lagi.",
  server_error: "Terjadi kesalahan server. Silakan coba lagi.",
  auth_failed: "Sesi login tidak valid atau sudah kedaluwarsa. Silakan login ulang.",
};

function LoginPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const next = searchParams.get("next");

  return (
    <AuthModal
      open
      initialTab="login"
      initialError={errorCode ? ERROR_MESSAGES[errorCode] ?? "Terjadi kesalahan. Silakan coba lagi." : undefined}
      redirectTo={next && next.startsWith("/") ? next : "/member"}
      onClose={() => router.push("/")}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
