import { NextRequest, NextResponse } from "next/server";
import { listInbox, readInboxMessage } from "@/lib/microsoftMail";

function inboxFailure(error: unknown) {
  const raw = error instanceof Error ? error.message : "Could not read mail";
  if (raw === "MAIL_APP_MISSING") {
    return {
      status: 503,
      body: {
        error:
          "Password login is turned off for this mailbox. Add MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET so the server can sign in by itself.",
        reconnect: false,
      },
    };
  }
  if (raw === "MAIL_APP_DENIED") {
    return {
      status: 403,
      body: {
        error:
          "The Microsoft app needs Mail.Read as an application permission, plus admin consent, for info@flowgeist.net.",
        reconnect: false,
      },
    };
  }
  if (raw === "MAIL_READ_DENIED") {
    return {
      status: 403,
      body: {
        error: "Reconnect Outlook to read mail at info@flowgeist.net.",
        reconnect: true,
      },
    };
  }
  if (/not connected/i.test(raw)) {
    return {
      status: 403,
      body: {
        error: "Connect Outlook to read mail at info@flowgeist.net.",
        reconnect: true,
      },
    };
  }
  return { status: 500, body: { error: raw, reconnect: false } };
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  try {
    if (id) {
      return NextResponse.json(await readInboxMessage(id));
    }
    return NextResponse.json(await listInbox());
  } catch (error) {
    const failure = inboxFailure(error);
    return NextResponse.json(failure.body, { status: failure.status });
  }
}
