"use client";

import * as React from "react";
import { BriefcaseBusiness, ShoppingBag } from "lucide-react";
import { DemoLoginForm } from "./demo-login-form";
import { GitHubLoginButton } from "./github-login-button";

export function LoginMethods({ githubEnabled }: { githubEnabled: boolean }) {
  const [role, setRole] = React.useState<"BUYER" | "SUPPLIER">("BUYER");

  return (
    <div>
      <div className="grid grid-cols-2 gap-px border border-slate-300 bg-slate-300 p-1">
        {(["BUYER", "SUPPLIER"] as const).map((item) => (
          <button
            className={`flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition ${role === item ? "bg-slate-950 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
            key={item}
            onClick={() => setRole(item)}
            type="button"
          >
            {item === "BUYER" ? (
              <ShoppingBag className="size-4" />
            ) : (
              <BriefcaseBusiness className="size-4" />
            )}
            {item === "BUYER" ? "Buyer" : "Supplier"}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <DemoLoginForm
          role={role}
          onRoleChange={setRole}
          showRoleSelector={false}
        />
      </div>
      {githubEnabled && (
        <>
          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            <span className="h-px flex-1 bg-slate-200" />
            or
            <span className="h-px flex-1 bg-slate-200" />
          </div>
          <GitHubLoginButton role={role} />
        </>
      )}
    </div>
  );
}
