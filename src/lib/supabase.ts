import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url =
  process.env.SUPA_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.PROJECT_URL ||
  "";
const key =
  process.env.ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.PUBLISHABLE_KEY ||
  process.env.PUBLISHIBLE_KEY ||
  "";

export function isSupabaseConfigured() {
  return Boolean(url && key);
}

let client: SupabaseClient | null = null;

export function getSupabase() {
  if (!url || !key) {
    throw new Error("Supabase is not configured");
  }
  if (!client) {
    client = createClient(url, key);
  }
  return client;
}
