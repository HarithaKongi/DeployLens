import { cookies } from "next/headers";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, ExternalLink, GitBranch, GitCommitHorizontal, GitPullRequest, TriangleAlert, Workflow } from "lucide-react";
import { getAuthenticatedUser, getRepository, listCommits, listDeployments, listWorkflowRuns } from "@/lib/github";

function formatTime(value: string) {
  return new Date(value).toLocaleString();
}

export default async function RepositoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const token = (await cookies()).get("deploylens_github_token")?.value;

  if (!token) {
    return (
      <main className="min-h-screen bg-[#070b14] p-8 text-slate-200">
        <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 p-8">
          <h1 className="text-2xl font-semibold">GitHub connection required</h1>
          <p className="mt-2 text-slate-500">Connect GitHub before opening repository intelligence.</p>
          <Link href="/connect" className="mt-6 inline-block text-blue-400">Connect GitHub →</Link>
        </div>
      </main>
    );
  }

  try {
    const user = await getAuthenticatedUser(token);
    const repository = await getRepository(user.login, name, token);
    const [commits, workflowData, deployments] = await Promise.all([
      listCommits(user.login, repository.name, repository.default_branch, token),
      listWorkflowRuns(user.login, repository.name, token),
      listDeployments(user.login, repository.name, token),
    ]);

    const completed = workflowData.workflow_runs.filter((run) => run.conclusion);
    const successful = completed.filter((run) => run.conclusion === "success");
    const successRate = completed.length ? Math.round((successful.length / completed.length) * 100) : null;
    const latestWorkflow = workflowData.workflow_runs[0];
    const health = successRate === null ? "—" : `${successRate}/100`;

    return (
      <main className="min-h-screen bg-[#070b14]">
        <header className="border-b border-white/10 bg-[#0a0f1c]/90">
          <div className="mx-auto max-w-7xl px-6 py-5">
            <Link href="/repositories" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200"><ArrowLeft size={15}/> Repositories</Link>
          </div>
        </header>
        <section className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-blue-400">Live repository intelligence</p>
                {repository.private && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-500">private</span>}
              </div>
              <h1 className="mt-1 text-4xl font-semibold">{repository.name}</h1>
              <p className="mt-2 max-w-2xl text-slate-500">{repository.description || "No repository description."}</p>
              <a href={repository.html_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs text-blue-400 hover:text-blue-300"><ExternalLink size={13}/> Open on GitHub</a>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.025] px-5 py-3">
              <p className="text-xs text-slate-500">Health score</p>
              <p className="mt-1 text-2xl font-semibold">{health}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Workflow runs" value={String(workflowData.total_count)} Icon={Workflow}/>
            <Metric label="Success rate" value={successRate === null ? "—" : `${successRate}%`} Icon={CheckCircle2}/>
            <Metric label="Recent commits" value={String(commits.length)} Icon={GitCommitHorizontal}/>
            <Metric label="Deployments" value={String(deployments.length)} Icon={GitPullRequest}/>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Panel title="Recent workflow runs" subtitle="Live GitHub Actions signals">
              {workflowData.workflow_runs.length === 0 ? <Empty text="No workflow runs found."/> : workflowData.workflow_runs.slice(0, 8).map((run) => (
                <a key={run.id} href={run.html_url} target="_blank" rel="noreferrer" className="flex items-center justify-between gap-4 border-b border-white/5 px-5 py-4 last:border-0 hover:bg-white/[0.02]">
                  <div><p className="text-sm font-medium">{run.name}</p><p className="mt-1 text-xs text-slate-500">{run.head_branch || repository.default_branch} · {formatTime(run.created_at)}</p></div>
                  <Status conclusion={run.conclusion} status={run.status}/>
                </a>
              ))}
            </Panel>

            <Panel title="Recent commits" subtitle="Latest changes on the default branch">
              {commits.length === 0 ? <Empty text="No commits found."/> : commits.slice(0, 8).map((commit) => (
                <a key={commit.sha} href={commit.html_url} target="_blank" rel="noreferrer" className="flex gap-3 border-b border-white/5 px-5 py-4 last:border-0 hover:bg-white/[0.02]">
                  <GitCommitHorizontal size={16} className="mt-0.5 shrink-0 text-slate-500"/>
                  <div className="min-w-0"><p className="truncate text-sm font-medium">{commit.commit.message.split("\n")[0]}</p><p className="mt-1 text-xs text-slate-500">{commit.sha.slice(0, 7)} · {commit.commit.author?.name || "Unknown author"}</p></div>
                </a>
              ))}
            </Panel>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02]">
            <div className="border-b border-white/10 px-5 py-4"><h2 className="font-semibold">Deployment signals</h2><p className="mt-1 text-xs text-slate-500">GitHub deployment records for this repository.</p></div>
            {deployments.length === 0 ? (
              <Empty text="No GitHub deployment records found yet."/>
            ) : (
              <div className="divide-y divide-white/5">
                {deployments.slice(0, 10).map((deployment) => (
                  <a key={deployment.id} href={deployment.html_url} target="_blank" rel="noreferrer" className="grid gap-2 px-5 py-4 md:grid-cols-[1.4fr_1fr_1fr_auto] md:items-center hover:bg-white/[0.02]">
                    <div><p className="text-sm font-medium">{deployment.environment || "Unknown environment"}</p><p className="mt-1 text-xs text-slate-500">{deployment.ref} · {deployment.sha.slice(0, 7)}</p></div>
                    <span className="text-xs text-slate-500">{deployment.task || "deploy"}</span>
                    <span className="text-xs text-slate-500">{formatTime(deployment.created_at)}</span>
                    <ExternalLink size={14} className="text-slate-600"/>
                  </a>
                ))}
              </div>
            )}
          </div>

          {latestWorkflow && <p className="mt-5 text-xs text-slate-600">Latest workflow: {latestWorkflow.name} · updated {formatTime(latestWorkflow.updated_at)}</p>}
        </section>
      </main>
    );
  } catch (error) {
    return (
      <main className="min-h-screen bg-[#070b14] p-8 text-slate-200">
        <div className="mx-auto max-w-3xl rounded-2xl border border-amber-400/20 bg-amber-400/5 p-8">
          <h1 className="text-2xl font-semibold">Repository unavailable</h1>
          <p className="mt-2 text-sm text-amber-200">{error instanceof Error ? error.message : "GitHub request failed."}</p>
          <Link href="/repositories" className="mt-6 inline-block text-sm text-blue-400">← Back to repositories</Link>
        </div>
      </main>
    );
  }
}

function Metric({ label, value, Icon }: { label: string; value: string; Icon: typeof Workflow }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><Icon size={17} className="text-slate-500"/><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>;
}

function Panel({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"><div className="border-b border-white/10 px-5 py-4"><h2 className="font-semibold">{title}</h2><p className="mt-1 text-xs text-slate-500">{subtitle}</p></div>{children}</div>;
}

function Empty({ text }: { text: string }) {
  return <div className="px-5 py-10 text-center text-sm text-slate-500">{text}</div>;
}

function Status({ conclusion, status }: { conclusion: string | null; status: string }) {
  if (conclusion === "success") return <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400"><CheckCircle2 size={14}/> success</span>;
  if (conclusion) return <span className="inline-flex items-center gap-1.5 text-xs text-amber-400"><TriangleAlert size={14}/> {conclusion}</span>;
  return <span className="inline-flex items-center gap-1.5 text-xs text-blue-400"><Clock3 size={14}/> {status}</span>;
}