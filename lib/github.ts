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

export type GitHubCommit = {
  sha: string;
  commit: {
    message: string;
    author: { name: string | null; date: string | null } | null;
  };
  html_url: string;
};

export type GitHubWorkflowRun = {
  id: number;
  name: string;
  head_branch: string | null;
  head_sha: string;
  status: string;
  conclusion: string | null;
  html_url: string;
  created_at: string;
  updated_at: string;
  run_started_at: string | null;
};

export type GitHubDeployment = {
  id: number;
  sha: string;
  ref: string;
  task: string;
  environment: string;
  description: string | null;
  creator: { login: string } | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  statuses_url: string;
  production_environment: boolean;
};

export type GitHubDeploymentStatus = {
  id: number;
  state: string;
  description: string | null;
  environment: string | null;
  environment_url: string | null;
  target_url: string | null;
  log_url: string | null;
  created_at: string;
  updated_at: string;
};

const headers = (token?: string) => ({
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2026-03-10",
  ...(token ? { Authorization: `Bearer ${token}` } : {})
});

async function githubJson<T>(url: string, token?: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { ...headers(token), ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`GitHub request failed: ${response.status}`);
  return response.json();
}

export async function getAuthenticatedUser(token: string) {
  return githubJson<{ login: string; name: string | null; avatar_url: string | null; html_url: string }>(
    "https://api.github.com/user",
    token,
  );
}

export async function listPublicRepositories(username: string): Promise<GitHubRepository[]> {
  return githubJson<GitHubRepository[]>(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`,
  );
}

export async function listAuthenticatedRepositories(token: string): Promise<GitHubRepository[]> {
  return githubJson<GitHubRepository[]>(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator,organization_member",
    token,
  );
}

export async function getRepository(owner: string, repo: string, token?: string): Promise<GitHubRepository> {
  return githubJson<GitHubRepository>(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    token,
  );
}

export async function listCommits(owner: string, repo: string, branch?: string, token?: string): Promise<GitHubCommit[]> {
  const query = branch ? `?sha=${encodeURIComponent(branch)}&per_page=20` : "?per_page=20";
  return githubJson<GitHubCommit[]>(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits${query}`,
    token,
  );
}

export async function listWorkflowRuns(owner: string, repo: string, token?: string): Promise<{ workflow_runs: GitHubWorkflowRun[]; total_count: number }> {
  return githubJson(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/actions/runs?per_page=20`,
    token,
  );
}

export async function listDeployments(owner: string, repo: string, token?: string): Promise<GitHubDeployment[]> {
  return githubJson<GitHubDeployment[]>(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/deployments?per_page=20`,
    token,
  );
}

export async function listDeploymentStatuses(
  owner: string,
  repo: string,
  deploymentId: number,
  token?: string,
): Promise<GitHubDeploymentStatus[]> {
  return githubJson<GitHubDeploymentStatus[]>(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/deployments/${deploymentId}/statuses?per_page=10`,
    token,
  );
}