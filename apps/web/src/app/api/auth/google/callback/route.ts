export const runtime = 'edge';

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";

  if (error || !code) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=google_cancelled`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=not_configured`);
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

    const tokenData = await tokenRes.json() as { access_token?: string; error?: string };
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=token_failed`);
    }

    const profileRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileRes.json() as {
      id: string;
      email: string;
      name: string;
      picture: string;
    };

    if (!profile.email) {
      return NextResponse.redirect(`${baseUrl}/auth/login?error=no_email`);
    }

    const params = new URLSearchParams({
      email: profile.email,
      name: profile.name ?? profile.email.split("@")[0],
      picture: profile.picture ?? "",
    });

    return NextResponse.redirect(`${baseUrl}/auth/google-callback?${params.toString()}`);
  } catch {
    return NextResponse.redirect(`${baseUrl}/auth/login?error=server_error`);
  }
}
