"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { BriefcaseBusiness, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DemoLoginForm({
  role,
  onRoleChange,
  showRoleSelector = true,
}: {
  role: "BUYER" | "SUPPLIER";
  onRoleChange: (role: "BUYER" | "SUPPLIER") => void;
  showRoleSelector?: boolean;
}) {
  const [email, setEmail] = useState("buyer@merzado.demo");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const callbackUrl = role === "BUYER" ? "/buyer" : "/supplier";
    const result = await signIn("demo-login", {
      email,
      role,
      redirect: false,
      callbackUrl,
    });
    setPending(false);
    if (!result?.ok) {
      setError("We couldn't sign you in. Please try again.");
      return;
    }
    window.location.assign(callbackUrl);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {showRoleSelector && (
        <div className="grid grid-cols-2 gap-px border border-slate-300 bg-slate-300 p-1">
          {(["BUYER", "SUPPLIER"] as const).map((item) => (
            <button
              className={`flex items-center justify-center gap-2 px-3 py-3 text-sm font-medium transition ${role === item ? "bg-slate-950 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
              key={item}
              onClick={() => {
                onRoleChange(item);
                setEmail(
                  item === "BUYER"
                    ? "buyer@merzado.demo"
                    : "supplier@merzado.demo",
                );
              }}
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
      )}
      <label className="block space-y-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
        Work email
        <Input
          className="h-11 rounded-none border-slate-300 bg-white text-sm font-normal normal-case tracking-normal focus-visible:border-slate-500 focus-visible:ring-0"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button
        className="h-11 w-full rounded-none bg-slate-950 text-white hover:bg-slate-800"
        disabled={pending}
        type="submit"
      >
        {pending
          ? "Signing in…"
          : `Continue as ${role === "BUYER" ? "buyer" : "supplier"}`}
      </Button>
    </form>
  );
}
