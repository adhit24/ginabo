"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type MemberTier = "Regular" | "Silver" | "Gold" | "Platinum";

export interface User {
  id: string;
  name: string;
  email: string;
  tier: MemberTier;
  points: number;
  joinedAt: string;
}

interface RegisteredAccount {
  email: string;
  password: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCOUNTS_KEY = "ginabo_accounts";

function getAccounts(): RegisteredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: RegisteredAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function createUser(email: string, name: string): User {
  const now = new Date();
  const months = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
  return {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name,
    email,
    tier: "Regular",
    points: 100,
    joinedAt: `${months[now.getMonth()]} ${now.getFullYear()}`,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("ginabo_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored) as User);
      } catch {
        localStorage.removeItem("ginabo_user");
      }
    }
    setIsLoading(false);
  }, []);

  async function login(email: string, password: string) {
    if (!email.includes("@")) {
      return { ok: false, error: "Format email tidak valid." };
    }
    if (!password) {
      return { ok: false, error: "Password tidak boleh kosong." };
    }

    const accounts = getAccounts();
    const account = accounts.find(
      a => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    );

    if (!account) {
      return { ok: false, error: "Email atau password salah. Silakan coba lagi atau daftar terlebih dahulu." };
    }

    localStorage.setItem("ginabo_user", JSON.stringify(account.user));
    setUser(account.user);
    return { ok: true };
  }

  async function signup(name: string, email: string, password: string) {
    if (!email.includes("@")) {
      return { ok: false, error: "Format email tidak valid." };
    }
    if (!name.trim()) {
      return { ok: false, error: "Nama tidak boleh kosong." };
    }
    if (!password || password.length < 6) {
      return { ok: false, error: "Password minimal 6 karakter." };
    }

    const accounts = getAccounts();
    const exists = accounts.find(a => a.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { ok: false, error: "Email sudah terdaftar. Silakan login." };
    }

    const u = createUser(email, name.trim());
    accounts.push({ email: email.toLowerCase(), password, user: u });
    saveAccounts(accounts);

    localStorage.setItem("ginabo_user", JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }

  function logout() {
    localStorage.removeItem("ginabo_user");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
