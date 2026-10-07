import Link from "next/link";
import { ArrowLeft, CheckCircle2, Clock3, GitBranch, GitCommitHorizontal, GitPullRequest, TriangleAlert } from "lucide-react";

const data: Record<string, {description: string; branch: string; health: number}> = {
  airaware: { description: "Real-time air-quality monitoring and saved locations.", branch: "main", health: 96 },
  waste2worth: { description: "Sustainability workflow for waste valuation and collection.", branch: "main", health: 94 },
  roadecho: { description: "3D browser driving experience with replay mechanics.", branch: "main", health: 91 },
  civicfix: { description: "Civic issue reporting and community workflow.", branch: "main", health: 88 }
};

const releases = [
  ["SUCCESS", "main", "Production release", "12 min ago", "1m 42s"],
  ["SUCCESS", "main", "Production release", "48 min ago", "58s"],
  ["WARNING", "feature/replay", "Build completed with warnings", "2h ago", "2m 16s"],
  ["SUCCESS", "main", "Production release", "5h ago", "1m 08s"]
];

export default async function RepositoryPage({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const repo = data[name] ?? { description: "Repository connected to DeployLens.", branch: "main", health: 82 };
  return <main className="min-h-screen bg-[#070b14]"><header className="border-b border-white/10 bg-[#0a0f1c]/90"><div className="mx-auto max-w-7xl px-6 py-5"><Link href="/repositories" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-200"><ArrowLeft size={15}/> Repositories</Link></div></header>
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm text-blue-400">Repository overview</p><h1 className="mt-1 text-4xl font-semibold">{name}</h1><p className="mt-2 max-w-2xl text-slate-500">{repo.description}</p></div><div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-3"><p className="text-xs text-slate-500">Health score</p><p className="mt-1 text-2xl font-semibold text-emerald-400">{repo.health}<span className="text-sm text-slate-500">/100</span></p></div></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[["Deployments","28",GitCommitHorizontal],["Success rate","96.4%",CheckCircle2],["Avg. build","1m 21s",Clock3],["Pull requests","14",GitPullRequest]].map(([label,value,Icon])=><div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><Icon size={17} className="text-slate-500"/><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-slate-500">{label}</p></div>)}</div>
      <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02]"><div className="border-b border-white/10 px-5 py-4"><h2 className="font-semibold">Release timeline</h2><p className="mt-1 text-xs text-slate-500">Recent deployment signals for this repository.</p></div><div className="divide-y divide-white/5">{releases.map((r,i)=><div key={i} className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_1fr_1fr_1fr] md:items-center"><div className="flex items-center gap-2">{r[0]==="SUCCESS"?<CheckCircle2 size={16} className="text-emerald-400"/>:<TriangleAlert size={16} className="text-amber-400"/>}<span className="text-sm font-medium">{r[2]}</span></div><span className="text-xs text-slate-500">{r[1]}</span><span className="text-sm text-slate-400">{r[4]}</span><span className="text-right text-xs text-slate-500">{r[3]}</span></div>)}</div></div>
    </section></main>;
}