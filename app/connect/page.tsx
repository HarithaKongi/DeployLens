import { Github, ShieldCheck, ArrowRight, LockKeyhole } from "lucide-react";

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-[#070b14]">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.025] p-8 shadow-2xl shadow-black/20">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400"><Github /></div>
          <p className="text-sm font-medium text-blue-400">Connect your engineering workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bring your GitHub projects into DeployLens.</h1>
          <p className="mt-4 leading-7 text-slate-400">Connect GitHub to analyze repositories, commits, and Actions workflow signals from one focused engineering dashboard.</p>
          <div className="mt-7 space-y-3">
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4"><ShieldCheck className="mt-0.5 text-emerald-400" size={19}/><div><p className="text-sm font-medium">Secure OAuth connection</p><p className="mt-1 text-xs leading-5 text-slate-500">Your GitHub credentials are handled server-side. Secrets are never exposed to the browser.</p></div></div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4"><LockKeyhole className="mt-0.5 text-blue-400" size={19}/><div><p className="text-sm font-medium">Built for engineering signals</p><p className="mt-1 text-xs leading-5 text-slate-500">DeployLens can use repository metadata, commits, workflow runs, and deployment events to calculate project health.</p></div></div>
          </div>
          <a href="/api/auth/github" className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">Continue with GitHub <ArrowRight size={16}/></a>
          <p className="mt-4 text-center text-xs text-slate-600">You can disconnect at any time.</p>
        </div>
      </div>
    </main>
  );
}