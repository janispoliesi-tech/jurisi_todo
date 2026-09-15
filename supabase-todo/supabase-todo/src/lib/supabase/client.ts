"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/types";
import { SUPABASE_ANON_KEY, SUPABASE_URL, assertSupabaseEnv } from "./env";

let cached: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createClient() {
  assertSupabaseEnv();
  if (!cached) {
    cached = createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return cached;
}
