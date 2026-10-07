import { Github, ShieldCheck, ArrowRight, LockKeyhole } from "lucide-react";

export default function ConnectPage() {
  return (
    <main className="min-h-screen bg-[#070b14]">
      <div className="mx-auto flex min-h-screen max-w-2xl items-center px-6">
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.025] p-8 shadow-2xl shadow-black/20">
          <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-400"><Github /></div>
          <p className="text-sm font-medium text-blue-400">Connect your engineering workspace</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Bring your GitHub projects into DeployLens.</h1>
          <p className="mt-4 leading-7 text-slate-400">DeployLens uses GitHub repository and deployment signals to build a focused view of release health. OAuth keeps your credentials out of the application.</p>
          <div className="mt-7 space-y-3">
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4"><ShieldCheck className="mt-0.5 text-emerald-400" size={19}/><div><p className="text-sm font-medium">Read-only by default</p><p className="mt-1 text-xs leading-5 text-slate-500">The initial integration is designed around repository metadata, commits, workflows, and deployment signals.</p></div></div>
            <div className="flex gap-3 rounded-xl border border-white/10 bg-black/10 p-4"><LockKeyhole className="mt-0.5 text-blue-400" size={19}/><div><p className="text-sm font-medium">No tokens in the browser</p><p className="mt-1 text-xs leading-5 text-slate-500">OAuth secrets belong on the server and should never be committed to source control.</p></div></div>
          </div>
          <button className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400">Continue with GitHub <ArrowRight size={16}/></button>
          <p className="mt-4 text-center text-xs text-slate-600">OAuth callback will be enabled in the authentication milestone.</p>
        </div>
      </div>
    </main>
  );
}