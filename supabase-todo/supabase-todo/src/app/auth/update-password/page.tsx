import type { Metadata } from "next";
import Link from "next/link";
import UpdatePasswordForm from "@/components/UpdatePasswordForm";
import SetupNotice from "@/components/SetupNotice";
import { supabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Jauna parole" };
export const dynamic = "force-dynamic";

export default async function UpdatePasswordPage() {
  if (!supabaseConfigured) return <SetupNotice />;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="safe-x mx-auto flex min-h-dvh w-full max-w-sm flex-col justify-center px-5 py-10">
      <h1 className="mb-1 text-[20px] font-semibold tracking-tight">
        Jauna parole
      </h1>
      <p className="mb-5 text-[14px] text-muted">
        Ievadi jauno paroli savam kontam.
      </p>

      <div className="rounded-2xl border border-line bg-surface p-5 shadow-[var(--shadow-sm)]">
        {user ? (
          <UpdatePasswordForm />
        ) : (
          <div className="space-y-3 text-center">
            <p className="text-[14px] text-muted">
              Saite nav derīga vai tai beidzies termiņš.
            </p>
            <Link
              href="/login"
              className="inline-block text-[13.5px] text-[var(--accent)] underline-offset-4 hover:underline"
            >
              Atgriezties uz pieteikšanos
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
