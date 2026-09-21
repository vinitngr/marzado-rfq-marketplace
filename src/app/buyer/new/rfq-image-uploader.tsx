"use client";

import * as React from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

export function RfqImageUploader() {
  const [preview, setPreview] = React.useState("");
  const [error, setError] = React.useState("");

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_IMAGE_BYTES) {
      setError("Choose an image under 2 MB.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(file);
    setError("");
  }

  function clearImage() {
    setPreview("");
    setError("");
    const input = document.getElementById("rfq-image") as HTMLInputElement | null;
    if (input) input.value = "";
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm"><ImagePlus className="size-4" /></span>
        <div><p className="text-sm font-semibold text-slate-800">Add a reference image <span className="font-normal text-slate-400">(optional)</span></p><p className="mt-1 text-xs text-slate-500">Show suppliers the product, finish, or packaging you have in mind.</p></div>
      </div>
      {preview ? <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white"><img className="max-h-64 w-full object-contain" src={preview} alt="RFQ reference preview" /><Button className="absolute right-2 top-2 bg-white/95 shadow-sm hover:bg-white" type="button" variant="outline" size="icon" onClick={clearImage} aria-label="Remove reference image"><Trash2 className="size-4 text-red-600" /></Button></div> : <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"><Upload className="size-4 text-emerald-700" />Choose image<input className="sr-only" id="rfq-image" type="file" accept="image/*" onChange={handleImage} /></label>}
      {preview && <input name="imageUrl" type="hidden" value={preview} readOnly />}
      {error && <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
