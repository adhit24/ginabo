export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_OAUTH_STATE_COOKIE } from "@/lib/auth/googleOAuthState";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "GOOGLE_CLIENT_ID not configured" }, { status: 500 });
  }

  const redirectUri = `${req.nextUrl.origin}/api/auth/google/callback`;

  // Single-use CSRF token for the OAuth handshake: bound to this browser via
  // an HttpOnly cookie, and echoed back by Google in the callback query.
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "select_account",
    state,
  });

  const response = NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: req.nextUrl.protocol === "https:",
    sameSite: "lax",
    maxAge: 600, // 10 minutes — enough for a real login, short enough to limit replay window
    path: "/api/auth/google",
  });
  return response;
}
