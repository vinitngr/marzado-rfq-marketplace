import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

type AppRole = "BUYER" | "SUPPLIER" | "ADMIN";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || "",
      clientSecret: process.env.AUTH_GITHUB_SECRET || "",
    }),

    Credentials({
      id: "demo-login",
      name: "Demo Account",
      credentials: {
        role: { label: "Role", type: "text" },
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.role) {
          return null;
        }

        const role = credentials.role as "BUYER" | "SUPPLIER";
        const email = credentials.email as string;
        const name = role === "BUYER" ? "Demo Buyer Company" : "Demo Supplier Corp";

        // Check if user exists in DB or create demo user
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, email),
          });

          if (existingUser) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              role,
              image: existingUser.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            };
          }

          // Create new user in Neon Postgres
          const [newUser] = await db
            .insert(users)
            .values({
              email,
              name,
              role,
              companyName: name,
              image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
            })
            .returning();

          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            image: newUser.image,
          };
        } catch (error) {
          console.error("Demo auth DB error, using fallback mock user:", error);
          return {
            id: role === "BUYER" ? "demo-buyer-id" : "demo-supplier-id",
            name,
            email,
            role,
            image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "github" && user.email) {
        try {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, user.email),
          });

          if (!existingUser) {
            await db.insert(users).values({
              email: user.email,
              name: user.name || "GitHub User",
              image: user.image,
            });
          }
        } catch (err) {
          console.error("Error creating user on GitHub sign-in:", err);
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.role = user.role || null;
      }

      // Handle session updates (e.g., when selecting a role during onboarding)
      const updatedRole = (session as { role?: AppRole } | undefined)?.role;
      if (trigger === "update" && updatedRole) {
        token.role = updatedRole;
      }

      // Sync role from DB if token role is missing
      if (token.email && !token.role) {
        try {
          const dbUser = await db.query.users.findFirst({
            where: eq(users.email, token.email as string),
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch {
          // DB sync error catch
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || "fallback-secret-for-development-min-32-chars-long",
});
