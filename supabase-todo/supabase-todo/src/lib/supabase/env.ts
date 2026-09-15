/**
 * Vercel ↔ Supabase integrācija atkarībā no versijas ieliek atslēgu zem
 * dažādiem nosaukumiem. Katru mainīgo nolasām statiski, lai Next.js to
 * varētu iebūvēt klienta paketē.
 */
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY ??
  "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export function assertSupabaseEnv() {
  if (!supabaseConfigured) {
    throw new Error(
      "Trūkst Supabase vides mainīgo. Iestati NEXT_PUBLIC_SUPABASE_URL un " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY (Vercel → Settings → Environment Variables).",
    );
  }
}
