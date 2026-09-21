"use client";

import Link from "next/link";
import {
  Clock3,
  ImageIcon,
  MapPin,
  Search,
  Send,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import * as React from "react";

export type MarketplaceItem = {
  id: string;
  title: string;
  description: string;
  categoryName: string | null;
  quantity: number;
  unit: string;
  deliveryLocation: string;
  deadline: Date;
  imageUrl: string | null;
};

type Filters = {
  q: string;
  area: string;
  minQty: string;
  maxQty: string;
  window: string;
  category: string;
};
const initialFilters: Filters = {
  q: "",
  area: "",
  minQty: "",
  maxQty: "",
  window: "",
  category: "",
};

export function MarketplaceBrowser({
  items,
  success,
  error,
}: {
  items: MarketplaceItem[];
  success?: string;
  error?: string;
}) {
  const [filters, setFilters] = React.useState(initialFilters);
  const [draftFilters, setDraftFilters] = React.useState(initialFilters);
  const [isFiltering, startFiltering] = React.useTransition();
  const [openedAt] = React.useState(() => Date.now());
  const query = filters.q.trim().toLowerCase();
  const area = filters.area.trim().toLowerCase();
  const minQty = Number(filters.minQty);
  const maxQty = Number(filters.maxQty);
  const windowDays = Number(filters.window);
  const category = filters.category;
  const cutoff = windowDays ? openedAt + windowDays * 24 * 60 * 60 * 1000 : 0;
  const filteredItems = items.filter((item) => {
    const matchesQuery =
      !query ||
      `${item.title} ${item.description}`.toLowerCase().includes(query);
    const matchesArea =
      !area || item.deliveryLocation.toLowerCase().includes(area);
    const matchesMin =
      !Number.isFinite(minQty) || minQty <= 0 || item.quantity >= minQty;
    const matchesMax =
      !Number.isFinite(maxQty) || maxQty <= 0 || item.quantity <= maxQty;
    const matchesWindow = !cutoff || item.deadline.getTime() <= cutoff;
    const matchesCategory = !category || item.categoryName === category;
    return (
      matchesQuery &&
      matchesArea &&
      matchesMin &&
      matchesMax &&
      matchesWindow &&
      matchesCategory
    );
  });
  const hasFilters = Object.values(filters).some(Boolean);

  function applyFilters(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startFiltering(() => setFilters(draftFilters));
  }

  function clearFilters() {
    startFiltering(() => {
      setFilters(initialFilters);
      setDraftFilters(initialFilters);
    });
  }

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-indigo-600">
            Supplier marketplace
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950 sm:text-4xl">
            Find your next order
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Filter live buyer requests without leaving the marketplace.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <TrendingUp className="size-4 text-indigo-600" />
          {filteredItems.length} matching opportunities
        </div>
      </header>
      <form
        className="mt-5 border border-slate-200 bg-white p-3 sm:p-4"
        onSubmit={applyFilters}
        role="search"
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-none border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-500"
              value={draftFilters.q}
              onChange={(event) =>
                setDraftFilters({ ...draftFilters, q: event.target.value })
              }
              placeholder="Product or requirement"
            />
          </div>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3 top-3 size-4 text-slate-400" />
            <input
              className="h-10 w-full rounded-none border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-500"
              value={draftFilters.area}
              onChange={(event) =>
                setDraftFilters({ ...draftFilters, area: event.target.value })
              }
              placeholder="Delivery area or city"
            />
          </div>
          <button
            className="inline-flex h-10 items-center justify-center gap-2 bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
            disabled={isFiltering}
            type="submit"
          >
            <SlidersHorizontal className="size-4" />
            {isFiltering ? "Filtering..." : "Apply filters"}
          </button>
        </div>
        <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-4">
          <FilterInput
            label="Minimum quantity"
            value={draftFilters.minQty}
            onChange={(value) =>
              setDraftFilters({ ...draftFilters, minQty: value })
            }
            placeholder="Any"
          />
          <label className="text-xs font-medium text-slate-600">
            Category
            <select
              className="mt-1.5 h-9 w-full rounded-none border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
              value={draftFilters.category}
              onChange={(event) =>
                setDraftFilters({ ...draftFilters, category: event.target.value })
              }
            >
              <option value="">All categories</option>
              {[
                ...new Set(
                  items
                    .map((item) => item.categoryName)
                    .filter((name): name is string => Boolean(name)),
                ),
              ]
                .sort()
                .map((categoryName) => (
                  <option key={categoryName} value={categoryName}>
                    {categoryName}
                  </option>
                ))}
            </select>
          </label>
          <FilterInput
            label="Maximum quantity"
            value={draftFilters.maxQty}
            onChange={(value) =>
              setDraftFilters({ ...draftFilters, maxQty: value })
            }
            placeholder="Any"
          />
          <label className="text-xs font-medium text-slate-600">
            Deadline window
            <select
              className="mt-1.5 h-9 w-full rounded-none border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
              value={draftFilters.window}
              onChange={(event) =>
                setDraftFilters({ ...draftFilters, window: event.target.value })
              }
            >
              <option value="">Any open deadline</option>
              <option value="7">Closes within 7 days</option>
              <option value="30">Closes within 30 days</option>
              <option value="90">Closes within 90 days</option>
            </select>
          </label>
        </div>
        {hasFilters && (
          <button
            className="mt-3 text-xs font-medium text-slate-500 underline underline-offset-4 hover:text-slate-950"
            type="button"
            onClick={clearFilters}
          >
            Clear all filters
          </button>
        )}
      </form>
      {success && (
        <p className="mt-5 border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          Quotation submitted successfully. The buyer can now review your offer.
        </p>
      )}
      {error && (
        <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          This RFQ is no longer available.
        </p>
      )}
      <section className="mt-8">
        <div className="flex items-end justify-between border-b border-slate-200 pb-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Open opportunities
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
              Buyer requests
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            {hasFilters ? "Filtered locally" : "Sorted by deadline"}
          </span>
        </div>
        {filteredItems.length === 0 ? (
          <EmptyMarketplace filtered={hasFilters} />
        ) : (
          <div className="space-y-2 pt-3">
            {filteredItems.map((item) => (
              <MarketplaceRow key={item.id} rfq={item} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function FilterInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <label className="text-xs font-medium text-slate-600">
      {label}
      <input
        className="mt-1.5 h-9 w-full rounded-none border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="number"
        min="1"
        placeholder={placeholder}
      />
    </label>
  );
}
function MarketplaceRow({ rfq }: { rfq: MarketplaceItem }) {
  return (
    <article className="group grid gap-4 border border-slate-200 border-l-4 border-l-indigo-500 bg-white px-4 py-4 transition hover:border-slate-300 hover:shadow-sm sm:grid-cols-[minmax(0,1.2fr)_minmax(16rem,1.4fr)_7rem] sm:items-center sm:px-5">
      <div className="flex min-w-0 gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden border border-slate-200 bg-slate-50">
          {rfq.imageUrl ? (
            <img className="size-full object-cover" src={rfq.imageUrl} alt="" />
          ) : (
            <ImageIcon className="size-5 text-slate-300" />
          )}
        </div>
        <div className="min-w-0">
          {rfq.categoryName && (
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-indigo-600">
              {rfq.categoryName}
            </p>
          )}
          <h3 className="font-semibold tracking-[-0.01em] text-slate-950">{rfq.title}</h3>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
            {rfq.description}
          </p>
        </div>
      </div>
      <div className="min-w-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              Requested
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-800">
              {rfq.quantity.toLocaleString()}{" "}
              <span className="font-normal text-slate-500">{rfq.unit}</span>
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
              <Clock3 className="size-3 text-indigo-600" />
              Closes
            </p>
            <p className="mt-1 text-sm font-medium text-slate-800">
              {rfq.deadline.toLocaleDateString()}
            </p>
          </div>
        </div>
        <p
          className="mt-3 flex items-start gap-1.5 text-xs leading-5 text-slate-600"
          title={rfq.deliveryLocation}
        >
          <MapPin className="mt-0.5 size-3.5 shrink-0 text-indigo-600" />
          <span className="line-clamp-2">
            {compactLocation(rfq.deliveryLocation)}
          </span>
        </p>
      </div>
      <Link
        className="inline-flex h-9 items-center justify-center gap-2 bg-slate-950 px-3 text-xs font-semibold text-white hover:bg-slate-800"
        href={`/supplier/rfqs/${rfq.id}`}
      >
        <Send className="size-3.5" />
        View RFQ
      </Link>
    </article>
  );
}
function compactLocation(value: string) {
  return (
    value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(", ") || value
  );
}
function EmptyMarketplace({ filtered }: { filtered: boolean }) {
  return (
    <div className="border-b border-slate-200 bg-white px-6 py-14 text-center">
      <h2 className="font-semibold text-slate-950">
        {filtered ? "No requests match these filters" : "No open opportunities"}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {filtered
          ? "Try widening the quantity, location, or deadline filters."
          : "Check back when buyers publish new requests."}
      </p>
    </div>
  );
}
