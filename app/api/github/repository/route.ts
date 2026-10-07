import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthenticatedUser, getRepository, listCommits, listDeployments, listWorkflowRuns } from "@/lib/github";

export async function GET(request: Request) {
  const token = (await cookies()).get("deploylens_github_token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const owner = params.get("owner");
  const repo = params.get("repo");
  if (!repo) return NextResponse.json({ error: "repo is required" }, { status: 400 });

  try {
    const user = await getAuthenticatedUser(token);
    const repository = await getRepository(owner || user.login, repo, token);
    const [commits, workflows, deployments] = await Promise.all([
      listCommits(repository.full_name.split("/")[0], repository.name, repository.default_branch, token),
      listWorkflowRuns(repository.full_name.split("/")[0], repository.name, token),
      listDeployments(repository.full_name.split("/")[0], repository.name, token),
    ]);
    return NextResponse.json({ repository, commits, workflows, deployments });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "GitHub request failed" },
      { status: 502 },
    );
  }
}