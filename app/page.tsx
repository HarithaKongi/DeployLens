import { Activity, ArrowUpRight, CheckCircle2, Clock3, GitBranch, Github, ShieldCheck, TriangleAlert, type LucideIcon } from "lucide-react";

const deployments = [
  { repo: "AirAware", branch: "main", status: "Healthy", time: "12 min ago", duration: "1m 42s" },
  { repo: "Waste2Worth", branch: "main", status: "Healthy", time: "48 min ago", duration: "58s" },
  { repo: "RoadEcho", branch: "feature/replay", status: "Warning", time: "2h ago", duration: "2m 16s" },
  { repo: "CivicFix", branch: "main", status: "Healthy", time: "5h ago", duration: "1m 08s" }
];

const metrics: Array<{ label: string; value: string; note: string; Icon: LucideIcon }> = [
  { label: "Health score", value: "94 / 100", note: "2 points this week", Icon: ShieldCheck },
  { label: "Deployments", value: "28", note: "7 this week", Icon: ArrowUpRight },
  { label: "Success rate", value: "96.4%", note: "↑ 3.1% vs last week", Icon: CheckCircle2 },
  { label: "Avg. build", value: "1m 21s", note: "↓ 12s vs last week", Icon: Clock3 }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#070b14]">
      <header className="border-b border-white/10 bg-[#0a0f1c]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-500/15 text-blue-400"><Activity size={20} /></div>
            <div><p className="font-semibold tracking-tight">DeployLens</p><p className="text-xs text-slate-500">Deployment Intelligence</p></div>
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-200 hover:bg-white/[0.06]"><Github size={16}/> Connect GitHub</button>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-400">Engineering overview</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Know what shipped. Know what broke.</h1>
          <p className="mt-3 max-w-2xl text-slate-400">A single view of repository activity, deployment health, build performance, and release risk.</p>
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
            <div><h2 className="font-semibold">Recent deployments</h2><p className="mt-1 text-xs text-slate-500">Latest repository releases and build results</p></div>
            <button className="text-sm text-blue-400 hover:text-blue-300">View all</button>
          </div>
          <div className="divide-y divide-white/5">
            {deployments.map((deployment) => (
              <div key={deployment.repo + deployment.branch} className="grid gap-3 px-5 py-4 md:grid-cols-[1.5fr_1fr_1fr_1fr] md:items-center">
                <div><p className="font-medium">{deployment.repo}</p><div className="mt-1 flex items-center gap-2 text-xs text-slate-500"><GitBranch size={13}/>{deployment.branch}</div></div>
                <div className="flex items-center gap-2 text-sm"><span className={deployment.status === "Healthy" ? "text-emerald-400" : "text-amber-400"}>{deployment.status === "Healthy" ? <CheckCircle2 size={16}/> : <TriangleAlert size={16}/>}</span>{deployment.status}</div>
                <div className="text-sm text-slate-400">{deployment.duration}</div>
                <div className="text-sm text-slate-500 md:text-right">{deployment.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}