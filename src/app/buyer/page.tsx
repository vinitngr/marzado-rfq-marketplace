import Link from "next/link";
import {
  ArrowUpRight,
  FilePlus2,
  ImageIcon,
  MessageSquareText,
  PackageCheck,
} from "lucide-react";
import { Suspense } from "react";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quotations, rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import {
  SiteHeader,
  SiteHeaderFallback,
} from "@/components/shared/site-header";

export default function BuyerPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; image?: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <Suspense fallback={<SiteHeaderFallback />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-6xl px-4 py-9 sm:px-6">
        <Suspense fallback={<RfqListFallback />}>
          <RfqList searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}

async function RfqList({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; image?: string }>;
}) {
  const user = await requireUser("BUYER");
  const { created, image } = await searchParams;
  const items = await db
    .select({
      id: rfqs.id,
      title: rfqs.title,
      quantity: rfqs.quantity,
      unit: rfqs.unit,
      deliveryLocation: rfqs.deliveryLocation,
      deadline: rfqs.deadline,
      status: rfqs.status,
      imageUrl: rfqs.imageUrl,
      quoteCount: quotations.id,
      createdAt: rfqs.createdAt,
    })
    .from(rfqs)
    .leftJoin(quotations, eq(rfqs.id, quotations.rfqId))
    .where(eq(rfqs.buyerId, user.id))
    .orderBy(desc(rfqs.createdAt));
  const grouped = Object.values(Object.groupBy(items, (item) => item.id)).map(
    (group) => ({
      ...group![0],
      quotes: group!.filter((row) => row.quoteCount).length,
    }),
  );
  const openCount = grouped.filter((item) => item.status === "OPEN").length;
  const quoteCount = grouped.reduce((total, item) => total + item.quotes, 0);
  const nextDeadline = grouped
    .filter((item) => item.status === "OPEN")
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())[0];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-5 border-b border-slate-200 pb-7">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
            Buyer workspace
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-[-0.06em] text-slate-950">
            Your buying desk
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Track live requests, compare supplier interest, and keep purchasing
            moving.
          </p>
        </div>
        <a
          className="inline-flex h-10 items-center gap-2 rounded-none bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800"
          href="/buyer/new"
        >
          <FilePlus2 className="size-4" />
          Create RFQ
        </a>
      </header>
      {created === "1" && (
        <p className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          RFQ published successfully. Suppliers can now review your request.
        </p>
      )}
      <section className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-3">
        <Metric
          icon={<PackageCheck className="size-4" />}
          label="Open requests"
          value={String(openCount)}
          detail="currently visible to suppliers"
        />
        <Metric
          icon={<MessageSquareText className="size-4" />}
          label="Supplier responses"
          value={String(quoteCount)}
          detail="across your requests"
        />
        <Metric
          icon={<ArrowUpRight className="size-4" />}
          label="Next deadline"
          value={
            nextDeadline
              ? nextDeadline.deadline.toLocaleDateString(undefined, {
                  day: "numeric",
                  month: "short",
                })
              : "—"
          }
          detail={nextDeadline ? nextDeadline.title : "No open deadlines"}
        />
      </section>
      <section className="mt-10">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Request ledger
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Recent RFQs
            </h2>
          </div>
          <span className="text-xs text-slate-500">{grouped.length} total</span>
        </div>
        {grouped.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y divide-slate-200 border-b border-slate-200">
            {grouped.map((rfq) => (
              <RfqRow key={rfq.id} rfq={rfq} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Metric({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="bg-white p-5">
      <div className="flex items-center gap-2 text-slate-400">
        <span className="text-indigo-600">{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-[-0.06em] text-slate-950">
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500">{detail}</p>
    </div>
  );
}

function RfqRow({
  rfq,
}: {
  rfq: {
    id: string;
    title: string;
    quantity: number;
    unit: string;
    deliveryLocation: string;
    deadline: Date;
    status: string;
    imageUrl: string | null;
    quotes: number;
  };
}) {
  return (
    <Link
      className="group grid gap-4 bg-white px-1 py-5 transition hover:bg-[#eef3ff] sm:grid-cols-[minmax(0,1fr)_13rem_8rem_6rem] sm:items-center sm:px-3"
      href={`/buyer/rfqs/${rfq.id}`}
    >
      <div className="flex min-w-0 gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50">
          {rfq.imageUrl ? (
            <img className="size-full object-cover" src={rfq.imageUrl} alt="" />
          ) : (
            <ImageIcon className="size-5 text-slate-300" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-950 group-hover:text-indigo-700">
            {rfq.title}
          </h3>
          <p className="mt-1 truncate text-xs text-slate-500">
            {rfq.quantity} {rfq.unit} · {rfq.deliveryLocation}
          </p>
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Deadline
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {rfq.deadline.toLocaleDateString()}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Responses
        </p>
        <p className="mt-1 text-sm text-slate-700">
          {rfq.quotes} quote{rfq.quotes === 1 ? "" : "s"}
        </p>
      </div>
      <span
        className={`w-fit border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${rfq.status === "OPEN" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}
      >
        {rfq.status}
      </span>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-14 text-center">
      <h2 className="font-semibold text-slate-950">
        Your buying desk is clear.
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Create an RFQ to start collecting supplier responses.
      </p>
      <Link
        className="mt-5 inline-flex h-9 items-center bg-slate-950 px-4 text-sm font-semibold text-white"
        href="/buyer/new"
      >
        Create your first RFQ
      </Link>
    </div>
  );
}

function RfqListFallback() {
  return (
    <div className="space-y-5">
      <div className="h-28 animate-pulse border-b border-slate-200 bg-slate-100" />
      <div className="h-48 animate-pulse border border-slate-200 bg-white" />
    </div>
  );
}
