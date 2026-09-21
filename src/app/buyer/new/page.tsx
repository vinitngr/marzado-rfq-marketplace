import Link from "next/link";
import { createRfq } from "../actions";
import { SiteHeader } from "@/components/shared/site-header";

export default function NewRfqPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  return <NewRfqForm searchParams={searchParams} />;
}

async function NewRfqForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return <div className="min-h-screen bg-slate-50"><SiteHeader /><main className="mx-auto max-w-2xl px-4 py-10"><Link className="text-sm text-slate-600" href="/buyer">← Back to RFQs</Link><h1 className="mt-5 text-3xl font-semibold tracking-tight">Create an RFQ</h1><p className="mt-2 text-slate-600">Give suppliers enough context to quote accurately.</p>{error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">Please check the required fields and choose a future deadline.</p>}<form action={createRfq} className="mt-7 space-y-5 rounded-xl border border-slate-200 bg-white p-6"><Field label="Product or service name" name="title" placeholder="e.g. Custom corrugated boxes" /><label className="block text-sm font-medium">Requirement description<textarea className="mt-1.5 min-h-28 w-full rounded-md border border-slate-300 p-3" name="description" required minLength={10} placeholder="Include dimensions, material, quality requirements…" /></label><div className="grid gap-5 sm:grid-cols-2"><Field label="Quantity" name="quantity" type="number" min="1" placeholder="500" /><Field label="Unit" name="unit" placeholder="pieces" defaultValue="units" /></div><Field label="Delivery location" name="deliveryLocation" placeholder="Mumbai, Maharashtra" /><Field label="RFQ deadline" name="deadline" type="date" /><button className="w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white">Publish RFQ</button></form></main></div>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) { return <label className="block text-sm font-medium">{label}<input className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2" required {...props} /></label>; }
