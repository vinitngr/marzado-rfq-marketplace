import { and, count, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { quotations, rfqs } from "@/db/schema";

export const MAX_RFQS_PER_BUYER = 10;

export class RfqLimitError extends Error {
  constructor() {
    super(`You have reached the limit of ${MAX_RFQS_PER_BUYER} RFQs per account.`);
    this.name = "RfqLimitError";
  }
}

export async function countBuyerRfqs(buyerId: string) {
  const [{ total }] = await db
    .select({ total: count() })
    .from(rfqs)
    .where(eq(rfqs.buyerId, buyerId));

  return total;
}

export async function insertRfqWithLimit(
  buyerId: string,
  values: Omit<typeof rfqs.$inferInsert, "buyerId">,
) {
  await db.transaction(async (tx) => {
    await tx.execute(
      sql`select id from users where id = ${buyerId} for update`,
    );

    const [{ total }] = await tx
      .select({ total: count() })
      .from(rfqs)
      .where(eq(rfqs.buyerId, buyerId));

    if (total >= MAX_RFQS_PER_BUYER) {
      throw new RfqLimitError();
    }

    await tx.insert(rfqs).values({
      ...values,
      buyerId,
    });
  });
}

export async function awardRfqQuote(rfqId: string, quoteId: string) {
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
}
