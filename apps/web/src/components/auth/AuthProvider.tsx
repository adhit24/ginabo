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

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mockUser(email: string, name?: string): User {
  const prefix = name ?? email.split("@")[0];
  const displayName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
  return {
    id: `usr_${Math.random().toString(36).slice(2, 10)}`,
    name: displayName,
    email,
    tier: "Silver",
    points: 1250,
    joinedAt: "Januari 2024",
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

  async function login(email: string, _password: string) {
    if (!email.includes("@")) {
      return { ok: false, error: "Format email tidak valid." };
    }
    const u = mockUser(email);
    localStorage.setItem("ginabo_user", JSON.stringify(u));
    setUser(u);
    return { ok: true };
  }

  async function signup(name: string, email: string, _password: string) {
    if (!email.includes("@")) {
      return { ok: false, error: "Format email tidak valid." };
    }
    if (!name.trim()) {
      return { ok: false, error: "Nama tidak boleh kosong." };
    }
    const u = mockUser(email, name);
    u.points = 100;
    u.tier = "Regular";
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
