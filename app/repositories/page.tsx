"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Activity, ArrowUpRight, GitBranch, GitCommitHorizontal, LogOut, Search, Loader2, AlertCircle } from "lucide-react";

type Repo = {
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

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [user, setUser] = useState<{ login: string; name?: string | null } | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const me = await fetch("/api/github/me", { cache: "no-store" });
        if (!me.ok) throw new Error("Please connect GitHub first.");
        const profile = await me.json();
        setUser(profile);

        const response = await fetch("/api/github/repositories", { cache: "no-store" });
        if (!response.ok) throw new Error("Unable to load GitHub repositories.");
        const data = await response.json();
        setRepos(data.repositories ?? []);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => repos.filter(repo => {
    const haystack = `${repo.name} ${repo.description ?? ""}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [repos, query]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/connect";
  }

  return (
    <main className="min-h-screen bg-[#070b14]">
      <header className="border-b border-white/10 bg-[#0a0f1c]/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="font-semibold">DeployLens</Link>
          {user && <div className="flex items-center gap-4"><span className="text-xs text-slate-500">@{user.login}</span><button onClick={logout} className="inline-flex items-center gap-2 text-xs text-slate-500 hover:text-slate-200"><LogOut size={14}/> Disconnect</button></div>}
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div><p className="text-sm font-medium text-blue-400">GitHub workspace</p><h1 className="mt-1 text-3xl font-semibold">Repositories</h1><p className="mt-2 text-sm text-slate-500">{user ? `Connected as @${user.login}` : "Your connected projects will appear here."}</p></div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-sm text-slate-500"><Search size={16}/><input aria-label="Search repositories" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search repositories" className="w-48 bg-transparent outline-none placeholder:text-slate-600"/></div>
        </div>

        {loading && <div className="mt-12 flex items-center justify-center gap-2 text-sm text-slate-500"><Loader2 className="animate-spin" size={17}/> Loading GitHub repositories…</div>}
        {!loading && error && <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/5 p-5 text-sm text-amber-200"><div className="flex items-center gap-2 font-medium"><AlertCircle size={17}/>{error}</div><Link href="/connect" className="mt-3 inline-block text-xs text-blue-400 hover:underline">Connect GitHub</Link></div>}
        {!loading && !error && filtered.length === 0 && <div className="mt-8 rounded-2xl border border-white/10 p-10 text-center text-sm text-slate-500">No repositories match your search.</div>}

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {filtered.map(repo => <a href={`/repositories/${repo.name.toLowerCase()}`} key={repo.id} className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:bg-white/[0.04]">
            <div className="flex items-start justify-between"><div><div className="flex items-center gap-2"><GitCommitHorizontal size={17} className="text-blue-400"/><h2 className="font-semibold">{repo.name}</h2>{repo.private && <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-slate-500">private</span>}</div><p className="mt-2 text-sm leading-6 text-slate-500">{repo.description || "No description provided."}</p></div><ArrowUpRight size={17} className="text-slate-600 transition group-hover:text-blue-400"/></div>
            <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/5 pt-4 text-xs text-slate-500"><span className="flex items-center gap-1.5"><GitBranch size={13}/>{repo.default_branch}</span><span>★ {repo.stargazers_count}</span><span>⑂ {repo.forks_count}</span><span className="ml-auto flex items-center gap-1.5"><Activity size={13}/>{repo.pushed_at ? new Date(repo.pushed_at).toLocaleDateString() : "—"}</span></div>
          </a>)}
        </div>
      </section>
    </main>
  );
}