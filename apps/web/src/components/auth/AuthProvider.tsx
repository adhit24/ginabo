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
  phone: string | null;
  dateOfBirth: string | null;
  gender: "male" | "female" | "other" | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
  signInWithGoogle: () => void;
  changePassword: (newPassword: string) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
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
    phone: (profile?.phone_number as string) ?? (profile?.phone as string) ?? null,
    dateOfBirth: (profile?.date_of_birth as string) ?? null,
    gender: (profile?.gender as User["gender"]) ?? null,
    avatarUrl: (profile?.avatar_url as string) ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchAndSetUser(supabaseUser: SupabaseUser) {
    const supabase = createClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("full_name, phone_number, date_of_birth, avatar_url")
      .eq("id", supabaseUser.id)
      .single();
    if (error) {
      setUser((current) => current?.id === supabaseUser.id ? current : toAppUser(supabaseUser));
      return;
    }

    // `gender` was added after the original profiles schema. Read it
    // separately so older staging databases still load the other fields.
    const { data: genderProfile } = await supabase
      .from("profiles")
      .select("gender")
      .eq("id", supabaseUser.id)
      .single();
    const profileRecord = (profile as Record<string, unknown> | null) ?? {};
    const gender = (genderProfile as { gender?: User["gender"] } | null)?.gender ?? null;
    setUser(toAppUser(supabaseUser, { ...profileRecord, gender }));
  }

  useEffect(() => {
    const supabase = createClient();
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
      } as never);
    }

    return { ok: true };
  }

  function logout() {
    createClient().auth.signOut();
    setUser(null);
  }

  function signInWithGoogle() {
    window.location.href = "/api/auth/google";
  }

  async function changePassword(newPassword: string) {
    if (!newPassword || newPassword.length < 6) return { ok: false, error: "Password minimal 6 karakter." };

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }

  async function refreshProfile() {
    const supabase = createClient();
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser) await fetchAndSetUser(supabaseUser);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, signInWithGoogle, changePassword, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
