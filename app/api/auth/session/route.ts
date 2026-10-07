import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("deploylens_session")?.value;
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret) return NextResponse.json({ authenticated: false });
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    return NextResponse.json({ authenticated: true, user: payload });
  } catch {
    return NextResponse.json({ authenticated: false });
  }
}