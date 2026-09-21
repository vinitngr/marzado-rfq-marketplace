"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import { quotations, rfqs } from "@/db/schema";
import { requireUser } from "@/lib/guards";
import { and, eq } from "drizzle-orm";

const quoteSchema = z.object({
  rfqId: z.string().uuid(),
  price: z.coerce.number().positive(),
  leadTimeDays: z.coerce.number().int().positive(),
  notes: z.string().trim().min(5).max(3000),
});

export async function submitQuote(formData: FormData) {
  const supplier = await requireUser("SUPPLIER");
  const input = quoteSchema.safeParse(Object.fromEntries(formData));
  if (!input.success) {
    redirect(`/supplier/rfqs/${formData.get("rfqId")}?error=invalid`);
  }

  const rfq = await db.query.rfqs.findFirst({
    where: and(eq(rfqs.id, input.data.rfqId), eq(rfqs.status, "OPEN")),
  });

  if (!rfq) redirect("/supplier?error=unavailable");

  await db
    .insert(quotations)
    .values({
      ...input.data,
      price: String(input.data.price),
      supplierId: supplier.id,
    })
    .onConflictDoNothing();
  revalidatePath("/supplier");
  revalidatePath(`/supplier/rfqs/${input.data.rfqId}`);
  redirect("/supplier?success=quote");
}
