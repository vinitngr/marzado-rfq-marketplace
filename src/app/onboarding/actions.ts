"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

const schema = z.object({ role: z.enum(["BUYER", "SUPPLIER"]) });

export async function chooseRole(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const parsed = schema.safeParse({ role: formData.get("role") });
  if (!parsed.success) redirect("/onboarding?error=role");

  await db
    .update(users)
    .set({ role: parsed.data.role })
    .where(eq(users.id, session.user.id));
  redirect(parsed.data.role === "BUYER" ? "/buyer" : "/supplier");
}
