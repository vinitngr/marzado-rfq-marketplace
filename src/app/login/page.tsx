import Link from "next/link";
import { LoginMethods } from "@/components/auth/login-methods";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const githubEnabled = Boolean(
    process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET,
  );
  const params = await searchParams;
  const requestedRole = params.role?.toUpperCase();
  const initialRole =
    requestedRole === "SUPPLIER" || requestedRole === "BUYER"
      ? requestedRole
      : undefined;

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-5 py-8 text-[#17202b] sm:px-8 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-3xl flex-col justify-center">
        <Link
          className="mb-7 text-center text-sm font-semibold tracking-[-0.02em] text-[#17202b]"
          href="/"
        >
          merzado-rfq-marketplace
        </Link>
        <section className="mx-auto w-full max-w-2xl border-t border-[#dfe3e8] pt-7 sm:pt-8">
          <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-[#77818d]">
            Marketplace access
          </p>
          <h1 className="mt-3 text-center text-3xl font-semibold tracking-[-0.06em] text-[#17202b]">
            Choose your workspace.
          </h1>
          <p className="mx-auto mt-2 max-w-md text-center text-sm leading-6 text-[#6e7885]">
            Select whether you are buying or supplying, then continue.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <LoginMethods
              githubEnabled={githubEnabled}
              initialRole={initialRole}
            />
          </div>
        </section>
      </div>
    </main>
  );
}
