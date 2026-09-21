import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl && process.env.NODE_ENV === "production") {
  console.warn("DATABASE_URL is not set in environment variables.");
}

const sql = postgres(
  databaseUrl || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
  {
    // Supabase's transaction pooler does not support prepared statements.
    prepare: false,
    max: 1,
  },
);

export const db = drizzle(sql, { schema });
