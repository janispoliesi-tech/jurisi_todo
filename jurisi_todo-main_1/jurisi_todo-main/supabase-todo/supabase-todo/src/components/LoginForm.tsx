"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { btnPrimary } from "./ui";
import { cn } from "@/lib/utils";

type Mode = "signin" | "signup";

function translateError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "Nepareizs e-pasts vai parole.";
  if (m.includes("email not confirmed"))
    return "E-pasts vēl nav apstiprināts. Pārbaudi pastkasti.";
  if (m.includes("user already registered"))
    return "Šāds e-pasts jau ir reģistrēts. Pieteikties var zemāk.";
  if (m.includes("password should be at least"))
    return "Parolei jābūt vismaz 6 rakstzīmes garai.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Pārāk daudz mēģinājumu. Pamēģini pēc brīža.";
  if (m.includes("unable to validate email") || m.includes("invalid email"))
    return "Nederīga e-pasta adrese.";
  return message;
}

export default function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const mail = email.trim();
    if (!mail || !password) {
      setError("Aizpildi abus laukus.");
      return;
    }
    if (mode === "signup" && password.length < 6) {
      setError("Parolei jābūt vismaz 6 rakstzīmes garai.");
      return;
    }

    setBusy(true);
    try {
      const supabase = createClient();

      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: mail,
          password,
        });
        if (error) {
          setError(translateError(error.message));
          return;
        }
        router.replace("/");
        router.refresh();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: mail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setError(translateError(error.message));
        return;
      }
      if (data.session) {
        router.replace("/");
        router.refresh();
        return;
      }
      setInfo(
        "Konts izveidots. Uz norādīto e-pastu nosūtīta apstiprinājuma saite — atver to un vari sākt lietot.",
      );
      setPassword("");
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword() {
    const mail = email.trim();
    setError(null);
    setInfo(null);
    if (!mail) {
      setError("Vispirms ievadi savu e-pasta adresi.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(mail, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      });
      if (error) {
        setError(translateError(error.message));
        return;
      }
      setInfo("Nosūtījām paroles atjaunošanas saiti uz tavu e-pastu.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <div
        role="tablist"
        aria-label="Pieteikšanās veids"
        className="flex gap-0.5 rounded-xl border border-line bg-surface-2 p-0.5"
      >
        {(
          [
            ["signin", "Pieteikties"],
            ["signup", "Reģistrēties"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value);
              setError(null);
              setInfo(null);
            }}
            className={cn(
              "min-h-9 flex-1 rounded-[10px] text-[13.5px] font-medium transition",
              mode === value
                ? "bg-surface text-ink shadow-[var(--shadow-sm)]"
                : "text-muted hover:text-ink",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1 block text-[13px] font-medium text-muted"
        >
          E-pasts
        </label>
        <input
          id="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          className="field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vards@piemers.lv"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-1 block text-[13px] font-medium text-muted"
        >
          Parole
        </label>
        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="field !pr-11"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "signup" ? "Vismaz 6 rakstzīmes" : "••••••••"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Slēpt paroli" : "Rādīt paroli"}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted transition hover:text-ink"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2.5 text-[13px] text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      {info ? (
        <p className="rounded-xl bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] px-3 py-2.5 text-[13px] text-[var(--accent)]">
          {info}
        </p>
      ) : null}

      <button type="submit" disabled={busy} className={cn(btnPrimary, "w-full")}>
        {busy ? <Loader2 size={16} className="animate-spin" /> : null}
        {mode === "signin" ? "Pieteikties" : "Izveidot kontu"}
      </button>

      {mode === "signin" ? (
        <button
          type="button"
          onClick={resetPassword}
          disabled={busy}
          className="mx-auto block text-[13px] text-muted underline-offset-4 transition hover:text-ink hover:underline"
        >
          Aizmirsi paroli?
        </button>
      ) : null}
    </form>
  );
}
