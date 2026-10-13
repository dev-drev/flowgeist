import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export type AdminSection =
  | "promoters"
  | "clubs"
  | "events"
  | "notes"
  | "links"
  | "assets";

export const ADMIN_SECTIONS: { id: AdminSection; label: string }[] = [
  { id: "promoters", label: "Promoters" },
  { id: "clubs", label: "Clubs" },
  { id: "events", label: "Events" },
  { id: "notes", label: "Info" },
  { id: "links", label: "Links" },
  { id: "assets", label: "Assets" },
];

export const ASSET_KINDS = [
  "presskit",
  "logo",
  "photo",
  "audio",
  "video",
  "doc",
  "other",
] as const;

export type AssetKind = (typeof ASSET_KINDS)[number];

export const EVENT_STATUSES = ["upcoming", "confirmed", "past", "cancelled"] as const;

export type EventStatus = (typeof EVENT_STATUSES)[number];

export const LINK_CATEGORIES = [
  "useful",
  "ticket",
  "press",
  "social",
  "booking",
  "tool",
  "other",
] as const;

export type LinkCategory = (typeof LINK_CATEGORIES)[number];

interface BaseRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface Promoter extends BaseRecord {
  name: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  instagram: string;
  website: string;
  notes: string;
}

export interface Club extends BaseRecord {
  name: string;
  city: string;
  country: string;
  address: string;
  capacity: string;
  email: string;
  phone: string;
  instagram: string;
  website: string;
  notes: string;
}

export interface AdminEvent extends BaseRecord {
  title: string;
  event_date: string;
  city: string;
  country: string;
  venue: string;
  promoter: string;
  status: EventStatus;
  ticket_url: string;
  website: string;
  notes: string;
}

export interface Note extends BaseRecord {
  title: string;
  body: string;
  category: string;
}

export interface AdminLink extends BaseRecord {
  title: string;
  url: string;
  category: LinkCategory;
  notes: string;
}

export interface AssetLink {
  name: string;
  url: string;
}

export interface Asset extends BaseRecord {
  title: string;
  url: string;
  kind: AssetKind;
  notes: string;
}

export type AdminRecord = Promoter | Club | AdminEvent | Note | AdminLink | Asset;

const TABLES: Record<AdminSection, string> = {
  promoters: "admin_promoters",
  clubs: "admin_clubs",
  events: "admin_events",
  notes: "admin_notes",
  links: "admin_links",
  assets: "admin_assets",
};

const STORAGE_PREFIX = "flowgeist-admin-";

function emptyPromoter(): Omit<Promoter, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "",
    city: "",
    country: "",
    email: "",
    phone: "",
    instagram: "",
    website: "",
    notes: "",
  };
}

function emptyClub(): Omit<Club, "id" | "createdAt" | "updatedAt"> {
  return {
    name: "",
    city: "",
    country: "",
    address: "",
    capacity: "",
    email: "",
    phone: "",
    instagram: "",
    website: "",
    notes: "",
  };
}

function emptyEvent(): Omit<AdminEvent, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    event_date: "",
    city: "",
    country: "",
    venue: "",
    promoter: "",
    status: "upcoming",
    ticket_url: "",
    website: "",
    notes: "",
  };
}

function emptyNote(): Omit<Note, "id" | "createdAt" | "updatedAt"> {
  return { title: "", body: "", category: "" };
}

function emptyLink(): Omit<AdminLink, "id" | "createdAt" | "updatedAt"> {
  return { title: "", url: "", category: "useful", notes: "" };
}

function emptyAsset(): Omit<Asset, "id" | "createdAt" | "updatedAt"> & { links: string } {
  return {
    title: "",
    url: "",
    kind: "other",
    notes: "",
    links: JSON.stringify([{ name: "", url: "" }]),
  };
}

export function parseAssetLinks(value: unknown): AssetLink[] {
  if (Array.isArray(value)) {
    return value.map((item) => {
      const link = item as Partial<AssetLink> | null;
      return {
        name: String(link?.name ?? "").trim(),
        url: String(link?.url ?? "").trim(),
      };
    });
  }

  const raw = String(value ?? "").trim();
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parseAssetLinks(parsed);
    } catch {
      return [{ name: "", url: raw }];
    }
  }
  return [{ name: "", url: raw }];
}

export function packAssetLinks(links: AssetLink[]) {
  const cleaned = links
    .map((link) => ({ name: link.name.trim(), url: link.url.trim() }))
    .filter((link) => link.name || link.url);
  if (cleaned.length === 0) return "";
  if (cleaned.length === 1 && !cleaned[0].name) return cleaned[0].url;
  return JSON.stringify(cleaned);
}

