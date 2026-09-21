"use client";

import * as React from "react";
import { BriefcaseBusiness, ShoppingBag } from "lucide-react";
import { DemoLoginForm } from "./demo-login-form";
import { GitHubLoginButton } from "./github-login-button";

export function LoginMethods({
  githubEnabled,
  initialRole,
}: {
  githubEnabled: boolean;
  initialRole?: "BUYER" | "SUPPLIER";
}) {
  const [role, setRole] = React.useState<"BUYER" | "SUPPLIER">(
    initialRole ?? "BUYER",
  );

  React.useEffect(() => {
    if (initialRole) setRole(initialRole);
  }, [initialRole]);

  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {(["BUYER", "SUPPLIER"] as const).map((item) => (
          <button
            className={`flex items-center justify-center gap-2 border px-3 py-3 text-sm font-medium transition ${role === item ? (item === "BUYER" ? "border-[#cdd9ef] bg-[#e9f0ff] text-[#315fae]" : "border-[#f0d8b9] bg-[#fff0dc] text-[#a66320]") : "border-[#dfe3e8] bg-white text-[#77818d] hover:border-[#cfd6df]"}`}
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
          <div className="my-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9ba4af]">
            <span className="h-px flex-1 bg-[#dfe3e8]" />
            or
            <span className="h-px flex-1 bg-[#dfe3e8]" />
          </div>
          <GitHubLoginButton role={role} />
        </>
      )}
    </div>
  );
}
