import { createClient } from "@supabase/supabase-js";

const RFQ_IMAGE_BUCKET = "rfq-images";

type ImageUploadResult = {
  url: string;
};

function getStorageConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    return null;
  }

  return { url, serviceRoleKey };
}

export async function uploadRfqImage(
  dataUrl: string,
  ownerId: string,
): Promise<ImageUploadResult> {
  const config = getStorageConfig();
  if (!config) {
    throw new Error("Supabase Storage is not configured.");
  }

  const [header, encodedImage] = dataUrl.split(",");
  const mimeType = header.match(
    /^data:(image\/(?:jpeg|png|webp));base64$/,
  )?.[1];
  const extension = mimeType === "image/jpeg" ? "jpg" : mimeType?.split("/")[1];

  if (!mimeType || !extension || !encodedImage) {
    throw new Error("Invalid image data.");
  }

  const supabase = createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage
    .from(RFQ_IMAGE_BUCKET)
    .upload(path, Buffer.from(encodedImage, "base64"), {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from(RFQ_IMAGE_BUCKET)
    .getPublicUrl(path);

  return { url: data.publicUrl };
}
