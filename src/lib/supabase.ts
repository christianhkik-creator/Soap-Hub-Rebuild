import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Single-tenant client (no auth) — every row is readable/writable by anyone
 * holding the anon key, by design (see supabase/schema.sql). `isSupabaseConfigured`
 * lets the UI fall back gracefully (e.g. local-only mode) before a real
 * Supabase project is wired up.
 */
export const supabase = isSupabaseConfigured ? createClient(url!, anonKey!) : null;
