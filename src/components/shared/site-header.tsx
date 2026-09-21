import Link from "next/link";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export function SiteHeaderFallback() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <span className="text-xl font-bold tracking-[-0.04em] text-slate-950">
          merzado
        </span>
        <span className="h-8 w-24 animate-pulse rounded-md bg-slate-100" />
      </div>
    </header>
  );
}

export async function SiteHeader() {
  const session = await auth();
  const databaseUser = session?.user?.id
    ? await db.query.users.findFirst({
        where: eq(users.id, session.user.id),
        columns: { role: true },
      })
    : null;
  const role = databaseUser?.role ?? session?.user?.role;
  const home =
    role === "BUYER" ? "/buyer" : role === "SUPPLIER" ? "/supplier" : "/";
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          className="text-xl font-bold tracking-[-0.04em] text-slate-950"
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
            <>
              <Link
                className="text-slate-600 hover:text-slate-950"
                href="/supplier"
              >
                Marketplace
              </Link>
              <Link
                className="text-slate-600 hover:text-slate-950"
                href="/supplier/quotes"
              >
                My quotes
              </Link>
            </>
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
