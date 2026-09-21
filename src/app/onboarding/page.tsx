import { Suspense } from "react";
import { chooseRole } from "./actions";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function OnboardingPage() {
  return <Suspense fallback={<main className="grid min-h-screen place-items-center bg-slate-50 p-4" />}><OnboardingGate /></Suspense>;
}

async function OnboardingGate() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "BUYER") redirect("/buyer");
  if (session.user.role === "SUPPLIER") redirect("/supplier");

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form action={chooseRole} className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-indigo-600">One last step</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">How will you use Merzado?</h1>
        <p className="mt-3 text-slate-600">Your role controls the workspace and actions available to you.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button className="rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-500 hover:bg-indigo-50" name="role" value="BUYER">
            <span className="font-semibold text-slate-950">I&apos;m a buyer</span><span className="mt-1 block text-sm text-slate-600">Post requirements and compare supplier quotes.</span>
          </button>
          <button className="rounded-xl border border-slate-200 p-5 text-left hover:border-indigo-500 hover:bg-indigo-50" name="role" value="SUPPLIER">
            <span className="font-semibold text-slate-950">I&apos;m a supplier</span><span className="mt-1 block text-sm text-slate-600">Find RFQs and send competitive quotations.</span>
          </button>
        </div>
      </form>
    </main>
  );
}