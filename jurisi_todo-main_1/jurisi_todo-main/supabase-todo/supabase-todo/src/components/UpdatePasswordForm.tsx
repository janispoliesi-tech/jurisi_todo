"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary } from "./ui";
import { cn } from "@/lib/utils";

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [repeat, setRepeat] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Parolei jābūt vismaz 6 rakstzīmes garai.");
      return;
    }
    if (password !== repeat) {
      setError("Paroles nesakrīt.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
        return;
      }
      setDone(true);
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 900);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-xl bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] px-3 py-2.5 text-center text-[13px] text-[var(--accent)]">
        Parole nomainīta. Atveram sarakstu…
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div>
        <label
          htmlFor="new-password"
          className="mb-1 block text-[13px] font-medium text-muted"
        >
          Jaunā parole
        </label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          className="field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Vismaz 6 rakstzīmes"
        />
      </div>

      <div>
        <label
          htmlFor="repeat-password"
          className="mb-1 block text-[13px] font-medium text-muted"
        >
          Atkārto paroli
        </label>
        <input
          id="repeat-password"
          type="password"
          autoComplete="new-password"
          className="field"
          value={repeat}
          onChange={(e) => setRepeat(e.target.value)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2.5 text-[13px] text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={cn(btnPrimary, "w-full")}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        Saglabāt paroli
      </button>
    </form>
  );
}
