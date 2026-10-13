import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TOKEN_PATH = join(process.cwd(), ".microsoft-mail-token.json");
const SCOPES = "offline_access openid email Mail.Send Mail.Read User.Read";
const FROM = "info@flowgeist.net";
const TENANT =
  process.env.MICROSOFT_TENANT_ID && process.env.MICROSOFT_TENANT_ID !== "common"
    ? process.env.MICROSOFT_TENANT_ID
    : "798a4e5a-f1e6-40ea-905b-98fa68f28447";

type TokenFile = {
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
};

export function microsoftOAuthConfigured() {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

export function hasMicrosoftRefreshToken() {
  return Boolean(readTokens().refresh_token || process.env.MICROSOFT_REFRESH_TOKEN);
}

function readTokens(): TokenFile {
  if (process.env.MICROSOFT_REFRESH_TOKEN) {
    return { refresh_token: process.env.MICROSOFT_REFRESH_TOKEN };
  }
  try {
    return JSON.parse(readFileSync(TOKEN_PATH, "utf8")) as TokenFile;
  } catch {
    return {};
  }
}

function writeTokens(tokens: TokenFile) {
  writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
}

export function microsoftAppConfigured() {
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET);
}

export function microsoftAuthorizeUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: SCOPES,
    prompt: "select_account",
  });
  return `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/authorize?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>) {
  const response = await fetch(
    `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID || "",
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || "",
        ...body,
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error_description || data.error || "Microsoft token error");
  }
  return data as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
}

export async function exchangeCode(code: string, redirectUri: string) {
  const data = await tokenRequest({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });
  writeTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  });
}

let appToken: { value: string; expiresAt: number } | null = null;

async function getAppAccessToken() {
  if (!microsoftAppConfigured()) throw new Error("MAIL_APP_MISSING");
  if (appToken && appToken.expiresAt > Date.now() + 60_000) return appToken.value;
  const data = await tokenRequest({
    grant_type: "client_credentials",
    scope: "https://graph.microsoft.com/.default",
  });
  appToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return data.access_token;
}

async function getAccessToken() {
  const stored = readTokens();
  if (stored.access_token && stored.expires_at && stored.expires_at > Date.now() + 60_000) {
    return stored.access_token;
  }
  if (!stored.refresh_token) {
    throw new Error("Outlook is not connected. Click Connect Outlook in Admin.");
  }
  const data = await tokenRequest({
    grant_type: "refresh_token",
    refresh_token: stored.refresh_token,
  });
  writeTokens({
    access_token: data.access_token,
    refresh_token: data.refresh_token || stored.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  });
  return data.access_token;
}

export type InboxMessage = {
  id: string;
  subject: string;
  fromName: string;
  fromEmail: string;
  receivedAt: string;
  preview: string;
  isRead: boolean;
};

export type InboxMessageDetail = InboxMessage & {
  body: string;
  bodyType: "html" | "text";
};

type GraphAddress = { emailAddress?: { name?: string; address?: string } };

function mailAddress(value: GraphAddress | undefined) {
  return {
    name: value?.emailAddress?.name?.trim() || "",
    email: value?.emailAddress?.address?.trim() || "",
  };
}

function inboxRoot() {
  return microsoftAppConfigured() ? `/users/${encodeURIComponent(FROM)}` : "/me";
}

async function graphFetch(path: string) {
  if (!microsoftAppConfigured() && !hasMicrosoftRefreshToken()) {
    throw new Error("MAIL_APP_MISSING");
  }
  const token = microsoftAppConfigured() ? await getAppAccessToken() : await getAccessToken();
  const response = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const code = String(data.error?.code || "");
    if (response.status === 403 || code === "ErrorAccessDenied" || code === "Authorization_RequestDenied") {
      throw new Error(microsoftAppConfigured() ? "MAIL_APP_DENIED" : "MAIL_READ_DENIED");
    }
    throw new Error(data.error?.message || `Microsoft Graph ${response.status}`);
  }
  return data as Record<string, unknown>;
}

function asInboxMessage(row: Record<string, unknown>): InboxMessage {
  const from = mailAddress(row.from as GraphAddress | undefined);
  return {
    id: String(row.id || ""),
    subject: String(row.subject || "(no subject)"),
    fromName: from.name,
    fromEmail: from.email,
    receivedAt: String(row.receivedDateTime || ""),
    preview: String(row.bodyPreview || ""),
    isRead: Boolean(row.isRead),
  };
}

export async function listInbox() {
  const root = inboxRoot();
  const folder = await graphFetch(
    `${root}/mailFolders/inbox/messages?$top=40&$orderby=receivedDateTime desc&$select=id,subject,from,receivedDateTime,bodyPreview,isRead`
  );
  const rows = Array.isArray(folder.value) ? (folder.value as Record<string, unknown>[]) : [];
  return {
    mailbox: FROM,
    messages: rows.map(asInboxMessage).filter((message) => message.id),
  };
}

export async function readInboxMessage(id: string): Promise<InboxMessageDetail> {
  if (!id || id.length > 1024 || /\s/.test(id) || id.includes("..")) {
    throw new Error("Invalid message");
  }
  const row = await graphFetch(
    `${inboxRoot()}/messages/${encodeURIComponent(id)}?$select=id,subject,from,receivedDateTime,bodyPreview,body,isRead`
  );
  const body = row.body as { contentType?: string; content?: string } | undefined;
  const contentType = String(body?.contentType || "text").toLowerCase();
  return {
    ...asInboxMessage(row),
    body: String(body?.content || row.bodyPreview || ""),
    bodyType: contentType === "html" ? "html" : "text",
  };
}

export async function sendWithMicrosoft(
  recipients: string[],
  subject: string,
  html: string,
  text: string
) {
  const token = await getAccessToken();
  const response = await fetch("https://graph.microsoft.com/v1.0/me/sendMail", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: {
        subject,
        body: { contentType: "HTML", content: html },
        toRecipients: recipients.map((address) => ({
          emailAddress: { address },
        })),
        from: { emailAddress: { address: FROM } },
      },
      saveToSentItems: true,
    }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error?.message || `Microsoft Graph ${response.status}`);
  }
}
