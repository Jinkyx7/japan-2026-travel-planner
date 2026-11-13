import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

// No local fallback for private records: missing configuration must fail closed.
export const supabase =
  url && key
    ? createClient<Database>(url, key, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: false,
        },
      })
    : null;

export function requireSupabase() {
  if (!supabase) throw new Error("Shared ledger is not configured.");
  return supabase;
}

export function createPasswordVerifier() {
  if (!url || !key) throw new Error("Shared ledger is not configured.");
  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      storageKey: `japan2026:password-check:${crypto.randomUUID()}`,
    },
  });
}
