import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { Suspense } from "react";
import { and, asc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { SiteHeader, SiteHeaderFallback } from "@/components/shared/site-header";

export default function SupplierPage({ searchParams }: { searchParams: Promise<{ q?: string; success?: string; error?: string }> }) {
  return <div className="min-h-screen bg-slate-50"><Suspense fallback={<SiteHeaderFallback />}><SiteHeader /></Suspense><main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-sm font-semibold text-indigo-600">Supplier marketplace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Available RFQs</h1><Suspense fallback={<div className="mt-7 grid gap-4">{Array.from({ length: 2 }).map((_, i) => <div className="rounded-xl border border-slate-200 bg-white p-5" key={i}><div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" /><div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-100" /><div className="mt-4 h-3 w-1/4 animate-pulse rounded bg-slate-100" /></div>)}</div>}><SupplierContent searchParams={searchParams} /></Suspense></main></div>;
}

async function SupplierContent({ searchParams }: { searchParams: Promise<{ q?: string; success?: string; error?: string }> }) {
  await requireUser("SUPPLIER"); const { q = "", success, error } = await searchParams;
  const term = q.trim(); const conditions = [eq(rfqs.status, "OPEN")]; if (term) conditions.push(or(ilike(rfqs.title, `%${term}%`), ilike(rfqs.description, `%${term}%`))!);
  const items = await db.select().from(rfqs).where(and(...conditions)).orderBy(asc(rfqs.deadline));
  return <><form className="mt-6 flex gap-2"><input className="w-full max-w-lg rounded-md border border-slate-300 bg-white px-3 py-2 text-sm" defaultValue={term} name="q" placeholder="Search by product or requirement" /><button className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium">Search</button></form>{success && <p className="mt-4 rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">Quotation submitted successfully.</p>}{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">This RFQ is no longer available.</p>}<div className="mt-7 grid gap-4">{items.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold">No matching RFQs</h2><p className="mt-2 text-sm text-slate-600">Try a different search or check back later.</p></div> : items.map((rfq) => <article className="rounded-xl border border-slate-200 bg-white p-5" key={rfq.id}><div className="flex gap-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-4"><div><h2 className="font-semibold text-slate-950">{rfq.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{rfq.description}</p><p className="mt-3 text-sm text-slate-500">{rfq.quantity} {rfq.unit} · {rfq.deliveryLocation} · closes {rfq.deadline.toLocaleDateString()}</p></div><Link className="h-fit rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white" href={`/supplier/rfqs/${rfq.id}`}>View & quote</Link></div></div>{rfq.imageUrl ? <img className="size-24 shrink-0 rounded-lg object-cover" src={rfq.imageUrl} alt="" /> : <span className="flex size-24 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-300"><ImageIcon className="size-5" /></span>}</div></article>)}</div></>;
}