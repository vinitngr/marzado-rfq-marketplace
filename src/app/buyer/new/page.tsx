import { Suspense } from "react";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/shared/site-header";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { NewRfqForm } from "./rfq-form";

export default function NewRfqPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <Suspense
          fallback={
            <p className="animate-pulse text-sm text-slate-400">Loading…</p>
          }
        >
          <NewRfqContent searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function NewRfqContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const availableCategories = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));
  return <NewRfqForm error={error} categories={availableCategories} />;
}
