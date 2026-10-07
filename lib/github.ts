export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  private: boolean;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string | null;
};

type GitHubCommit = {
  sha: string;
  commit: { message: string; author: { name: string | null; date: string | null } | null };
  html_url: string;
};

const headers = (token?: string) => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

export async function listPublicRepositories(username: string): Promise<GitHubRepository[]> {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, { headers: headers(), next: { revalidate: 60 } });
  if (!response.ok) throw new Error(`GitHub repositories request failed: ${response.status}`);
  return response.json();
}

export async function listAuthenticatedRepositories(token: string): Promise<GitHubRepository[]> {
  const response = await fetch("https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member", { headers: headers(token), cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub repositories request failed: ${response.status}`);
  return response.json();
}

export async function getRepository(owner: string, repo: string, token?: string): Promise<GitHubRepository> {
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, { headers: headers(token), next: { revalidate: 30 } });
  if (!response.ok) throw new Error(`GitHub repository request failed: ${response.status}`);
  return response.json();
}

export async function listCommits(owner: string, repo: string, branch?: string, token?: string): Promise<GitHubCommit[]> {
  const query = branch ? `?sha=${encodeURIComponent(branch)}&per_page=20` : "?per_page=20";
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits${query}`, { headers: headers(token), cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub commits request failed: ${response.status}`);
  return response.json();
}

export async function listWorkflowRuns(owner: string, repo: string, token?: string) {
  const response = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?per_page=20`, { headers: headers(token), cache: "no-store" });
  if (!response.ok) throw new Error(`GitHub workflow request failed: ${response.status}`);
  return response.json();
}