export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";
import { GOOGLE_OAUTH_STATE_COOKIE, stateMatches } from "@/lib/auth/googleOAuthState";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const returnedState = searchParams.get("state");

  const baseUrl = req.nextUrl.origin;
  const expectedState = req.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  // Always clear the state cookie on the first callback attempt, whether it
  // validates or not — it is single-use regardless of outcome.
  const clearStateCookie = (response: NextResponse) => {
    response.cookies.set(GOOGLE_OAUTH_STATE_COOKIE, "", { path: "/api/auth/google", maxAge: 0 });
    return response;
  };

  if (!returnedState || !expectedState || !(await stateMatches(returnedState, expectedState))) {
    return clearStateCookie(NextResponse.redirect(`${baseUrl}/auth/login?error=google_state_invalid`));
  }

  if (error || !code) {
    return clearStateCookie(NextResponse.redirect(`${baseUrl}/auth/login?error=google_cancelled`));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return clearStateCookie(NextResponse.redirect(`${baseUrl}/auth/login?error=not_configured`));
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/google/callback`;

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json() as { access_token?: string; id_token?: string; error?: string };
    if (!tokenData.access_token || !tokenData.id_token) {
      return clearStateCookie(NextResponse.redirect(`${baseUrl}/auth/login?error=token_failed`));
    }

    const params = new URLSearchParams({ id_token: tokenData.id_token });
    return clearStateCookie(NextResponse.redirect(`${baseUrl}/auth/google-callback?${params.toString()}`));
  } catch {
    return clearStateCookie(NextResponse.redirect(`${baseUrl}/auth/login?error=server_error`));
  }
}
