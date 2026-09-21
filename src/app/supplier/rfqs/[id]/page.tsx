import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  ImageIcon,
  MapPin,
  Package,
} from "lucide-react";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/shared/site-header";
import { DeliveryMap } from "@/components/shared/delivery-map";
import { QuoteForm } from "./quote-form";

export default function RfqDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
        <Suspense fallback={<DetailFallback />}>
          <RfqDetail params={params} searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function RfqDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  await requireUser("SUPPLIER");
  const { id } = await params;
  const { error } = await searchParams;
  const rfq = await db.query.rfqs.findFirst({ where: eq(rfqs.id, id) });
  if (!rfq || rfq.status !== "OPEN") notFound();
  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-950"
        href="/supplier"
      >
        <ArrowLeft className="size-4" />
        Back to marketplace
      </Link>
      <header className="mt-7 border-b border-slate-200 pb-7">
        <div className="flex flex-wrap items-center gap-3">
          <span className="border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-700">
            Open RFQ
          </span>
          <span className="text-xs text-slate-400">
            Buyer request · {rfq.id.slice(0, 8)}
          </span>
        </div>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.06em] text-slate-950">
          {rfq.title}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review the requirement carefully before sending your offer.
        </p>
      </header>
      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="space-y-6">
          <article className="border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-semibold text-slate-950">
                Buyer requirement
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                RFQ brief
              </span>
            </div>
            <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {rfq.description}
            </p>
            {rfq.imageUrl ? (
              <img
                className="mt-6 max-h-96 w-full border border-slate-200 object-contain bg-slate-50 p-2"
                src={rfq.imageUrl}
                alt={`${rfq.title} reference`}
              />
            ) : (
              <div className="mt-6 flex items-center gap-2 border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-400">
                <ImageIcon className="size-4" />
                No reference image provided
              </div>
            )}
          </article>
          <div className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3">
            <Info
              icon={<Package className="size-4" />}
              label="Quantity"
              value={`${rfq.quantity} ${rfq.unit}`}
            />
            <Info
              icon={<MapPin className="size-4" />}
              label="Delivery"
              value={rfq.deliveryLocation}
            />
            <Info
              icon={<CalendarDays className="size-4" />}
              label="Deadline"
              value={rfq.deadline.toLocaleDateString()}
            />
          </div>
          {rfq.deliveryLatitude && rfq.deliveryLongitude ? (
            <DeliveryMap
              latitude={Number(rfq.deliveryLatitude)}
              longitude={Number(rfq.deliveryLongitude)}
            />
          ) : (
            <div className="border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
              Map preview is unavailable for this older RFQ, but the full
              delivery address is shown above.
            </div>
          )}
        </section>
        <aside className="border border-slate-200 bg-white p-6 lg:sticky lg:top-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
            Your response
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Send a quote
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Give the buyer a clear price, timeline, and the terms that make your
            offer credible.
          </p>
          {error && (
            <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              Please check the price, timeline, and message fields.
            </p>
          )}
          <QuoteForm rfqId={rfq.id} />
        </aside>
      </div>
    </>
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
    <div className="bg-white p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          {label}
        </span>
      </div>
      <p className="mt-3 break-words text-sm font-medium leading-5 text-slate-800">
        {value}
      </p>
    </div>
  );
}
function DetailFallback() {
  return (
    <div className="space-y-7">
      <div className="h-4 w-36 animate-pulse bg-slate-200" />
      <div className="border-b border-slate-200 pb-7">
        <div className="h-5 w-24 animate-pulse bg-slate-200" />
        <div className="mt-4 h-10 w-96 max-w-full animate-pulse bg-slate-200" />
      </div>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="h-96 animate-pulse border border-slate-200 bg-white" />
        <div className="h-96 animate-pulse border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
