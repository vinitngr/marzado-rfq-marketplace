import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { LoginMethods } from "@/components/auth/login-methods";

export default function LoginPage() {
  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );
  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl border border-slate-200 bg-white lg:grid-cols-[1fr_26rem]">
        <section className="relative hidden overflow-hidden border-r border-slate-200 bg-[#17202b] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <Link className="text-xl font-bold tracking-tight" href="/">
              merzado
            </Link>
            <div className="mt-32 max-w-md">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#9ebbf4]">
                <span className="h-px w-6 bg-[#9ebbf4]" />
                B2B sourcing, made clearer
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[0.95] tracking-[-0.07em]">
                The right request meets the right supplier.
              </h1>
              <p className="mt-6 max-w-sm text-sm leading-6 text-slate-300">
                One focused workspace for posting requirements, finding
                opportunities, and making decisions with less back-and-forth.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 border-t border-white/15 pt-5 text-xs text-slate-400">
            <ShieldCheck className="size-4 text-[#9ebbf4]" />
            Private workspace · built for business requests
          </div>
        </section>
        <section className="flex flex-col justify-center p-6 sm:p-10">
          <div className="lg:hidden">
            <Link
              className="text-xl font-bold tracking-tight text-slate-950"
              href="/"
            >
              merzado
            </Link>
          </div>
          <div className="mt-12 sm:mt-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-600">
              Marketplace access
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
              Welcome back.
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Choose one workspace, then sign in with your preferred method.
            </p>
            <div className="mt-7">
              <LoginMethods githubEnabled={githubEnabled} />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
