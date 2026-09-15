import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import SetupNotice from "@/components/SetupNotice";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Pieteikties" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (!supabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/");

  const { error } = await searchParams;

  return (
    <main className="safe-x mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-7 flex flex-col items-center text-center">
        <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-[var(--accent)] text-[var(--accent-contrast)] shadow-[var(--shadow-md)]">
          <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
            <path
              d="M4 7.5l2 2 3.5-3.5M4 16.5l2 2 3.5-3.5M13.5 8h6.5M13.5 16h6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-[22px] font-semibold tracking-tight">Saraksts</h1>
        <p className="mt-1 text-[14px] text-muted">
          Uzdevumi ar kategorijām un termiņiem.
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="mb-3 rounded-xl bg-[color-mix(in_oklab,var(--danger)_12%,transparent)] px-3 py-2.5 text-center text-[13px] text-[var(--danger)]"
        >
          {error}
        </p>
      ) : null}

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
        <LoginForm />
      </div>

      <p className="mt-5 text-center text-[12.5px] leading-relaxed text-faint">
        Dati glabājas tavā Supabase datubāzē. Katrs lietotājs redz tikai savus
        uzdevumus.
      </p>
    </main>
  );
}