function toDbFields(section: AdminSection, data: Record<string, string>) {
  const fields = { ...data };
  delete fields.links;
  if (section === "assets") {
    const source = data.links !== undefined ? data.links : data.url;
    fields.url = packAssetLinks(parseAssetLinks(source));
  }
  return fields;
}

export function emptyDraft(section: AdminSection): Record<string, string> {
  if (section === "promoters") return { ...emptyPromoter() };
  if (section === "clubs") return { ...emptyClub() };
  if (section === "events") return { ...emptyEvent() };
  if (section === "notes") return { ...emptyNote() };
  if (section === "links") return { ...emptyLink() };
  return { ...emptyAsset() };
}

export const PROMOTER_CSV_COLUMNS = [
  "name",
  "city",
  "country",
  "email",
  "phone",
  "instagram",
  "website",
  "notes",
] as const;

const PROMOTER_HEADER_ALIASES: Record<string, (typeof PROMOTER_CSV_COLUMNS)[number]> = {
  name: "name",
  nome: "name",
  promoter: "name",
  city: "city",
  citta: "city",
  country: "country",
  paese: "country",
  nazione: "country",
  email: "email",
  mail: "email",
  phone: "phone",
  telefono: "phone",
  tel: "phone",
  instagram: "instagram",
  ig: "instagram",
  insta: "instagram",
  website: "website",
  sito: "website",
  web: "website",
  url: "website",
  notes: "notes",
  note: "notes",
};

function promoterHeaderKey(raw: string) {
  const normalized = raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const compact = normalized.replace(/[^a-z0-9]+/g, "");
  if (PROMOTER_HEADER_ALIASES[compact]) return PROMOTER_HEADER_ALIASES[compact];
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  for (const token of tokens) {
    const key = PROMOTER_HEADER_ALIASES[token];
    if (key) return key;
  }
  return null;
}

function csvDelimiter(line: string) {
  const commas = line.split(",").length - 1;
  const semis = line.split(";").length - 1;
  const tabs = line.split("\t").length - 1;
  if (tabs >= commas && tabs >= semis && tabs > 0) return "\t";
  if (semis > commas) return ";";
  return ",";
}

function parseCsvTable(text: string) {
  const cleaned = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const firstLine = cleaned.split("\n").find((line) => line.trim()) ?? "";
  const delimiter = csvDelimiter(firstLine);
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < cleaned.length; index += 1) {
    const char = cleaned[index];
    if (quoted) {
      if (char === '"') {
        if (cleaned[index + 1] === '"') {
          cell += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === delimiter) {
      row.push(cell.trim());
      cell = "";
      continue;
    }
    if (char === "\n") {
      row.push(cell.trim());
      if (row.some((value) => value)) rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value)) rows.push(row);
  return rows;
}

export function parsePromoterCsv(text: string): Record<string, string>[] {
  const table = parseCsvTable(text);
  if (table.length === 0) return [];

  const headerKeys = table[0].map((cell) => promoterHeaderKey(cell));
  const hasHeader = headerKeys.some(Boolean) && !table[0].some((cell) => cell.includes("@"));
  const start = hasHeader ? 1 : 0;
  const promoters: Record<string, string>[] = [];

  for (let index = start; index < table.length; index += 1) {
    const cells = table[index];
    const draft = emptyDraft("promoters");
    if (hasHeader) {
      headerKeys.forEach((key, cellIndex) => {
        if (key) draft[key] = cells[cellIndex] ?? "";
      });
    } else {
      PROMOTER_CSV_COLUMNS.forEach((key, cellIndex) => {
        draft[key] = cells[cellIndex] ?? "";
      });
    }
    if (!Object.values(draft).some((value) => value.trim())) continue;
    if (!draft.name.trim() && draft.email.trim()) draft.name = draft.email.trim();
    if (!draft.name.trim()) continue;
    promoters.push(draft);
  }

  return promoters;
}

function readLocal<T extends AdminRecord>(section: AdminSection): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + section);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocal<T extends AdminRecord>(section: AdminSection, rows: T[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_PREFIX + section, JSON.stringify(rows));
}

function sortByUpdated<T extends AdminRecord>(rows: T[]) {
  return [...rows].sort((a, b) => b.updatedAt - a.updatedAt);
}

function stamp(value: unknown) {
  if (typeof value === "number") return value;
  const parsed = Date.parse(String(value || ""));
  return Number.isNaN(parsed) ? Date.now() : parsed;
}

function fromRow<T extends AdminRecord>(row: Record<string, unknown>): T {
  const { created_at, updated_at, ...rest } = row;
  return {
    ...rest,
    createdAt: stamp(created_at),
    updatedAt: stamp(updated_at),
  } as T;
}

