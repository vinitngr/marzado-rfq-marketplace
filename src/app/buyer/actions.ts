"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { and, eq } from "drizzle-orm";
import {
  MAX_RFQS_PER_BUYER,
  awardRfqQuote,
  countBuyerRfqs,
  insertRfqWithLimit,
  RfqLimitError,
} from "@/db/queries/rfqs";
import { uploadRfqImage } from "@/lib/storage";
import { rfqSchema } from "./rfq-validation";

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
  if ((await countBuyerRfqs(buyer.id)) >= MAX_RFQS_PER_BUYER) {
    return { error: new RfqLimitError().message };
  }

  let imageUrl = input.data.imageUrl || null;
  let imageWarning: string | undefined;

  if (imageUrl) {
    try {
      imageUrl = (await uploadRfqImage(imageUrl, buyer.id)).url;
    } catch (error) {
      console.error("RFQ image upload failed:", error);
      imageUrl = null;
      imageWarning =
        error instanceof Error &&
        error.message === "Supabase Storage is not configured."
          ? "Image storage is not configured."
          : "Supabase rejected the image upload.";
    }
  }

  const { deliveryLatitude, deliveryLongitude, ...rfqData } = input.data;
  try {
    await insertRfqWithLimit(buyer.id, {
      ...rfqData,
      deliveryLatitude:
        deliveryLatitude === "" ? null : String(deliveryLatitude),
      deliveryLongitude:
        deliveryLongitude === "" ? null : String(deliveryLongitude),
      imageUrl,
    });
  } catch (error) {
    if (error instanceof RfqLimitError) {
      return { error: error.message };
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
  await awardRfqQuote(rfqId, quoteId);
  revalidatePath("/buyer");
  revalidatePath(`/buyer/rfqs/${rfqId}`);
  redirect(`/buyer/rfqs/${rfqId}`);
}
