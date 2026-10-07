import crypto from "crypto";
import { NextResponse } from "next/server";
import { getAdminAccount } from "./adminAccount";

export interface SessionUser {
  sub: string;
  email: string;
  name: string;
  role: "admin" | "customer";
  iat: number;
  exp: number;
}

export const AUTH_SESSION_COOKIE = "juvenile_secure_session";
export const LEGACY_ADMIN_COOKIE = "juvenile_admin_session";

// Secret key derivation (Server-side Only)
function getSecretKey(): Buffer {
  const secret = process.env.SESSION_SECRET || "fallback_default_juvenile_secret_2026_super_hardened";
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Constant-time string equality check to prevent timing attacks
 */
export function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf-8");
    const bufB = Buffer.from(b, "utf-8");
    if (bufA.length !== bufB.length) {
      return false;
    }
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Create a cryptographically signed HMAC-SHA256 Session Token
 */
export function createSessionToken(
  user: Omit<SessionUser, "iat" | "exp">,
  expiresInDays: number = 7
): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;

  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      ...user,
      iat: now,
      exp,
    })
  ).toString("base64url");

  const signature = crypto
    .createHmac("sha256", getSecretKey())
    .update(`${header}.${payload}`)
    .digest("base64url");

  return `${header}.${payload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 Session Token
 */
export function verifySessionToken(token: string): SessionUser | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, sigB64] = parts;

  try {
    const expectedSig = crypto
      .createHmac("sha256", getSecretKey())
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    if (!timingSafeCompare(sigB64, expectedSig)) {
      return null;
    }

    const payloadRaw = Buffer.from(payloadB64, "base64url").toString("utf-8");
    const payload = JSON.parse(payloadRaw) as SessionUser;

    const now = Math.floor(Date.now() / 1000);
    if (!payload.exp || payload.exp < now) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract authenticated session from Cookie header
 */
export function getSessionFromCookies(cookieHeader: string | null | undefined): SessionUser | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${AUTH_SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;

  return verifySessionToken(decodeURIComponent(match[1]));
}

/**
 * Extract authenticated session from Request
 */
export function getAuthenticatedUser(req: Request): SessionUser | null {
  const cookieHeader = req.headers.get("cookie");
  return getSessionFromCookies(cookieHeader);
}

/**
 * Check if the current request is authenticated as Admin
 */
export function isAdmin(req: Request): boolean {
  const user = getAuthenticatedUser(req);
  return Boolean(user && user.role === "admin");
}

/**
 * Verify Admin Passkey securely
 */
export function verifyAdminPasskey(inputPasskey: string): boolean {
  if (!inputPasskey || typeof inputPasskey !== "string") return false;
  const trimmed = inputPasskey.trim();

  const envPasskeys = (process.env.ADMIN_PASSKEYS || "juvenile2026,2026,admin2026")
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  return envPasskeys.some((validKey) => timingSafeCompare(trimmed, validKey));
}

/**
 * Verify account credentials (Server-Side)
 * Enforces exactly ONE single authoritative admin account
 */
export function verifyAccountCredentials(
  email: string,
  pass: string
): { name: string; email: string; role: "admin" | "customer" } | null {
  if (!email || !pass) return null;

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedPass = String(pass).trim();

  // 1. Single Authoritative Admin Account
  const adminAccount = getAdminAccount();
  if (
    timingSafeCompare(normalizedEmail, adminAccount.email) &&
    timingSafeCompare(normalizedPass, adminAccount.password)
  ) {
    return {
      name: adminAccount.name || "مدير المتجر",
      email: adminAccount.email,
      role: "admin",
    };
  }

  // 2. Demo customer account
  if (
    timingSafeCompare(normalizedEmail, "demo@juvenile.com") &&
    timingSafeCompare(normalizedPass, "demo123")
  ) {
    return {
      name: "عميل تجريبي",
      email: "demo@juvenile.com",
      role: "customer",
    };
  }

  return null;
}

/**
 * Set cryptographically secure session cookies on response
 */
export function setAuthCookies(
  res: NextResponse,
  user: Omit<SessionUser, "iat" | "exp">
): void {
  const token = createSessionToken(user, user.role === "admin" ? 7 : 30);
  const isProd = process.env.NODE_ENV === "production";

  // Primary Cryptographically Signed Token
  res.cookies.set(AUTH_SESSION_COOKIE, token, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    maxAge: (user.role === "admin" ? 7 : 30) * 24 * 60 * 60,
  });

  // Dual-sign legacy admin cookie with verified signature (NOT plain static string)
  if (user.role === "admin") {
    res.cookies.set(LEGACY_ADMIN_COOKIE, token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isProd,
      maxAge: 7 * 24 * 60 * 60,
    });
  }
}

/**
 * Clear all authentication cookies
 */
export function clearAuthCookies(res: NextResponse): void {
  const isProd = process.env.NODE_ENV === "production";
  const clearOpts = {
    path: "/",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: isProd,
    maxAge: 0,
  };

  res.cookies.set(AUTH_SESSION_COOKIE, "", clearOpts);
  res.cookies.set(LEGACY_ADMIN_COOKIE, "", clearOpts);
  res.cookies.set("juvenile_session", "", clearOpts);
  res.cookies.set("juvenile_gate_clearance", "", clearOpts);
}
