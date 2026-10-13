import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import {
  hasMicrosoftRefreshToken,
  microsoftOAuthConfigured,
  sendWithMicrosoft,
} from "@/lib/microsoftMail";

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

function smtpConfigured() {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
}

function mailProvider() {
  if (hasMicrosoftRefreshToken()) return "microsoft";
  if (smtpConfigured()) return "smtp";
  if (process.env.RESEND_API_KEY) return "resend";
  return null;
}

export async function GET() {
  const provider = mailProvider();
  return NextResponse.json({
    configured: Boolean(provider),
    provider,
    from: FROM,
    oauthReady: microsoftOAuthConfigured(),
    microsoftConnected: hasMicrosoftRefreshToken(),
  });
}

async function sendWithSmtp(recipients: string[], subject: string, text: string, html: string) {
  const port = Number(process.env.SMTP_PORT || 587);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-mail.outlook.com",
    port,
    secure: port === 465,
    requireTLS: port === 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: FROM,
    to: recipients.join(", "),
    replyTo: "info@flowgeist.net",
    subject,
    text,
    html,
  });

  return info.messageId;
}

async function sendWithResend(recipients: string[], subject: string, text: string, html: string) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  const { data, error } = await resend.emails.send({
    from: FROM,
    to: recipients,
    replyTo: "info@flowgeist.net",
    subject,
    text,
    html,
  });
  if (error) throw new Error(error.message);
  return data?.id;
}

export async function POST(request: NextRequest) {
  const provider = mailProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "Mail not connected. Add SMTP_USER and SMTP_PASS in .env (Gmail app password) to send for free.",
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

    const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111">${escapeHtml(text).replace(/\n/g, "<br />")}</div>`;
    const id =
      provider === "microsoft"
        ? await sendWithMicrosoft(recipients, subject, html, text)
        : provider === "smtp"
          ? await sendWithSmtp(recipients, subject, text, html)
          : await sendWithResend(recipients, subject, text, html);

    return NextResponse.json({ success: true, id, provider });
  } catch (error) {
    const raw = error instanceof Error ? error.message : "Failed to send";
    const smtpAuthDisabled = /smtpclientauthentication is disabled/i.test(raw);
    return NextResponse.json(
      {
        error: smtpAuthDisabled
          ? "GoDaddy Email Essentials tiene SMTP spento a livello organizzazione. Il tasto sulla casella non basta: GoDaddy deve sbloccare SMTP AUTH sul tenant."
          : raw,
      },
      { status: 500 }
    );
  }
}
