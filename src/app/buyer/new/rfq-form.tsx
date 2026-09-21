"use client";

import * as React from "react";

import Link from "next/link";

import { ArrowLeft, FileText, Package, Send } from "lucide-react";

import { createRfq } from "../actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { LocationPicker } from "./location-picker";
import { RfqDatePicker } from "./rfq-date-picker";
import { RfqImageUploader } from "./rfq-image-uploader";

type NewRfqFormProps = {
  error?: string;
};

export function NewRfqForm({ error }: NewRfqFormProps) {
  const errorMessage =
    error === "image-config"
      ? "Image storage is not configured yet. Remove the image or add the Cloudinary values to .env.local."
      : error === "image-upload"
        ? "We could not upload that image. Please try again or continue without it."
        : "Please check the required fields and choose a future deadline.";

  return (
    <>
      <Link
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
        href="/buyer"
      >
        <ArrowLeft className="size-4" />
        Back to RFQs
      </Link>

      <div className="mt-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          New sourcing request
        </p>

        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950">
          Tell suppliers what you need.
        </h1>

        <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
          Add the essentials and a precise drop-off point so the right
          suppliers can respond with confidence.
        </p>
      </div>

      {error && (
        <p className="mt-6 rounded-none border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {errorMessage}
        </p>
      )}

      <form
        action={createRfq}
        className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]"
      >
        <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-none bg-emerald-50 text-emerald-700">
              <Package className="size-5" />
            </span>

            <div>
              <h2 className="font-semibold text-slate-950">
                What are you sourcing?
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                A clear brief helps suppliers quote accurately.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Field
              label="Product or service name"
              name="title"
              placeholder="e.g. Custom corrugated boxes"
            />

            <label className="block text-sm font-medium text-slate-800">
              Requirement description

              <textarea
                className="mt-2 min-h-32 w-full resize-y rounded-none border border-slate-300 bg-white p-3 text-sm shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-0"
                name="description"
                required
                minLength={10}
                placeholder="Include dimensions, material, quality requirements…"
              />
            </label>

            <div className="grid items-start gap-5 sm:grid-cols-2">
              <Field
                label="Quantity"
                name="quantity"
                type="number"
                min="1"
                placeholder="500"
              />

              <Field
                label="Unit"
                name="unit"
                placeholder="pieces"
                defaultValue="units"
              />
            </div>

            <RfqImageUploader />

            <LocationPicker />
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-none bg-sky-50 text-sky-700">
                <FileText className="size-5" />
              </span>

              <div>
                <h2 className="font-semibold text-slate-950">
                  Response deadline
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  When should quotes close?
                </p>
              </div>
            </div>

            <RfqDatePicker />
          </section>

          <Button
            className="h-12 w-full rounded-none bg-slate-950 text-base text-white hover:bg-slate-800 hover:text-white focus-visible:border-slate-950 focus-visible:ring-0"
            type="submit"
          >
            <Send className="size-4" />
            Publish RFQ
          </Button>

        </aside>
      </form>
    </>
  );
}

function Field({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
}) {
  return (
    <label className="block text-sm font-medium text-slate-800">
      {label}

      <Input
        className="mt-2 rounded-none border-slate-300 bg-white focus-visible:border-slate-400 focus-visible:ring-0"
        required
        {...props}
      />
    </label>
  );
}