import { NextRequest, NextResponse } from "next/server";
import { microsoftAuthorizeUrl, microsoftOAuthConfigured } from "@/lib/microsoftMail";

export async function GET(request: NextRequest) {
  if (!microsoftOAuthConfigured()) {
    return NextResponse.json(
      {
        error:
          "Add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET to .env, then connect Outlook.",
      },
      { status: 503 }
    );
  }
  const redirectUri = `${request.nextUrl.origin}/api/admin/email/callback`;
  return NextResponse.redirect(microsoftAuthorizeUrl(redirectUri));
}
