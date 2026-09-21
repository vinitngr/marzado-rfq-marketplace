"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { quotations } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { and, count, eq, sql } from "drizzle-orm";
import { createClient } from "@supabase/supabase-js";

const rfqSchema = z.object({
  title: z.string().trim().min(3).max(120),
  categoryId: z.string().uuid(),
  description: z.string().trim().min(10).max(5000),
  quantity: z.coerce.number().int().positive(),
  unit: z.string().trim().min(1).max(30),
  deliveryLocation: z.string().trim().min(3).max(500),
  deliveryLatitude: z.coerce
    .number()
    .min(-90)
    .max(90)
    .optional()
    .or(z.literal("")),
  deliveryLongitude: z.coerce
    .number()
    .min(-180)
    .max(180)
    .optional()
    .or(z.literal("")),
  imageUrl: z
    .string()
    .regex(/^data:image\/(jpeg|png|webp);base64,/, "Choose a valid image")
    .max(800_000)
    .optional()
    .or(z.literal("")),
  deadline: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a deadline")
    .transform((value) => new Date(`${value}T23:59:59`))
    .refine((date) => date > new Date(), "Choose a future deadline"),
});

const MAX_RFQS_PER_BUYER = 10;

class RfqLimitError extends Error {}

export type CreateRfqState = {
  error?: string;
  success?: boolean;
  imageWarning?: string;
};

export async function createRfq(
  _previousState: CreateRfqState,
  formData: FormData,
): Promise<CreateRfqState> {
  const buyer = await requireUser("BUYER");
  const input = rfqSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    const issue = input.error.issues[0];
    return { error: `${String(issue.path[0] ?? "field")}: ${issue.message}` };
  }
  const [{ total }] = await db
    .select({ total: count() })
    .from(rfqs)
    .where(eq(rfqs.buyerId, buyer.id));
  if (total >= MAX_RFQS_PER_BUYER) {
    return {
      error: `You have reached the limit of ${MAX_RFQS_PER_BUYER} RFQs per account.`,
    };
  }
  let imageUrl = input.data.imageUrl || null;
  let imageWarning: string | undefined;
  if (imageUrl) {
    if (
      !(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL) ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      imageUrl = null;
      imageWarning = "Image storage is not configured.";
    }
  }
  if (imageUrl) {
    try {
      const [header, encodedImage] = imageUrl.split(",");
      const mimeType = header.match(/^data:(image\/(?:jpeg|png|webp));base64$/)?.[1];
      const extension = mimeType === "image/jpeg" ? "jpg" : mimeType?.split("/")[1];
      if (!mimeType || !extension || !encodedImage) {
        throw new Error("Invalid image data");
      }

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { auth: { persistSession: false, autoRefreshToken: false } },
      );
      const path = `${buyer.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("rfq-images")
        .upload(path, Buffer.from(encodedImage, "base64"), {
          contentType: mimeType,
          upsert: false,
        });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("rfq-images").getPublicUrl(path);
      imageUrl = data.publicUrl;
    } catch (error) {
      console.error("RFQ image upload failed:", error);
      imageUrl = null;
      imageWarning = "Supabase rejected the image upload.";
    }
  }
  const { deliveryLatitude, deliveryLongitude, ...rfqData } = input.data;
  try {
    await db.transaction(async (tx) => {
      await tx.execute(
        sql`select id from users where id = ${buyer.id} for update`,
      );
      const [{ total }] = await tx
        .select({ total: count() })
        .from(rfqs)
        .where(eq(rfqs.buyerId, buyer.id));
      if (total >= MAX_RFQS_PER_BUYER) {
        throw new RfqLimitError();
      }
      await tx.insert(rfqs).values({
        ...rfqData,
        deliveryLatitude:
          deliveryLatitude === "" ? null : String(deliveryLatitude),
        deliveryLongitude:
          deliveryLongitude === "" ? null : String(deliveryLongitude),
        imageUrl,
        buyerId: buyer.id,
      });
    });
  } catch (error) {
    if (error instanceof RfqLimitError) {
      return {
        error: `You have reached the limit of ${MAX_RFQS_PER_BUYER} RFQs per account.`,
      };
    }
    throw error;
  }
  revalidatePath("/buyer");
  revalidatePath("/supplier");
  return { success: true, imageWarning };
}

export async function deleteRfq(formData: FormData) {
  const buyer = await requireUser("BUYER");
  const rfqId = String(formData.get("rfqId"));
  await db
    .delete(rfqs)
    .where(
      and(
        eq(rfqs.id, rfqId),
        eq(rfqs.buyerId, buyer.id),
        eq(rfqs.status, "OPEN"),
      ),
    );
  revalidatePath("/buyer");
  redirect("/buyer");
}

export async function awardQuote(formData: FormData) {
  const buyer = await requireUser("BUYER");
  const rfqId = String(formData.get("rfqId"));
  const quoteId = String(formData.get("quoteId"));
  const rfq = await db.query.rfqs.findFirst({
    where: and(
      eq(rfqs.id, rfqId),
      eq(rfqs.buyerId, buyer.id),
      eq(rfqs.status, "OPEN"),
    ),
  });
  if (!rfq) redirect("/buyer");
  await db.transaction(async (tx) => {
    await tx
      .update(quotations)
      .set({ status: "REJECTED" })
      .where(eq(quotations.rfqId, rfqId));
    await tx
      .update(quotations)
      .set({ status: "ACCEPTED" })
      .where(and(eq(quotations.id, quoteId), eq(quotations.rfqId, rfqId)));
    await tx.update(rfqs).set({ status: "AWARDED" }).where(eq(rfqs.id, rfqId));
  });
  revalidatePath("/buyer");
  revalidatePath(`/buyer/rfqs/${rfqId}`);
  redirect(`/buyer/rfqs/${rfqId}`);
}