export async function listRecords<T extends AdminRecord>(
  section: AdminSection
): Promise<T[]> {
  const local = readLocal<T>(section);
  if (!isSupabaseConfigured()) return sortByUpdated(local);

  try {
    const { data, error } = await getSupabase()
      .from(TABLES[section])
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) throw error;
    const rows = sortByUpdated((data ?? []).map((item) => fromRow<T>(item)));
    writeLocal(section, rows);
    return rows;
  } catch (error) {
    console.warn(`Admin list fallback (${section})`, error);
    return sortByUpdated(local);
  }
}

export async function createRecord<T extends AdminRecord>(
  section: AdminSection,
  data: Record<string, string>
): Promise<T> {
  const now = Date.now();
  const fields = toDbFields(section, data);
  const payload = {
    ...fields,
    created_at: new Date(now).toISOString(),
    updated_at: new Date(now).toISOString(),
  };

  if (isSupabaseConfigured()) {
    const { data: row, error } = await getSupabase()
      .from(TABLES[section])
      .insert(payload)
      .select("*")
      .single();
    if (error) throw error;
    const created = fromRow<T>(row);
    writeLocal(section, [
      created,
      ...readLocal<T>(section).filter((item) => item.id !== created.id),
    ]);
    return created;
  }

  const row = { id: `local-${now}`, ...fields, createdAt: now, updatedAt: now } as T;
  writeLocal(section, [row, ...readLocal<T>(section)]);
  return row;
}

export async function createRecords<T extends AdminRecord>(
  section: AdminSection,
  items: Record<string, string>[]
): Promise<T[]> {
  if (items.length === 0) return [];
  const now = Date.now();

  if (isSupabaseConfigured()) {
    const payloads = items.map((data, index) => {
      const at = new Date(now + (items.length - index)).toISOString();
      return {
        ...toDbFields(section, data),
        created_at: at,
        updated_at: at,
      };
    });
    const { data, error } = await getSupabase().from(TABLES[section]).insert(payloads).select("*");
    if (error) throw error;
    const created = sortByUpdated((data ?? []).map((item) => fromRow<T>(item)));
    const ids = new Set(created.map((row) => row.id));
    writeLocal(section, [
      ...created,
      ...readLocal<T>(section).filter((item) => !ids.has(item.id)),
    ]);
    return created;
  }

  const created = items.map((data, index) => {
    const at = now + (items.length - index);
    return {
      id: `local-${at}-${index}`,
      ...toDbFields(section, data),
      createdAt: at,
      updatedAt: at,
    } as T;
  });
  writeLocal(section, [...created, ...readLocal<T>(section)]);
  return created;
}

export async function updateRecord<T extends AdminRecord>(
  section: AdminSection,
  id: string,
  data: Record<string, string>
): Promise<T> {
  const now = Date.now();
  const fields = toDbFields(section, data);
  const current = readLocal<T>(section).find((item) => item.id === id);
  const row = {
    ...(current ?? { id, createdAt: now }),
    ...fields,
    id,
    updatedAt: now,
  } as T;

  if (isSupabaseConfigured() && !id.startsWith("local-")) {
    const { error } = await getSupabase()
      .from(TABLES[section])
      .update({ ...fields, updated_at: new Date(now).toISOString() })
      .eq("id", id);
    if (error) throw error;
  }

  writeLocal(
    section,
    readLocal<T>(section).map((item) => (item.id === id ? row : item))
  );
  return row;
}

export async function removeRecord(section: AdminSection, id: string) {
  if (isSupabaseConfigured() && !id.startsWith("local-")) {
    const { error } = await getSupabase().from(TABLES[section]).delete().eq("id", id);
    if (error) throw error;
  }
  writeLocal(
    section,
    readLocal(section).filter((item) => item.id !== id)
  );
}

export function recordTitle(section: AdminSection, row: AdminRecord) {
  if ("name" in row && row.name) return row.name;
  if ("title" in row && row.title) return row.title;
  return "Untitled";
}

export function recordSubtitle(section: AdminSection, row: AdminRecord) {
  if (section === "promoters" || section === "clubs") {
    const item = row as Promoter | Club;
    return [item.city, item.country].filter(Boolean).join(", ");
  }
  if (section === "events") {
    const item = row as AdminEvent;
    return [item.city, item.event_date, item.status].filter(Boolean).join(" · ");
  }
  if (section === "notes") return (row as Note).category;
  if (section === "links") return (row as AdminLink).category;
  return (row as Asset).kind;
}

export function recordLink(row: AdminRecord) {
  if ("url" in row && row.url) {
    const link = parseAssetLinks(row.url).find((item) => item.url);
    if (link) return link.url;
    if (!String(row.url).trim().startsWith("[")) return row.url;
  }
  if ("ticket_url" in row && row.ticket_url) return row.ticket_url;
  if ("website" in row && row.website) return row.website;
  return "";
}

export { isSupabaseConfigured };
