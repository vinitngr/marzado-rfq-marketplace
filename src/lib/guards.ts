import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function requireUser(role?: "BUYER" | "SUPPLIER") {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  
  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect(`/onboarding?role=${role}`);
  return user;
}
