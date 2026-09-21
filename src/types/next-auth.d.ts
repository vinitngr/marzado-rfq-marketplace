import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "BUYER" | "SUPPLIER" | "ADMIN" | null;
    };
  }

  interface User {
    role?: "BUYER" | "SUPPLIER" | "ADMIN" | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "BUYER" | "SUPPLIER" | "ADMIN" | null;
  }
}
