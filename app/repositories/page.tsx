import Link from "next/link";
import { Activity, ArrowUpRight, GitBranch, GitCommitHorizontal, Search } from "lucide-react";

const repositories = [
  { name: "AirAware", description: "Real-time air-quality monitoring and saved locations.", branch: "main", health: 96, activity: "12 min ago" },
  { name: "Waste2Worth", description: "Sustainability workflow for waste valuation and collection.", branch: "main", health: 94, activity: "48 min ago" },
  { name: "RoadEcho", description: "3D browser driving experience with replay mechanics.", branch: "main", health: 91, activity: "2h ago" },
  { name: "CivicFix", description: "Civic issue reporting and community workflow.", branch: "main", health: 88, activity: "5h ago" }
];

export default function RepositoriesPage() {
  return (
    <main className="min-h-screen bg-[#070b14]">
      <header className="border-b border-white/10 bg-[#0a0f1c]/90"><div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"><Link href="/" className="font-semibold">DeployLens</Link><div className="text-xs text-slate-500">Repository workspace</div></div></header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-medium text-blue-400">Connected projects</p><h1 className="mt-1 text-3xl font-semibold">Repositories</h1><p className="mt-2 text-sm text-slate-500">A health-first view of your engineering portfolio.</p></div><div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-sm text-slate-500"><Search size={16}/> Search repositories</div></div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {repositories.map(repo => <Link href={`/repositories/${repo.name.toLowerCase()}`} key={repo.name} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.04]">
            <div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><GitCommitHorizontal size={17} className="text-blue-400"/><h2 className="font-semibold">{repo.name}</h2></div><p className="mt-2 text-sm leading-6 text-slate-500">{repo.description}</p></div><ArrowUpRight size={17} className="text-slate-600 transition group-hover:text-blue-400"/></div>
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/5 pt-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><GitBranch size={13}/>{repo.branch}</span><span className="flex items-center gap-1.5"><Activity size={13}/>{repo.activity}</span><span className="ml-auto font-medium text-emerald-400">{repo.health}/100 health</span></div>
          </Link>)}
        </div>
      </section>
    </main>
  );
}