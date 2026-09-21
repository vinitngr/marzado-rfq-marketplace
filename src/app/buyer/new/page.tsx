import { Suspense } from "react";
import { SiteHeader, SiteHeaderFallback } from "@/components/shared/site-header";
import { NewRfqForm } from "./rfq-form";

export default function NewRfqPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <div className="min-h-screen bg-slate-50"><Suspense fallback={<SiteHeaderFallback />}><SiteHeader /></Suspense><main className="mx-auto max-w-5xl px-4 py-10"><Suspense fallback={<p className="animate-pulse text-sm text-slate-400">Loading…</p>}><NewRfqContent searchParams={searchParams} /></Suspense></main></div>;
}

async function NewRfqContent({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <NewRfqForm error={error} />;
}