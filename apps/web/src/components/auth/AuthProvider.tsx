"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export type MemberTier = "Regular" | "Silver" | "Gold" | "Platinum";

export interface User {
  id: string;
  name: string;
  email: string;
  tier: MemberTier;
  points: number;
  joinedAt: string;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  signInWithGoogle: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MONTHS = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];

function toAppUser(supabaseUser: SupabaseUser, profile?: Record<string, unknown> | null): User {
  const createdAt = new Date(supabaseUser.created_at);
  return {
    id: supabaseUser.id,
    name: (profile?.full_name as string) ?? supabaseUser.user_metadata?.full_name ?? supabaseUser.email?.split("@")[0] ?? "User",
    email: supabaseUser.email ?? "",
    tier: "Regular",
    points: (profile?.loyalty_points as number) ?? 100,
    joinedAt: `${MONTHS[createdAt.getMonth()]} ${createdAt.getFullYear()}`,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchAndSetUser(supabaseUser: SupabaseUser) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, loyalty_points")
        .eq("id", supabaseUser.id)
        .single();
      setUser(toAppUser(supabaseUser, profile));
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchAndSetUser(session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Set flag cookie so middleware can detect auth server-side
        document.cookie = `ginabo-auth-status=1; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`;
        fetchAndSetUser(session.user).catch(() => {
          setUser(toAppUser(session.user));
        });
      } else {
        document.cookie = "ginabo-auth-status=; path=/; max-age=0";
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function login(email: string, password: string) {
    if (!email.includes("@")) return { ok: false, error: "Format email tidak valid." };
    if (!password) return { ok: false, error: "Password tidak boleh kosong." };

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.toLowerCase().includes("invalid login")) {
        return { ok: false, error: "Email atau password salah. Silakan coba lagi atau daftar terlebih dahulu." };
      }
      return { ok: false, error: error.message };
    }
    return { ok: true };
  }

  async function signup(name: string, email: string, password: string) {
    if (!email.includes("@")) return { ok: false, error: "Format email tidak valid." };
    if (!name.trim()) return { ok: false, error: "Nama tidak boleh kosong." };
    if (!password || password.length < 6) return { ok: false, error: "Password minimal 6 karakter." };

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name.trim() } },
    });

    if (error) {
      if (error.message.toLowerCase().includes("already registered")) {
        return { ok: false, error: "Email sudah terdaftar. Silakan login." };
      }
      return { ok: false, error: error.message };
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        email,
        full_name: name.trim(),
        loyalty_points: 100,
      });
    }

    return { ok: true };
  }

  function logout() {
    createClient().auth.signOut();
    setUser(null);
  }

  function signInWithGoogle() {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://ginabo.id";
    createClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${origin}/auth/callback` },
    });
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
