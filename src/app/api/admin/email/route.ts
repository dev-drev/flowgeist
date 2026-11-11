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

const SIGNATURE_LOGO = "https://flowgeist.net/flowgeist.png";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const URL_RE = /(?:https?:\/\/|www\.)[^\s<]+/gi;

function linkify(escaped: string) {
  return escaped.replace(URL_RE, (raw) => {
    const url = raw.replace(/[.,;:!?)]+$/g, "");
    const tail = raw.slice(url.length);
    const href = url.startsWith("www.") ? `https://${url}` : url;
    return `<a href="${href}" target="_blank" style="color:#111;text-decoration:underline">${url}</a>${tail}`;
  });
}

function withSignature(text: string) {
  const body = linkify(escapeHtml(text)).replace(/\n/g, "<br />");
  const html = `<div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#111">${body}<div style="margin:28px 0 0"><a href="https://flowgeist.net" target="_blank" style="text-decoration:none"><img src="${SIGNATURE_LOGO}" alt="Flowgeist" width="150" height="39" border="0" style="display:block;width:150px;height:auto;border:0;outline:none" /></a></div></div>`;
  const plain = `${text}\n\nFlowgeist\nhttps://flowgeist.net`;
  return { html, plain };
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
          "Mail not connected. Add SMTP_USER and SMTP_PASS on Vercel to send from info@flowgeist.net.",
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

    const { html, plain } = withSignature(text);
    const id =
      provider === "microsoft"
        ? await sendWithMicrosoft(recipients, subject, html, plain)
        : provider === "smtp"
          ? await sendWithSmtp(recipients, subject, plain, html)
          : await sendWithResend(recipients, subject, plain, html);

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
