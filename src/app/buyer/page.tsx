import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations, rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { SiteHeader } from "@/components/shared/site-header";

export default async function BuyerPage() {
  const user = await requireUser("BUYER");
  const items = await db.select({ id: rfqs.id, title: rfqs.title, quantity: rfqs.quantity, unit: rfqs.unit, deadline: rfqs.deadline, status: rfqs.status, quoteCount: quotations.id }).from(rfqs).leftJoin(quotations, eq(rfqs.id, quotations.rfqId)).where(eq(rfqs.buyerId, user.id)).orderBy(desc(rfqs.createdAt));
  const grouped = Object.values(Object.groupBy(items, (item) => item.id)).map((group) => ({ ...group![0], quotes: group!.filter((row) => row.quoteCount).length }));
  return <div className="min-h-screen bg-slate-50"><SiteHeader /><main className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-indigo-600">Buyer workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Your RFQs</h1></div><Link className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white" href="/buyer/new">Create RFQ</Link></div>{grouped.length === 0 ? <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="font-semibold">No RFQs yet</h2><p className="mt-2 text-sm text-slate-600">Publish your first requirement to start receiving supplier quotations.</p></div> : <div className="mt-8 grid gap-4">{grouped.map((rfq) => <Link className="block rounded-xl border border-slate-200 bg-white p-5 hover:border-indigo-300" href={`/buyer/rfqs/${rfq.id}`} key={rfq.id}><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold text-slate-950">{rfq.title}</h2><p className="mt-1 text-sm text-slate-600">{rfq.quantity} {rfq.unit} · Deadline {rfq.deadline.toLocaleDateString()}</p></div><span className="h-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{rfq.status}</span></div><p className="mt-4 text-sm font-medium text-slate-700">{rfq.quotes} quotation{rfq.quotes === 1 ? "" : "s"} received</p></Link>)}</div>}</main></div>;
}
