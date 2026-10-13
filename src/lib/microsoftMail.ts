import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TOKEN_PATH = join(process.cwd(), ".microsoft-mail-token.json");
const SCOPES = "offline_access openid email Mail.Send User.Read";
const FROM = "info@flowgeist.net";

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

export function microsoftAuthorizeUrl(redirectUri: string) {
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID || "",
    response_type: "code",
    redirect_uri: redirectUri,
    response_mode: "query",
    scope: SCOPES,
    prompt: "select_account",
  });
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
}

async function tokenRequest(body: Record<string, string>) {
  const tenant = process.env.MICROSOFT_TENANT_ID || "common";
  const response = await fetch(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
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
