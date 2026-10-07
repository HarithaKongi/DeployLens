import { NextResponse } from "next/server";
import { SignJWT } from "jose";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieHeader = request.headers.get("cookie") ?? "";
  const expectedState = cookieHeader.match(/(?:^|; )github_oauth_state=([^;]+)/)?.[1];

  if (!code || !state || !expectedState || state !== decodeURIComponent(expectedState)) {
    return NextResponse.json({ error: "Invalid GitHub authorization state" }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!clientId || !clientSecret || !appUrl || !sessionSecret) {
    return NextResponse.json({ error: "GitHub App authorization is not fully configured" }, { status: 503 });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: new URL("/api/auth/github/callback", appUrl).toString(),
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    return NextResponse.json({ error: "GitHub authorization exchange failed" }, { status: 502 });
  }

  const token = await tokenResponse.json();

  if (!token.access_token) {
    return NextResponse.json(
      { error: token.error_description ?? "GitHub did not return an access token" },
      { status: 502 },
    );
  }

  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2026-03-10",
    },
    cache: "no-store",
  });

  if (!userResponse.ok) {
    return NextResponse.json({ error: "GitHub user lookup failed" }, { status: 502 });
  }

  const user = await userResponse.json();

  const session = await new SignJWT({
    login: user.login,
    id: user.id,
    name: user.name ?? user.login,
    avatarUrl: user.avatar_url ?? null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(new TextEncoder().encode(sessionSecret));

  const response = NextResponse.redirect(new URL("/repositories", appUrl));

  response.cookies.set("deploylens_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 28800,
  });

  response.cookies.set("deploylens_github_token", token.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: token.expires_in ?? 28800,
  });

  response.cookies.delete("github_oauth_state");
  return response;
}