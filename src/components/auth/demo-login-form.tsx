"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DemoLoginForm() {
  const [role, setRole] = useState<"BUYER" | "SUPPLIER">("BUYER");
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
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1">
        {(["BUYER", "SUPPLIER"] as const).map((item) => (
          <button
            className={`rounded-md px-3 py-2 text-sm font-medium ${role === item ? "bg-white text-slate-950 shadow-sm" : "text-slate-500"}`}
            key={item}
            onClick={() => {
              setRole(item);
              setEmail(item === "BUYER" ? "buyer@merzado.demo" : "supplier@merzado.demo");
            }}
            type="button"
          >
            {item === "BUYER" ? "Buyer" : "Supplier"}
          </button>
        ))}
      </div>
      <label className="block space-y-1.5 text-sm font-medium text-slate-700">
        Work email
        <Input value={email} onChange={(event) => setEmail(event.target.value)} required type="email" />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button className="w-full" disabled={pending} type="submit">
        {pending ? "Signing in…" : `Continue as ${role === "BUYER" ? "buyer" : "supplier"}`}
      </Button>
    </form>
  );
}
