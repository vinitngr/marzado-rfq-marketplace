"use client";

import { signIn } from "next-auth/react";
import { GitBranch } from "lucide-react";

export function GitHubLoginButton({ role }: { role: "BUYER" | "SUPPLIER" }) {
  return (
    <button
      className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-none border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
      onClick={() =>
        signIn("github", { callbackUrl: `/onboarding?role=${role}` })
      }
      type="button"
    >
      <GitBranch className="size-4" /> Continue as{" "}
      {role === "BUYER" ? "buyer" : "supplier"} with GitHub
    </button>
  );
}
