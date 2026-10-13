import { NextRequest, NextResponse } from "next/server";
import { listInbox, readInboxMessage } from "@/lib/microsoftMail";

function inboxFailure(error: unknown) {
  const raw = error instanceof Error ? error.message : "Could not read mail";
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
