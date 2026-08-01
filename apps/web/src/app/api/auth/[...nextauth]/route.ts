export const runtime = 'edge';

/**
 * next-auth route handler
 * Handles all /api/auth/* routes (callback, signIn, signOut, session, csrf, etc.)
 *
 * REQUIRES: npm install next-auth@beta
 */

// import { handlers } from "@/lib/next-auth";
// export const { GET, POST } = handlers;

// ── Placeholder until next-auth is installed ──────────────────────────────────
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "next-auth not yet installed. Run: npm install next-auth@beta" },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: "next-auth not yet installed. Run: npm install next-auth@beta" },
    { status: 501 }
  );
}
