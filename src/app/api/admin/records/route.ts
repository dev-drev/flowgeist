import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SECTIONS, type AdminSection } from "@/lib/adminCrm";
import {
  adminDelete,
  adminInsert,
  adminList,
  adminUpdate,
  explainDbError,
  isAdminDbConfigured,
} from "@/lib/adminDb";

export const dynamic = "force-dynamic";

const SECTIONS = new Set<AdminSection>(ADMIN_SECTIONS.map((item) => item.id));

function asSection(value: unknown): AdminSection | null {
  return typeof value === "string" && SECTIONS.has(value as AdminSection)
    ? (value as AdminSection)
    : null;
}

function fail(section: AdminSection, error: unknown) {
  return NextResponse.json({ error: explainDbError(error, section) }, { status: 500 });
}

function cleanItems(value: unknown): Record<string, string>[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => item && typeof item === "object")
    .map((item) => {
      const record: Record<string, string> = {};
      for (const [key, cell] of Object.entries(item as Record<string, unknown>)) {
        if (typeof cell === "string") record[key] = cell;
      }
      return record;
    })
    .filter((item) => Object.values(item).some((cell) => cell.trim()));
}

export async function GET(request: NextRequest) {
  const section = asSection(request.nextUrl.searchParams.get("section"));
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  if (!isAdminDbConfigured()) return NextResponse.json({ configured: false, rows: [] });
  try {
    return NextResponse.json({ configured: true, rows: await adminList(section) });
  } catch (error) {
    return fail(section, error);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    section?: unknown;
    items?: unknown;
  } | null;
  const section = asSection(body?.section);
  if (!section) return NextResponse.json({ error: "Unknown section" }, { status: 400 });
  const items = cleanItems(body?.items);
  if (items.length === 0) return NextResponse.json({ error: "Nothing to save" }, { status: 400 });
  if (!isAdminDbConfigured()) return NextResponse.json({ configured: false, rows: [] });
  try {
    return NextResponse.json({ configured: true, rows: await adminInsert(section, items) });
  } catch (error) {
    return fail(section, error);
  }
}

export async function PATCH(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    section?: unknown;
    id?: unknown;
    data?: unknown;
  } | null;
  const section = asSection(body?.section);
  const id = typeof body?.id === "string" ? body.id : "";
  const data = cleanItems([body?.data])[0];
  if (!section || !id || !data) {
    return NextResponse.json({ error: "Missing entry" }, { status: 400 });
  }
  if (!isAdminDbConfigured()) return NextResponse.json({ configured: false });
  try {
    return NextResponse.json({ configured: true, row: await adminUpdate(section, id, data) });
  } catch (error) {
    return fail(section, error);
  }
}

export async function DELETE(request: NextRequest) {
  const section = asSection(request.nextUrl.searchParams.get("section"));
  const id = request.nextUrl.searchParams.get("id") || "";
  if (!section || !id) return NextResponse.json({ error: "Missing entry" }, { status: 400 });
  if (!isAdminDbConfigured()) return NextResponse.json({ configured: false });
  try {
    await adminDelete(section, id);
    return NextResponse.json({ configured: true });
  } catch (error) {
    return fail(section, error);
  }
}
