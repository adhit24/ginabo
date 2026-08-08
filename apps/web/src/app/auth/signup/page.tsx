"use client";

import { useRouter } from "next/navigation";
import { AuthModal } from "@/components/auth/AuthModal";

export default function SignupPage() {
  const router = useRouter();
  return <AuthModal open initialTab="signup" onClose={() => router.push("/")} />;
}
