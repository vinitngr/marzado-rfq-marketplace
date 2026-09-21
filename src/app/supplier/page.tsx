import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/shared/site-header";
import { MarketplaceBrowser } from "./marketplace-browser";

export default function SupplierPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8">
        <Suspense fallback={<MarketplaceFallback />}>
          <Marketplace searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function Marketplace({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await requireUser("SUPPLIER");
  const params = await searchParams;
  const items = await db
    .select()
    .from(rfqs)
    .where(eq(rfqs.status, "OPEN"))
    .orderBy(asc(rfqs.deadline));
  return (
    <MarketplaceBrowser
      items={items}
      success={params.success}
      error={params.error}
    />
  );
}

function MarketplaceFallback() {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-7">
        <div className="h-3 w-36 animate-pulse bg-slate-200" />
        <div className="mt-3 h-10 w-80 animate-pulse bg-slate-200" />
        <div className="mt-3 h-4 w-96 max-w-full animate-pulse bg-slate-200" />
      </div>
      <div className="h-40 w-full animate-pulse border border-slate-200 bg-white" />
      <div className="space-y-px border-y border-slate-200 bg-slate-200">
        {[1, 2, 3].map((item) => (
          <div className="h-28 animate-pulse bg-white" key={item} />
        ))}
      </div>
    </div>
  );
}
