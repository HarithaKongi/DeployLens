import { NextResponse } from "next/server";
import { listPublicRepositories } from "@/lib/github";

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username");
  if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 });
  try {
    const repositories = await listPublicRepositories(username);
    return NextResponse.json({ repositories });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub request failed" }, { status: 502 });
  }
}