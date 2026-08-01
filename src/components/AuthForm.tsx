"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowUpRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/Button";

export default function AuthForm({ kind }: { kind: "login" | "register" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", password: "" });

  const fields: Array<keyof typeof form> =
    kind === "register" ? ["name", "phone", "password"] : ["phone", "password"];

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/auth/${kind}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data?.ok && data?.redirect) {
        router.push(data.redirect);
        router.refresh();
      } else {
        setError(data?.error || "Something went wrong");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const labels: Record<keyof typeof form, string> = {
    name: "Full name",
    phone: "Phone (e.g. 0240000000)",
    password: "Password",
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <p className="eyebrow">FreshCrate member access</p>
        <h1 className="mt-3 font-display text-4xl font-semibold tracking-[-0.04em] text-primary-deep">
          {kind === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-3 max-w-sm text-sm leading-6 text-muted">
          {kind === "login" ? "Pick up where your weekly fresh-food ritual left off." : "Save your address, choose a crate, and make next week easier."}
        </p>
      </div>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
      <div className="space-y-4">
        {fields.map((field) => {
          const inputId = `auth-${field}`;
          return (
            <div key={field}>
              <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-ink">{labels[field]}</label>
              <input
                id={inputId}
                name={field}
                type={field === "password" ? "password" : field === "phone" ? "tel" : "text"}
                autoComplete={field === "password" ? "current-password" : field === "phone" ? "tel" : "name"}
                required
                value={form[field]}
                onChange={(e) => set(field, e.target.value)}
                className="input"
              />
            </div>
          );
        })}
      </div>
      <div className="space-y-3">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Please wait…" : kind === "login" ? "Log in" : "Create account"}
          <ArrowUpRightIcon className="ml-2 size-4" aria-hidden="true" />
        </Button>
        <div className="flex items-center justify-center gap-2 text-xs text-muted">
          <LockClosedIcon className="size-3.5" aria-hidden="true" /> Secure access for your FreshCrate account
        </div>
      </div>
      <p className="text-center text-sm text-muted">
        {kind === "login" ? "No account? " : "Already have an account? "}
        <Link href={kind === "login" ? "/register" : "/login"} className="font-semibold text-primary transition-colors hover:text-primary-deep">
          {kind === "login" ? "Sign up" : "Log in"}
        </Link>
      </p>
    </form>
  );
}
