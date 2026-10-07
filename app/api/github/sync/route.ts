import { NextResponse } from "next/server";
import { listPublicRepositories } from "@/lib/github";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === "string" ? body.username.trim() : "";
  if (!username) return NextResponse.json({ error: "username is required" }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL is not configured" }, { status: 503 });
  try {
    const repositories = await listPublicRepositories(username);
    const synced = [];
    for (const repo of repositories) {
      synced.push(await prisma.repository.upsert({
        where: { githubId: String(repo.id) },
        update: { name: repo.name, fullName: repo.full_name, defaultBranch: repo.default_branch },
        create: { githubId: String(repo.id), name: repo.name, fullName: repo.full_name, defaultBranch: repo.default_branch }
      }));
    }
    return NextResponse.json({ synced: synced.length, repositories: synced });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Sync failed" }, { status: 500 });
  }
}