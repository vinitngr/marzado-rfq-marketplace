import Link from "next/link";
import { DemoLoginForm } from "@/components/auth/demo-login-form";
import { GitHubLoginButton } from "@/components/auth/github-login-button";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:py-20">
      <section className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <Link className="text-xl font-bold tracking-tight text-slate-950" href="/">merzado</Link>
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-slate-950">Welcome to the marketplace</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Use a demo account to explore both sides of the RFQ workflow.</p>
        <div className="mt-6"><DemoLoginForm /></div>
        <div className="my-6 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
        {process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? <GitHubLoginButton /> : <p className="text-center text-xs text-slate-500">GitHub sign-in can be enabled with deployment credentials.</p>}
      </section>
    </main>
  );
}
