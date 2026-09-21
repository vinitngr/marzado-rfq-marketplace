"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { rfqs } from "@/db/schema";
import { quotations } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { and, eq } from "drizzle-orm";

const rfqSchema = z.object({
  title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(5000),
  quantity: z.coerce.number().int().positive(), unit: z.string().trim().min(1).max(30),
  deliveryLocation: z.string().trim().min(3).max(120), deadline: z.coerce.date().refine((date) => date > new Date(), "Choose a future deadline"),
});

export async function createRfq(formData: FormData) {
  const buyer = await requireUser("BUYER");
  const input = rfqSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) redirect("/buyer/new?error=invalid");
  await db.insert(rfqs).values({ ...input.data, buyerId: buyer.id });
  revalidatePath("/buyer");
  revalidatePath("/supplier");
  redirect("/buyer");
}

export async function awardQuote(formData: FormData) {
  const buyer = await requireUser("BUYER");
  const rfqId = String(formData.get("rfqId"));
  const quoteId = String(formData.get("quoteId"));
  const rfq = await db.query.rfqs.findFirst({ where: and(eq(rfqs.id, rfqId), eq(rfqs.buyerId, buyer.id), eq(rfqs.status, "OPEN")) });
  if (!rfq) redirect("/buyer");
  await db.transaction(async (tx) => {
    await tx.update(quotations).set({ status: "REJECTED" }).where(eq(quotations.rfqId, rfqId));
    await tx.update(quotations).set({ status: "ACCEPTED" }).where(and(eq(quotations.id, quoteId), eq(quotations.rfqId, rfqId)));
    await tx.update(rfqs).set({ status: "AWARDED" }).where(eq(rfqs.id, rfqId));
  });
  revalidatePath("/buyer"); revalidatePath(`/buyer/rfqs/${rfqId}`); redirect(`/buyer/rfqs/${rfqId}`);
}
