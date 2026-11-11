import { readFileSync } from "node:fs";
import path from "node:path";
import postgres from "postgres";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  adminTable,
  insertPayload,
  recordFromDb,
  updatePayload,
  type AdminRecord,
  type AdminSection,
} from "@/lib/adminCrm";

function supabaseUrl() {
  return (
    process.env.SUPA_URL ||
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.PROJECT_URL ||
    ""
  ).trim();
}

function supabaseKey() {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SERVICE_ROLE_KEY ||
    process.env.ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.PUBLISHABLE_KEY ||
    process.env.PUBLISHIBLE_KEY ||
    ""
  ).trim();
}

export function isAdminDbConfigured() {
  return Boolean(supabaseUrl() && supabaseKey());
}

let client: SupabaseClient | null = null;

function db() {
  if (!isAdminDbConfigured()) {
    throw new Error("Supabase is not configured");
  }
  if (!client) {
    client = createClient(supabaseUrl(), supabaseKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function explainDbError(error: unknown, section: AdminSection) {
  const raw =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "";
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";
  const table = adminTable(section);
  if (code === "PGRST205" || /does not exist|schema cache|could not find the table/i.test(raw)) {
    return `Supabase is missing the table ${table}. In the SQL editor, run supabase/schema.sql, then save again.`;
  }
  if (code === "42501" || /row-level security|permission denied/i.test(raw)) {
    return `Supabase blocked the write to ${table}. Run supabase/schema.sql in the SQL editor, or set SUPABASE_SERVICE_ROLE_KEY on Vercel.`;
  }
  if (/invalid api key|jwt|apikey/i.test(raw)) {
    return "The Supabase key on Vercel was rejected. Set SUPABASE_SERVICE_ROLE_KEY, or ANON_KEY together with SUPA_URL, then redeploy.";
  }
  return raw || "Could not save";
}

function databaseUrl() {
  return (
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_DB_URL ||
    process.env.POSTGRES_URL ||
    ""
  ).trim();
}

function errorParts(error: unknown) {
  const raw =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String((error as { message?: unknown }).message || "")
        : "";
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code || "")
      : "";
  return { raw, code };
}

function needsSchema(error: unknown) {
  if (error instanceof Error && error.name === "SchemaNeeded") return true;
  const { raw, code } = errorParts(error);
  return (
    code === "PGRST205" ||
    code === "42501" ||
    /does not exist|schema cache|could not find the table|row-level security|permission denied/i.test(raw)
  );
}

let ensuring: Promise<boolean> | null = null;

function ensureAdminSchema() {
  const url = databaseUrl();
  if (!url) return Promise.resolve(false);
  if (!ensuring) {
    ensuring = applyAdminSchema(url).catch((error) => {
      ensuring = null;
      throw error;
    });
  }
  return ensuring;
}

async function applyAdminSchema(url: string) {
  const schema = readFileSync(path.join(process.cwd(), "supabase/schema.sql"), "utf8");
  const sql = postgres(url, {
    max: 1,
    prepare: false,
    connect_timeout: 15,
    ssl: /localhost|127\.0\.0\.1/.test(url) ? undefined : "require",
  });
  try {
    await sql.unsafe(schema);
  } finally {
    await sql.end({ timeout: 5 });
  }
  return true;
}

async function withTables<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (!needsSchema(error)) throw error;
    const applied = await ensureAdminSchema();
    if (!applied) throw error;
    let last = error;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      try {
        return await run();
      } catch (retryError) {
        last = retryError;
        if (!needsSchema(retryError)) throw retryError;
      }
    }
    throw last;
  }
}

export async function adminList<T extends AdminRecord>(section: AdminSection): Promise<T[]> {
  return withTables(async () => {
    const { data, error } = await db()
      .from(adminTable(section))
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map((item) => recordFromDb<T>(item as Record<string, unknown>));
  });
}

const CHUNK = 100;

export async function adminInsert<T extends AdminRecord>(
  section: AdminSection,
  items: Record<string, string>[]
): Promise<T[]> {
  const now = Date.now();
  const payloads = items.map((data, index) =>
    insertPayload(section, data, new Date(now + (items.length - index)).toISOString())
  );
  return withTables(async () => {
    const created: T[] = [];
    for (let index = 0; index < payloads.length; index += CHUNK) {
      const slice = payloads.slice(index, index + CHUNK);
      const { data, error } = await db().from(adminTable(section)).insert(slice).select("*");
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) {
        const missing = new Error(
          `Supabase stored nothing in ${adminTable(section)}. Run supabase/schema.sql in the SQL editor, then save again.`
        );
        missing.name = "SchemaNeeded";
        throw missing;
      }
      created.push(...rows.map((item) => recordFromDb<T>(item as Record<string, unknown>)));
    }
    return created.sort((a, b) => b.updatedAt - a.updatedAt);
  });
}

export async function adminUpdate<T extends AdminRecord>(
  section: AdminSection,
  id: string,
  data: Record<string, string>
): Promise<T> {
  return withTables(async () => {
    const { data: row, error } = await db()
      .from(adminTable(section))
      .update(updatePayload(section, data, new Date().toISOString()))
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return recordFromDb<T>(row as Record<string, unknown>);
  });
}

export async function adminDelete(section: AdminSection, id: string) {
  await withTables(async () => {
    const { error } = await db().from(adminTable(section)).delete().eq("id", id);
    if (error) throw error;
  });
}
