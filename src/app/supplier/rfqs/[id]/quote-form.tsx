"use client";

import { useFormStatus } from "react-dom";
import { IndianRupee, MessageSquareText, Truck } from "lucide-react";
import { submitQuote } from "../../actions";

export function QuoteForm({ rfqId }: { rfqId: string }) {
  return (
    <form action={submitQuote} className="mt-7">
      <input name="rfqId" type="hidden" value={rfqId} />
      <div className="border-y border-slate-200 py-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <IndianRupee className="size-3.5 text-indigo-600" />
          Your offer
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Quoted price</span>
          <span className="relative block">
            <span className="pointer-events-none absolute left-3 top-3 text-sm text-slate-400">
              ₹
            </span>
            <input
              className="h-14 w-full rounded-none border border-slate-300 bg-white pl-8 pr-3 text-xl font-semibold tracking-tight text-slate-950 outline-none focus:border-slate-500 focus:ring-0"
              name="price"
              placeholder="25,000"
              type="number"
              min="1"
              step="0.01"
              required
            />
          </span>
          <span className="mt-2 block text-xs text-slate-500">
            Quote the complete price for the requested quantity.
          </span>
        </label>
      </div>
      <div className="border-b border-slate-200 py-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <Truck className="size-3.5 text-indigo-600" />
          Delivery commitment
        </div>
        <div className="mt-3">
          <Field
            label="Ready in"
            name="leadTimeDays"
            placeholder="14"
            type="number"
            min="1"
            suffix="days"
          />
        </div>
      </div>
      <div className="py-5">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
          <MessageSquareText className="size-3.5 text-indigo-600" />
          Offer notes
        </div>
        <label className="mt-3 block">
          <span className="sr-only">Message and notes</span>
          <textarea
            className="min-h-28 w-full resize-y rounded-none border border-slate-300 bg-white p-3 text-sm leading-6 outline-none focus:border-slate-500 focus:ring-0"
            name="notes"
            required
            minLength={5}
            placeholder="Include terms, inclusions, or clarifications…"
          />
        </label>
      </div>
      <div className="border-t border-slate-200 pt-4">
        <p className="mb-3 text-xs leading-5 text-slate-500">
          Your quote will be visible to the buyer alongside other supplier
          offers.
        </p>
        <SubmitButton />
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="flex h-11 w-full items-center justify-center gap-2 bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? "Sending quote..." : "Submit quotation"}
    </button>
  );
}
function Field({
  label,
  suffix,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  suffix?: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}
      <span className="relative mt-2 block">
        <input
          className="h-11 w-full rounded-none border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500 focus:ring-0"
          required
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-3 text-xs text-slate-400">
            {suffix}
          </span>
        )}
      </span>
    </label>
  );
}
