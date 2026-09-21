"use client";

import * as React from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const MAX_STORED_BYTES = 900 * 1024;

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not process this image."));
      image.onload = () => {
        const scale = Math.min(1, 1200 / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/webp", 0.82);
        if (compressed.length > MAX_STORED_BYTES) reject(new Error("This image is still too large after compression."));
        else resolve(compressed);
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function RfqImageUploader() {
  const [preview, setPreview] = React.useState("");
  const [error, setError] = React.useState("");

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_SOURCE_BYTES) {
      setError("Choose an image under 5 MB.");
      event.target.value = "";
      return;
    }
    try {
      setPreview(await compressImage(file));
      setError("");
    } catch (compressionError) {
      setPreview("");
      setError(compressionError instanceof Error ? compressionError.message : "Choose a smaller image.");
      event.target.value = "";
    }
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
        <div><p className="text-sm font-semibold text-slate-800">Add a reference image <span className="font-normal text-slate-400">(optional)</span></p><p className="mt-1 text-xs text-slate-500">JPG, PNG, or WebP. We resize it to 1200px and keep the stored image under 900 KB.</p></div>
      </div>
      {preview ? <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white"><img className="max-h-64 w-full object-contain" src={preview} alt="RFQ reference preview" /><Button className="absolute right-2 top-2 bg-white/95 shadow-sm hover:bg-white" type="button" variant="outline" size="icon" onClick={clearImage} aria-label="Remove reference image"><Trash2 className="size-4 text-red-600" /></Button></div> : <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50"><Upload className="size-4 text-emerald-700" />Choose image<input className="sr-only" id="rfq-image" type="file" accept="image/*" onChange={handleImage} /></label>}
      {preview && <input name="imageUrl" type="hidden" value={preview} readOnly />}
      {error && <p className="mt-2 text-xs text-red-600" role="alert">{error}</p>}
    </div>
  );
}
