import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.headers.get("cookie")?.match(/(?:^|; )github_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !expectedState || state !== decodeURIComponent(expectedState)) {
    return NextResponse.json({ error: "Invalid OAuth state" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const secret = process.env.SESSION_SECRET;

  if (!clientId || !clientSecret || !appUrl || !secret) {
    return NextResponse.json({ error: "GitHub OAuth is not fully configured" }, { status: 503 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code })
  });
  const token = await tokenResponse.json();
  if (!token.access_token) return NextResponse.json({ error: "GitHub token exchange failed" }, { status: 502 });

  const userResponse = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" }
  });
  if (!userResponse.ok) return NextResponse.json({ error: "GitHub user lookup failed" }, { status: 502 });
  const user = await userResponse.json();

  const session = await new SignJWT({ login: user.login, id: user.id, name: user.name ?? user.login })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(new TextEncoder().encode(secret));

  const response = NextResponse.redirect(new URL("/repositories", appUrl));
  response.cookies.set("deploylens_session", session, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 604800
  });
  response.cookies.set("deploylens_github_token", token.access_token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 604800
  });
  response.cookies.delete("github_oauth_state");
  return response;
}