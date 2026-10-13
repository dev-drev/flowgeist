const COOKIE_NAME = "fg_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function encodeUtf8(value: string) {
  return new TextEncoder().encode(value);
}

function toHex(buffer: ArrayBuffer) {
  return [...new Uint8Array(buffer)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function toBase64Url(value: string) {
  const bytes = encodeUtf8(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  return new TextDecoder().decode(
    Uint8Array.from(binary, (char) => char.charCodeAt(0))
  );
}

function safeEqual(left: string, right: string) {
  const a = encodeUtf8(left);
  const b = encodeUtf8(right);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a[i] ^ b[i];
  return diff === 0;
}

async function hmac(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    encodeUtf8(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encodeUtf8(message));
  return toHex(signature);
}

function sessionSecret() {
  return process.env.ADMIN_PASS || "";
}

export function adminCookieName() {
  return COOKIE_NAME;
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
  };
}

const ADMIN_USER = "admin";

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASS);
}

export async function credentialsMatch(pass: string) {
  const expectedPass = process.env.ADMIN_PASS || "";
  if (!expectedPass) return false;
  return safeEqual(pass, expectedPass);
}

export async function createAdminSession() {
  const payload = toBase64Url(
    JSON.stringify({ u: ADMIN_USER, exp: Date.now() + MAX_AGE * 1000 })
  );
  const signature = await hmac(payload, sessionSecret());
  return `${payload}.${signature}`;
}

export async function readAdminSession(token: string | undefined) {
  if (!token || !sessionSecret()) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = await hmac(payload, sessionSecret());
  if (!safeEqual(signature, expected)) return null;
  try {
    const data = JSON.parse(fromBase64Url(payload)) as { u?: string; exp?: number };
    if (!data.u || !data.exp || data.exp < Date.now()) return null;
    if (data.u !== ADMIN_USER) return null;
    return data;
  } catch {
    return null;
  }
}
