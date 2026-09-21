"use client";

import { signIn } from "next-auth/react";

export function GitHubLoginButton() {
  return (
    <button
      className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      onClick={() => signIn("github", { callbackUrl: "/onboarding" })}
      type="button"
    >
      Continue with GitHub
    </button>
  );
}
