import { NextResponse } from "next/server";
import { getRepository, listCommits, listWorkflowRuns } from "@/lib/github";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const owner = params.get("owner");
  const repo = params.get("repo");
  if (!owner || !repo) return NextResponse.json({ error: "owner and repo are required" }, { status: 400 });
  try {
    const [repository, commits, workflows] = await Promise.all([
      getRepository(owner, repo), listCommits(owner, repo), listWorkflowRuns(owner, repo)
    ]);
    return NextResponse.json({ repository, commits, workflows });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "GitHub request failed" }, { status: 502 });
  }
}