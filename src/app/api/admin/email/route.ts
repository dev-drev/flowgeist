import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const FROM = process.env.MAIL_FROM || "Flowgeist <info@flowgeist.net>";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function parseRecipients(raw: string) {
  return raw
    .split(/[,;\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function GET() {
  return NextResponse.json({
    configured: Boolean(process.env.RESEND_API_KEY),
    from: FROM,
  });
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "RESEND_API_KEY missing. Add it in .env.local and Vercel, then verify flowgeist.net on Resend.",
      },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const toRaw = String(body.to || "");
    const subject = String(body.subject || "").trim();
    const text = String(body.body || "").trim();
    const recipients = parseRecipients(toRaw);

    if (recipients.length === 0 || recipients.length > 10) {
      return NextResponse.json({ error: "Add 1 to 10 recipients." }, { status: 400 });
    }
    if (recipients.some((email) => !EMAIL_RE.test(email))) {
      return NextResponse.json({ error: "One or more addresses are invalid." }, { status: 400 });
    }
    if (!subject || !text) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    const resend = new Resend(apiKey);
    const html = escapeHtml(text).replace(/\n/g, "<br />");
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: recipients,
      replyTo: "info@flowgeist.net",
      subject,
      text,
      html: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111">${html}</div>`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 502 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send" },
      { status: 500 }
    );
  }
}
