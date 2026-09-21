"use client";

import * as React from "react";
import { ImagePlus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_SOURCE_BYTES = 5 * 1024 * 1024;
const MAX_STORED_BYTES = 600 * 1024;

function compressImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not process this image."));
      image.onload = () => {
        const maxDimension = Math.max(image.naturalWidth, image.naturalHeight);
        const scale = Math.min(1, 1000 / maxDimension);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        canvas
          .getContext("2d")
          ?.drawImage(image, 0, 0, canvas.width, canvas.height);
        const qualities = [0.76, 0.62, 0.5];
        const compressed = qualities
          .map((quality) => canvas.toDataURL("image/webp", quality))
          .find((value) => value.length <= MAX_STORED_BYTES);
        if (!compressed)
          reject(
            new Error(
              "This image is too detailed. Choose a smaller image under 5 MB.",
            ),
          );
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
  const [processing, setProcessing] = React.useState(false);

  async function handleImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_SOURCE_BYTES) {
      setError("Choose an image under 5 MB.");
      event.target.value = "";
      return;
    }
    setProcessing(true);
    setError("");
    try {
      setPreview(await compressImage(file));
    } catch (compressionError) {
      setPreview("");
      setError(
        compressionError instanceof Error
          ? compressionError.message
          : "Choose a smaller image.",
      );
      event.target.value = "";
    } finally {
      setProcessing(false);
    }
  }

  function clearImage() {
    setPreview("");
    setError("");
    const input = document.getElementById(
      "rfq-image",
    ) as HTMLInputElement | null;
    if (input) input.value = "";
  }

  return (
    <div className="rounded-none border border-dashed border-slate-300 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
          <ImagePlus className="size-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">
            Add a reference image{" "}
            <span className="font-normal text-slate-400">(optional)</span>
          </p>
          <p className="mt-1 text-xs text-slate-500">
            JPG, PNG, or WebP. Images are resized to 1000px and must be under
            600 KB after compression.
          </p>
        </div>
      </div>
      {processing && (
        <div className="mt-4 border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
          Preparing image for upload...
        </div>
      )}
      {!processing && preview ? (
        <div className="relative mt-4 overflow-hidden rounded-lg border border-emerald-200 bg-white">
          <img
            className="max-h-64 w-full object-contain"
            src={preview}
            alt="RFQ reference preview"
          />
          <div className="border-t border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            Image ready · {Math.round((preview.length * 0.75) / 1024)} KB
            compressed
          </div>
          <Button
            className="absolute right-2 top-2 bg-white/95 shadow-sm hover:bg-white"
            type="button"
            variant="outline"
            size="icon"
            onClick={clearImage}
            aria-label="Remove reference image"
          >
            <Trash2 className="size-4 text-red-600" />
          </Button>
        </div>
      ) : (
        !processing && (
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50">
            <Upload className="size-4 text-slate-700" />
            Choose image
            <input
              className="sr-only"
              id="rfq-image"
              type="file"
              accept="image/*"
              onChange={handleImage}
            />
          </label>
        )
      )}
      {preview && (
        <input name="imageUrl" type="hidden" value={preview} readOnly />
      )}
      {error && (
        <p className="mt-2 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
