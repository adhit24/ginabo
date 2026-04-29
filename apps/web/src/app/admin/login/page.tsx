"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type State = { status: "idle" } | { status: "submitting" } | { status: "error"; message: string };

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit() {
    setState({ status: "submitting" });
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const json = (await res.json()) as { ok: boolean; error?: { message: string } };
      if (!json.ok) {
        setState({ status: "error", message: json.error?.message ?? "Login gagal" });
        return;
      }
      router.push(next);
      router.refresh();
    } catch (e) {
      setState({ status: "error", message: e instanceof Error ? e.message : String(e) });
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-md gap-6 rounded-3xl border border-gray-100 bg-white p-8">
      <div className="grid gap-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Admin</div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Login</h1>
        <p className="text-sm text-gray-600">Akses area manajemen produk, order, booking, dan customer.</p>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-gray-900">Email</span>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
            placeholder="admin@ginabo.co"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-gray-900">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-brand-300"
            placeholder="********"
          />
        </label>
        {state.status === "error" ? <div className="text-sm font-semibold text-red-600">{state.message}</div> : null}
        <button
          type="button"
          onClick={submit}
          disabled={state.status === "submitting"}
          className="mt-2 inline-flex w-full items-center justify-center rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white hover:bg-black disabled:opacity-60"
        >
          {state.status === "submitting" ? "Memproses..." : "Login"}
        </button>
      </div>
    </div>
  );
}

