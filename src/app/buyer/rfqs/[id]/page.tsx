import Link from "next/link";
import { Suspense } from "react";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotations, rfqs, users } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { awardQuote } from "../../actions";
import { SiteHeader, SiteHeaderFallback } from "@/components/shared/site-header";

export default function BuyerRfqPage({ params }: { params: Promise<{ id: string }> }) {
  return <div className="min-h-screen bg-slate-50"><Suspense fallback={<SiteHeaderFallback />}><SiteHeader /></Suspense><main className="mx-auto max-w-5xl px-4 py-10"><Suspense fallback={<Link className="text-sm text-slate-600" href="/buyer">← Your RFQs</Link>}><RfqDetail params={params} /></Suspense></main></div>;
}

async function RfqDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("BUYER"); const { id } = await params;
  const rfq = await db.query.rfqs.findFirst({ where: and(eq(rfqs.id, id), eq(rfqs.buyerId, user.id)) }); if (!rfq) notFound();
  const items = await db.select({ id: quotations.id, price: quotations.price, leadTimeDays: quotations.leadTimeDays, notes: quotations.notes, status: quotations.status, supplier: users.companyName, supplierEmail: users.email }).from(quotations).innerJoin(users, eq(quotations.supplierId, users.id)).where(eq(quotations.rfqId, id)).orderBy(asc(quotations.price));
  return <><Link className="text-sm text-slate-600" href="/buyer">← Your RFQs</Link><div className="mt-5 flex flex-wrap justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-600">{rfq.status}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{rfq.title}</h1><p className="mt-2 text-sm text-slate-600">{rfq.quantity} {rfq.unit} · {rfq.deliveryLocation} · closes {rfq.deadline.toLocaleDateString()}</p></div></div><section className="mt-8"><h2 className="text-xl font-semibold">Received quotations ({items.length})</h2>{items.length === 0 ? <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">No supplier quotations yet. We&apos;ll show them here when they arrive.</p> : <div className="mt-4 grid gap-4">{items.map((quote) => <article className="rounded-xl border border-slate-200 bg-white p-5" key={quote.id}><div className="flex flex-wrap justify-between gap-4"><div><h3 className="font-semibold">{quote.supplier || quote.supplierEmail}</h3><p className="mt-1 text-sm text-slate-600">₹{Number(quote.price).toLocaleString()} · Delivery in {quote.leadTimeDays} days</p></div><span className={`h-fit rounded-full px-2.5 py-1 text-xs font-semibold ${quote.status === "ACCEPTED" ? "bg-emerald-50 text-emerald-700" : quote.status === "REJECTED" ? "bg-slate-100 text-slate-600" : "bg-amber-50 text-amber-700"}`}>{quote.status}</span></div><p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{quote.notes}</p>{rfq.status === "OPEN" && quote.status === "PENDING" && <form action={awardQuote} className="mt-5"><input name="rfqId" type="hidden" value={rfq.id} /><input name="quoteId" type="hidden" value={quote.id} /><button className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white">Accept and award RFQ</button></form>}</article>)}</div>}</section></>;
}