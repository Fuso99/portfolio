"use client";

import { Lock, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/primitives";
import { inputClass } from "./fields";

export function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }).catch(() => null);
    if (res?.ok) {
      router.replace("/admin");
      router.refresh();
      return;
    }
    const data = await res?.json().catch(() => null);
    setError(data?.error ?? "Il server non risponde. Riprova.");
    setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="glass w-full max-w-sm rounded-2xl p-7 shadow-[0_30px_80px_-30px_rgb(91_86_232/0.55)]">
      <div className="grid size-11 place-items-center rounded-xl bg-ion/15 text-ion">
        <Lock className="size-5" aria-hidden />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Backoffice</h1>
      <p className="mt-1 text-sm text-muted">Inserisci la password per modificare il portfolio.</p>
      <label htmlFor="password" className="mt-6 mb-1.5 block text-[13px] text-muted">
        Password
      </label>
      <input
        id="password"
        type="password"
        autoComplete="current-password"
        autoFocus
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? "login-error" : undefined}
        className={inputClass + " h-11"}
      />
      {error ? (
        <p id="login-error" role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" className="mt-6 w-full" disabled={busy || !password}>
        {busy ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
        Accedi
      </Button>
    </form>
  );
}
