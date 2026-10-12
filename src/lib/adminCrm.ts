import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type AdminSection = "promoters" | "clubs" | "notes" | "assets";

export const ADMIN_SECTIONS: { id: AdminSection; label: string }[] = [
  { id: "promoters", label: "Promoters" },
  { id: "clubs", label: "Clubs" },
  { id: "notes", label: "Info" },
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

export interface Note extends BaseRecord {
  title: string;
  body: string;
  category: string;
}

export interface Asset extends BaseRecord {
  title: string;
  url: string;
  kind: AssetKind;
  notes: string;
}

export type AdminRecord = Promoter | Club | Note | Asset;

const COLLECTIONS: Record<AdminSection, string> = {
  promoters: "admin_promoters",
  clubs: "admin_clubs",
  notes: "admin_notes",
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

function emptyNote(): Omit<Note, "id" | "createdAt" | "updatedAt"> {
  return { title: "", body: "", category: "" };
}

function emptyAsset(): Omit<Asset, "id" | "createdAt" | "updatedAt"> {
  return { title: "", url: "", kind: "other", notes: "" };
}

export function emptyDraft(section: AdminSection): Record<string, string> {
  if (section === "promoters") return { ...emptyPromoter() };
  if (section === "clubs") return { ...emptyClub() };
  if (section === "notes") return { ...emptyNote() };
  return { ...emptyAsset() };
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

export async function listRecords<T extends AdminRecord>(
  section: AdminSection
): Promise<T[]> {
  const local = readLocal<T>(section);
  try {
    const snap = await Promise.race([
      getDocs(collection(db, COLLECTIONS[section])),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Firestore timeout")), 4000);
      }),
    ]);
    const remote = snap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as T[];
    const rows = sortByUpdated(remote);
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
  const payload = { ...data, createdAt: now, updatedAt: now };
  try {
    const ref = await Promise.race([
      addDoc(collection(db, COLLECTIONS[section]), payload),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error("Firestore timeout")), 4000);
      }),
    ]);
    const row = { id: ref.id, ...payload } as T;
    writeLocal(section, [row, ...readLocal<T>(section).filter((item) => item.id !== row.id)]);
    return row;
  } catch (error) {
    console.warn(`Admin create fallback (${section})`, error);
    const row = { id: `local-${now}`, ...payload } as T;
    writeLocal(section, [row, ...readLocal<T>(section)]);
    return row;
  }
}

export async function updateRecord<T extends AdminRecord>(
  section: AdminSection,
  id: string,
  data: Record<string, string>
): Promise<T> {
  const payload = { ...data, updatedAt: Date.now() };
  const current = readLocal<T>(section).find((item) => item.id === id);
  const row = {
    ...(current ?? { id, createdAt: Date.now() }),
    ...payload,
    id,
  } as T;

  if (!id.startsWith("local-")) {
    try {
      await updateDoc(doc(db, COLLECTIONS[section], id), payload);
    } catch (error) {
      console.warn(`Admin update fallback (${section})`, error);
    }
  }

  writeLocal(
    section,
    readLocal<T>(section).map((item) => (item.id === id ? row : item))
  );
  return row;
}

export async function removeRecord(section: AdminSection, id: string) {
  if (!id.startsWith("local-")) {
    try {
      await deleteDoc(doc(db, COLLECTIONS[section], id));
    } catch (error) {
      console.warn(`Admin delete fallback (${section})`, error);
    }
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
  if (section === "notes") return (row as Note).category;
  return (row as Asset).kind;
}
