import Link from "next/link";
import { auth, signOut } from "@/lib/auth";

export function SiteHeaderFallback() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="text-xl font-bold tracking-tight text-slate-950">
          merzado-rfq-marketplace
        </span>
        <span className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
      </div>
    </header>
  );
}

export async function SiteHeader() {
  const session = await auth();
  const role = session?.user?.role;
  const home =
    role === "BUYER" ? "/buyer" : role === "SUPPLIER" ? "/supplier" : "/";
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          className="text-xl font-bold tracking-tight text-slate-950"
          href={home}
        >
          merzado-rfq-marketplace
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          {role === "BUYER" && (
            <Link className="text-slate-600 hover:text-slate-950" href="/buyer">
              My RFQs
            </Link>
          )}
          {role === "SUPPLIER" && (
            <Link
              className="text-slate-600 hover:text-slate-950"
              href="/supplier"
            >
              Marketplace
            </Link>
          )}
          {session?.user ? (
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button className="rounded-md border border-slate-200 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50">
                Sign out
              </button>
            </form>
          ) : (
            <Link className="font-medium text-indigo-600" href="/login">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
