import { cookies } from "next/headers";
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  GitBranch,
  GitCommitHorizontal,
  Github,
  ShieldCheck,
  TriangleAlert,
  Workflow,
} from "lucide-react";
import {
  getAuthenticatedUser,
  listAuthenticatedRepositories,
  listWorkflowRuns,
  type GitHubRepository,
  type GitHubWorkflowRun,
} from "@/lib/github";

async function getDashboardData() {
  const token = (await cookies()).get("deploylens_github_token")?.value;
  if (!token) return null;

  const user = await getAuthenticatedUser(token);
  const repositories = await listAuthenticatedRepositories(token);
  const selected = repositories.slice(0, 8);

  const workflowResults = await Promise.all(
    selected.map(async (repo) => {
      try {
        const result = await listWorkflowRuns(user.login, repo.name, token);
        return { repo, runs: result.workflow_runs };
      } catch {
        return { repo, runs: [] as GitHubWorkflowRun[] };
      }
    }),
  );

  const runs = workflowResults.flatMap(({ repo, runs }) =>
    runs.map((run) => ({ ...run, repository: repo })),
  );
  const completed = runs.filter((run) => run.conclusion);
  const successful = completed.filter((run) => run.conclusion === "success");
  const successRate = completed.length ? Math.round((successful.length / completed.length) * 1000) / 10 : null;
  const openIssues = repositories.reduce((sum, repo) => sum + repo.open_issues_count, 0);
  const health = successRate === null ? null : Math.max(0, Math.min(100, Math.round(successRate)));

  return {
    user,
    repositories,
    runs: runs.sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 8),
    workflowCount: runs.length,
    successRate,
    openIssues,
    health,
  };
}

export default async function Home() {
  const data = await getDashboardData();

  if (!data) {
    return (
      <main className="min-h-screen bg-[#070b14]">
        <header className="border-b border-white/10 bg-[#0a0f1c]/90">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-400"><Activity size={20} /></div>
              <div><p className="font-semibold tracking-tight">DeployLens</p><p className="text-xs text-slate-500">Deployment Intelligence</p></div>
            </div>
            <Link href="/connect" className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.06]"><Github size={16}/> Connect GitHub</Link>
          </div>
        </header>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <p className="text-sm font-medium text-blue-400">Engineering overview</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Know what shipped. Know what broke.</h1>
          <p className="mt-4 max-w-2xl text-slate-400">Connect GitHub to turn repository activity, Actions runs, deployment events, and release signals into a live engineering dashboard.</p>
          <Link href="/connect" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-400">Connect GitHub <ArrowUpRight size={16}/></Link>
        </section>
      </main>
    );
  }

  const metrics = [
    { label: "Health score", value: data.health === null ? "—" : `${data.health} / 100`, note: "Based on completed GitHub Actions runs", Icon: ShieldCheck },
    { label: "Repositories", value: String(data.repositories.length), note: "Accessible to this account", Icon: GitBranch },
    { label: "Workflow runs", value: String(data.workflowCount), note: "Across the latest 8 repositories", Icon: Workflow },
    { label: "Success rate", value: data.successRate === null ? "—" : `${data.successRate}%`, note: `${data.openIssues} open issues across repositories`, Icon: CheckCircle2 },
  ];

  return (
    <main className="min-h-screen bg-[#070b14]">
      <header className="border-b border-white/10 bg-[#0a0f1c]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-400"><Activity size={20} /></div>
            <div><p className="font-semibold tracking-tight">DeployLens</p><p className="text-xs text-slate-500">Deployment Intelligence</p></div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">@{data.user.login}</span>
            <Link href="/repositories" className="text-sm text-blue-400 hover:text-blue-300">Repositories</Link>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">Live GitHub overview</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Your engineering signals, in one place.</h1>
          <p className="mt-3 max-w-2xl text-slate-400">Live repository and GitHub Actions data for <span className="text-slate-200">@{data.user.login}</span>. No demo metrics are shown while connected.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, note, Icon }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-center justify-between text-slate-500"><span className="text-sm">{label}</span><Icon size={17}/></div>
              <p className="mt-5 text-2xl font-semibold">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{note}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div><h2 className="font-semibold">Recent GitHub Actions</h2><p className="mt-1 text-xs text-slate-500">Latest workflow signals from your connected repositories</p></div>
            <Link href="/repositories" className="text-sm text-blue-400 hover:text-blue-300">View repositories</Link>
          </div>
          {data.runs.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-slate-500">No workflow runs were found in the latest repositories.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {data.runs.map((run) => (
                <div key={`${run.repository.id}-${run.id}`} className="grid gap-3 px-5 py-4 md:grid-cols-[1.4fr_1.2fr_1fr_1fr] md:items-center">
                  <div><p className="font-medium">{run.repository.name}</p><p className="mt-1 text-xs text-slate-500">{run.name}</p></div>
                  <div className="flex items-center gap-2 text-sm text-slate-300"><GitCommitHorizontal size={15} className="text-slate-500"/>{run.head_sha.slice(0, 7)}</div>
                  <div className={run.conclusion === "success" ? "flex items-center gap-2 text-sm text-emerald-400" : run.conclusion ? "flex items-center gap-2 text-sm text-amber-400" : "flex items-center gap-2 text-sm text-blue-400"}>
                    {run.conclusion === "success" ? <CheckCircle2 size={16}/> : <TriangleAlert size={16}/>}
                    {run.conclusion ?? run.status}
                  </div>
                  <div className="text-sm text-slate-500 md:text-right">{new Date(run.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}