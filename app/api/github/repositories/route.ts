import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { listAuthenticatedRepositories } from "@/lib/github";

export async function GET() {
  const token = (await cookies()).get("deploylens_github_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  try {
    const repositories = await listAuthenticatedRepositories(token);
    return NextResponse.json({ repositories });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub request failed" }, { status: 502 });
  }
}