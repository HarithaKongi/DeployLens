import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!clientId || !appUrl) {
    return NextResponse.json({ error: "GitHub App is not configured" }, { status: 503 });
  }

  const state = crypto.randomUUID();
  const callback = new URL("/api/auth/github/callback", appUrl);
  const url = new URL("https://github.com/login/oauth/authorize");

  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", callback.toString());
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");

  const response = NextResponse.redirect(url);
  response.cookies.set("github_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  return response;
}