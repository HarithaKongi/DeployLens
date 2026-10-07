import { NextResponse } from "next/server";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID ?? "Iv23liLqMIfodPkw3iB6";

function getAppUrl() {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured;
  const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (productionHost) return `https://${productionHost}`;
  const deploymentHost = process.env.VERCEL_URL;
  if (deploymentHost) return `https://${deploymentHost}`;
  return "https://deploylens-iota.vercel.app";
}

export async function GET() {
  const appUrl = getAppUrl();

  const state = crypto.randomUUID();
  const callback = new URL("/api/auth/github/callback", appUrl);
  const url = new URL("https://github.com/login/oauth/authorize");

  url.searchParams.set("client_id", GITHUB_CLIENT_ID);
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