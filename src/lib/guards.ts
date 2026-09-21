import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { users } from "@/db/schema";

export async function requireUser(role?: "BUYER" | "SUPPLIER") {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (role && session.user.role !== role) redirect(session.user.role === "SUPPLIER" ? "/supplier" : "/buyer");
  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user) redirect("/login");
  return user;
}
