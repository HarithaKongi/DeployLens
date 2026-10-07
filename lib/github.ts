export type GitHubRepository = {
  id: number;
  name: string;
  full_name: string;
  default_branch: string;
  private: boolean;
  html_url: string;
  description: string | null;
};

export async function listPublicRepositories(username: string): Promise<GitHubRepository[]> {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 60 }
  });

  if (!response.ok) throw new Error("GitHub repository request failed");
  return response.json();
}