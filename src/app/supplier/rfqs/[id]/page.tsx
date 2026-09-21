import Link from "next/link";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { submitQuote } from "../../actions";
import { SiteHeader, SiteHeaderFallback } from "@/components/shared/site-header";

export default function RfqDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  return <div className="min-h-screen bg-slate-50"><Suspense fallback={<SiteHeaderFallback />}><SiteHeader /></Suspense><main className="mx-auto grid max-w-5xl gap-7 px-4 py-10 lg:grid-cols-[1.25fr_.75fr]"><Suspense fallback={<Link className="text-sm text-slate-600" href="/supplier">← Marketplace</Link>}><RfqDetail params={params} searchParams={searchParams} /></Suspense></main></div>;
}

async function RfqDetail({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  await requireUser("SUPPLIER"); const { id } = await params; const { error } = await searchParams; const rfq = await db.query.rfqs.findFirst({ where: eq(rfqs.id, id) }); if (!rfq || rfq.status !== "OPEN") notFound();
  return <><Link className="text-sm text-slate-600" href="/supplier">← Marketplace</Link><section><p className="mt-6 text-sm font-semibold text-indigo-600">Open RFQ</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">{rfq.title}</h1>{rfq.imageUrl && <img className="mt-6 max-h-80 w-full rounded-xl object-contain bg-white p-3" src={rfq.imageUrl} alt={`${rfq.title} reference`} />}<dl className="mt-7 grid gap-5 rounded-xl border border-slate-200 bg-white p-6 sm:grid-cols-2"><Info label="Quantity" value={`${rfq.quantity} ${rfq.unit}`} /><Info label="Delivery location" value={rfq.deliveryLocation} /><Info label="Deadline" value={rfq.deadline.toLocaleDateString()} /><Info label="Status" value={rfq.status} /><div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Requirement details</dt><dd className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">{rfq.description}</dd></div></dl></section><aside className="h-fit rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold">Send quotation</h2><p className="mt-1 text-sm text-slate-600">Submit one competitive response for this RFQ.</p>{error && <p className="mt-4 text-sm text-red-600">Please fill every field correctly.</p>}<form action={submitQuote} className="mt-5 space-y-4"><input name="rfqId" type="hidden" value={rfq.id} /><Field label="Quoted price" name="price" placeholder="25000" type="number" min="1" step="0.01" /><Field label="Estimated delivery (days)" name="leadTimeDays" placeholder="14" type="number" min="1" /><label className="block text-sm font-medium">Message / notes<textarea className="mt-1.5 min-h-28 w-full rounded-md border border-slate-300 p-3" name="notes" required minLength={5} placeholder="Include terms, inclusions, or clarifications…" /></label><button className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Submit quotation</button></form></aside></>;
}
function Info({ label, value }: { label: string; value: string }) { return <div><dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 text-sm font-medium text-slate-800">{value}</dd></div>; }
function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="block text-sm font-medium">{label}<input className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2" required {...props} /></label>; }
