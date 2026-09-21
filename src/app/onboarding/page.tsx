import { Suspense } from "react";
import { ArrowRight, BriefcaseBusiness, ShoppingBag } from "lucide-react";
import { chooseRole } from "./actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#f5f6f8]" />}>
      <OnboardingGate searchParams={searchParams} />
    </Suspense>
  );
}

async function OnboardingGate({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const { role } = await searchParams;
  const requestedRole =
    role === "BUYER" || role === "SUPPLIER" ? role : undefined;
  if (!requestedRole && session.user.role === "BUYER") redirect("/buyer");
  if (!requestedRole && session.user.role === "SUPPLIER") redirect("/supplier");

  return (
    <main className="min-h-screen bg-[#f5f6f8] px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl border border-slate-200 bg-white">
        <header className="flex items-center justify-between border-b border-slate-200 px-6 py-5 sm:px-10">
          <span className="text-xl font-bold tracking-tight text-slate-950">
            merzado-rfq-marketplace
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
            Set up your workspace
          </span>
        </header>
        <div className="grid lg:grid-cols-[.8fr_1.2fr]">
          <section className="border-b border-slate-200 bg-[#17202b] p-7 text-white lg:border-b-0 lg:border-r sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9ebbf4]">
              One last step
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-none tracking-[-0.07em]">
              Choose your side of the market.
            </h1>
            <p className="mt-5 text-sm leading-6 text-slate-300">
              Your workspace will be tailored to the work you need to do on
              Merzado.
            </p>
          </section>
          <section className="p-6 sm:p-10">
            <p className="text-sm text-slate-500">
              You can change this later through your account setup.
            </p>
            <form action={chooseRole} className="mt-7 grid gap-3">
              <RoleButton
                role="BUYER"
                icon={<ShoppingBag className="size-5" />}
                title="I’m a buyer"
                description="Post requirements, compare offers, and choose the right supplier."
              />
              <RoleButton
                role="SUPPLIER"
                icon={<BriefcaseBusiness className="size-5" />}
                title="I’m a supplier"
                description="Find relevant RFQs, respond with confidence, and win work."
              />
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}

function RoleButton({
  role,
  icon,
  title,
  description,
}: {
  role: "BUYER" | "SUPPLIER";
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <button
      className="group flex items-center gap-4 border border-slate-300 bg-white p-5 text-left transition hover:border-indigo-500 hover:bg-[#eef3ff]"
      name="role"
      value={role}
      type="submit"
    >
      <span className="flex size-11 shrink-0 items-center justify-center bg-indigo-50 text-indigo-600">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <strong className="block text-sm font-semibold text-slate-950">
          {title}
        </strong>
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>
      <ArrowRight className="size-4 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
    </button>
  );
}
