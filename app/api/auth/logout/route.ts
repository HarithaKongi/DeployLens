import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const response = NextResponse.redirect(new URL("/connect", appUrl));
  response.cookies.delete("deploylens_session");
  response.cookies.delete("deploylens_github_token");
  return response;
}