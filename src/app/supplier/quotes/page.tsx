import Link from "next/link";
import { ArrowLeft, CalendarDays, MapPin, Send } from "lucide-react";
import { Suspense } from "react";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations, rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/shared/site-header";

export default function SupplierQuotesPage() {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-8">
        <Suspense fallback={<QuotesFallback />}>
          <QuoteHistory />
        </Suspense>
      </main>
    </div>
  );
}

async function QuoteHistory() {
  const supplier = await requireUser("SUPPLIER");
  const items = await db
    .select({
      id: quotations.id,
      rfqId: rfqs.id,
      title: rfqs.title,
      deliveryLocation: rfqs.deliveryLocation,
      deadline: rfqs.deadline,
      price: quotations.price,
      leadTimeDays: quotations.leadTimeDays,
      status: quotations.status,
      rfqStatus: rfqs.status,
    })
    .from(quotations)
    .innerJoin(rfqs, eq(quotations.rfqId, rfqs.id))
    .where(eq(quotations.supplierId, supplier.id))
    .orderBy(desc(quotations.createdAt));

  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"
        href="/supplier"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>
      <header className="mt-7 border-b border-slate-200 pb-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
          Supplier workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
          My quotes
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Keep track of the opportunities you responded to.
        </p>
      </header>
      {items.length === 0 ? (
        <div className="mt-6 border border-slate-200 bg-white px-6 py-14 text-center">
          <h2 className="font-semibold text-slate-950">No quotes yet</h2>
          <p className="mt-2 text-sm text-slate-500">
            Browse open requests and send your first offer.
          </p>
          <Link
            className="mt-5 inline-flex h-9 items-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white"
            href="/supplier"
          >
            <Send className="size-4" />
            Find opportunities
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {items.map((item) => (
            <article
              className="grid gap-4 border border-slate-200 border-l-4 border-l-indigo-500 bg-white px-4 py-4 sm:grid-cols-[minmax(0,1fr)_12rem_8rem] sm:items-center sm:px-5"
              key={item.id}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-semibold text-slate-950">
                    {item.title}
                  </h2>
                  <Status status={item.status} rfqStatus={item.rfqStatus} />
                </div>
                <p className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
                  <MapPin className="mt-0.5 size-3.5 shrink-0 text-indigo-600" />
                  <span className="truncate">{item.deliveryLocation}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm sm:block">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    Your quote
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">{item.price}</p>
                </div>
                <div className="sm:mt-3">
                  <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                    <CalendarDays className="size-3" /> Deadline
                  </p>
                  <p className="mt-1 text-slate-700">
                    {item.deadline.toLocaleDateString()}
                  </p>
                </div>
              </div>
              {item.rfqStatus === "OPEN" ? (
                <Link
                  className="inline-flex h-9 items-center justify-center gap-2 bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800"
                  href={`/supplier/rfqs/${item.rfqId}`}
                >
                  View RFQ
                </Link>
              ) : (
                <span className="text-xs text-slate-400">Opportunity closed</span>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}

function Status({
  status,
  rfqStatus,
}: {
  status: string;
  rfqStatus: string;
}) {
  const label = status === "ACCEPTED"
    ? "Awarded"
    : status === "REJECTED"
      ? "Not selected"
      : rfqStatus === "OPEN"
        ? "Pending"
        : "Closed";
  const styles = status === "ACCEPTED"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : status === "REJECTED"
      ? "border-slate-200 bg-slate-50 text-slate-500"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${styles}`}>
      {label}
    </span>
  );
}

function QuotesFallback() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-36 animate-pulse bg-slate-200" />
      <div className="border-b border-slate-200 pb-6">
        <div className="h-4 w-32 animate-pulse bg-slate-200" />
        <div className="mt-3 h-10 w-64 animate-pulse bg-slate-200" />
      </div>
      <div className="h-24 animate-pulse border border-slate-200 bg-white" />
    </div>
  );
}
