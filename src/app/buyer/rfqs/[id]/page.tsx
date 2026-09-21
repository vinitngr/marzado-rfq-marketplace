import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ImageIcon,
  MapPin,
  Trash2,
} from "lucide-react";
import { Suspense } from "react";
import { and, asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { quotations, rfqs, users } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { awardQuote, deleteRfq } from "../../actions";
import { DeliveryMap } from "@/components/shared/delivery-map";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/shared/site-header";

export default function BuyerRfqPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
        <Suspense
          fallback={
            <Link className="text-sm text-slate-600" href="/buyer">
              ← Your RFQs
            </Link>
          }
        >
          <RfqDetail params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function RfqDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser("BUYER");
  const { id } = await params;
  const rfq = await db.query.rfqs.findFirst({
    where: and(eq(rfqs.id, id), eq(rfqs.buyerId, user.id)),
  });
  if (!rfq) notFound();
  const quotes = await db
    .select({
      id: quotations.id,
      price: quotations.price,
      leadTimeDays: quotations.leadTimeDays,
      notes: quotations.notes,
      status: quotations.status,
      supplier: users.companyName,
      supplierEmail: users.email,
    })
    .from(quotations)
    .innerJoin(users, eq(quotations.supplierId, users.id))
    .where(eq(quotations.rfqId, id))
    .orderBy(asc(quotations.price));
  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"
        href="/buyer"
      >
        <ArrowLeft className="size-4" />
        Back to buying desk
      </Link>
      <header className="mt-7 flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-7">
        <div>
          <div className="flex items-center gap-3">
            <span
              className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${rfq.status === "OPEN" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
            >
              {rfq.status}
            </span>
            <span className="text-xs text-slate-400">
              RFQ reference {rfq.id.slice(0, 8)}
            </span>
          </div>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
            {rfq.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Created request · {rfq.quantity} {rfq.unit}
          </p>
        </div>
        {rfq.status === "OPEN" && (
          <form action={deleteRfq}>
            <input name="rfqId" type="hidden" value={rfq.id} />
            <button
              className="inline-flex items-center gap-2 border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              type="submit"
            >
              <Trash2 className="size-4" />
              Delete RFQ
            </button>
          </form>
        )}
      </header>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section className="space-y-8">
          <article className="border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-semibold text-slate-950">Request brief</h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                Buyer view
              </span>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {rfq.description}
            </p>
            {rfq.imageUrl ? (
              <img
                className="mt-6 max-h-80 w-full border border-slate-200 object-contain bg-slate-50 p-2"
                src={rfq.imageUrl}
                alt={`${rfq.title} reference`}
              />
            ) : (
              <div className="mt-6 flex items-center gap-2 border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
                <ImageIcon className="size-4" />
                No reference image attached
              </div>
            )}
          </article>
          {rfq.deliveryLatitude && rfq.deliveryLongitude ? (
            <DeliveryMap
              latitude={Number(rfq.deliveryLatitude)}
              longitude={Number(rfq.deliveryLongitude)}
            />
          ) : (
            <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Map preview is unavailable for this older RFQ because it was
              created before map coordinates were saved. The delivery address
              remains available in the request details.
            </div>
          )}
          <section>
            <div className="flex items-end justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
                  Supplier responses
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
                  Received quotations
                </h2>
              </div>
              <span className="text-sm text-slate-500">
                {quotes.length} total
              </span>
            </div>
            {quotes.length === 0 ? (
              <p className="mt-4 border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600">
                No supplier quotations yet. Responses will appear here as they
                arrive.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {quotes.map((quote) => (
                  <QuoteCard
                    key={quote.id}
                    quote={quote}
                    rfqId={rfq.id}
                    open={rfq.status === "OPEN"}
                  />
                ))}
              </div>
            )}
          </section>
        </section>
        <aside className="border border-slate-200 bg-white">
          <div className="border-b border-slate-100 p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
              Request details
            </p>
            <dl className="mt-5 space-y-5">
              <Info
                icon={<PackageIcon />}
                label="Quantity"
                value={`${rfq.quantity} ${rfq.unit}`}
              />
              <Info
                icon={<MapPin className="size-4" />}
                label="Delivery location"
                value={rfq.deliveryLocation}
              />
              <Info
                icon={<CalendarDays className="size-4" />}
                label="Response deadline"
                value={rfq.deadline.toLocaleDateString()}
              />
            </dl>
          </div>
          <div className="bg-slate-50 p-5">
            <p className="text-xs leading-5 text-slate-500">
              Keep this request open while you compare quotations. Awarding a
              quote closes the buying decision.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function QuoteCard({
  quote,
  rfqId,
  open,
}: {
  quote: {
    id: string;
    price: string;
    leadTimeDays: number;
    notes: string;
    status: string;
    supplier: string | null;
    supplierEmail: string;
  };
  rfqId: string;
  open: boolean;
}) {
  return (
    <article className="border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-slate-950">
            {quote.supplier || "Supplier"}
          </h3>
          <p className="mt-1 text-xs text-slate-500">{quote.supplierEmail}</p>
          <p className="mt-2 text-sm text-slate-600">
            ₹{Number(quote.price).toLocaleString()}{" "}
            <span className="text-slate-300">·</span> delivery in{" "}
            {quote.leadTimeDays} days
          </p>
        </div>
        <span
          className={`border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${quote.status === "ACCEPTED" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : quote.status === "REJECTED" ? "border-slate-200 bg-slate-100 text-slate-500" : "border-amber-200 bg-amber-50 text-amber-700"}`}
        >
          {quote.status}
        </span>
      </div>
      <p className="mt-4 whitespace-pre-wrap border-t border-slate-100 pt-4 text-sm leading-6 text-slate-700">
        {quote.notes}
      </p>
      {open && quote.status === "PENDING" && (
        <form action={awardQuote} className="mt-5">
          <input name="rfqId" type="hidden" value={rfqId} />
          <input name="quoteId" type="hidden" value={quote.id} />
          <button
            className="bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            type="submit"
          >
            Accept and award
          </button>
        </form>
      )}
    </article>
  );
}
function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 text-indigo-600">{icon}</span>
      <div>
        <dt className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </dt>
        <dd className="mt-1 break-words text-sm font-medium text-slate-800">
          {value}
        </dd>
      </div>
    </div>
  );
}
function PackageIcon() {
  return <span className="block size-4 border-2 border-current" />;
}
