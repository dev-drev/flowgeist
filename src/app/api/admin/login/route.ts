import { NextRequest, NextResponse } from "next/server";
import {
  adminCookieName,
  createAdminSession,
  credentialsMatch,
  isAdminConfigured,
  sessionCookieOptions,
} from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Add ADMIN_PASS in Vercel, then redeploy." },
      { status: 503 }
    );
  }

  const body = (await request.json().catch(() => null)) as { pass?: string } | null;
  const pass = body?.pass || "";

  if (!(await credentialsMatch(pass))) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName(), await createAdminSession(), sessionCookieOptions());
  return response;
}
