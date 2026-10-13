import { NextRequest, NextResponse } from "next/server";
import { exchangeCode } from "@/lib/microsoftMail";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error_description");
  const origin = request.nextUrl.origin;

  if (error || !code) {
    const reason = encodeURIComponent(error || "Could not connect Outlook");
    return NextResponse.redirect(`${origin}/admin?mail=error&reason=${reason}`);
  }

  try {
    await exchangeCode(code, `${origin}/api/admin/email/callback`);
    return NextResponse.redirect(`${origin}/admin?mail=connected`);
  } catch (err) {
    console.error(err);
    const reason = encodeURIComponent(err instanceof Error ? err.message : "Could not connect Outlook");
    return NextResponse.redirect(`${origin}/admin?mail=error&reason=${reason}`);
  }
}
