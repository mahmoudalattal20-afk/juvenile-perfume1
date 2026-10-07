import fs from "fs";
import path from "path";
import { timingSafeCompare } from "./auth";

const ACCOUNT_FILE_PATH = path.join(process.cwd(), "src", "data", "adminAccount.json");

export interface AdminAccountData {
  email: string;
  password: string;
  name?: string;
  updatedAt?: string;
}

/**
 * Retrieve the single authoritative admin account
 */
export function getAdminAccount(): AdminAccountData {
  try {
    if (fs.existsSync(ACCOUNT_FILE_PATH)) {
      const raw = fs.readFileSync(ACCOUNT_FILE_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.email === "string" && typeof parsed.password === "string") {
        return {
          email: parsed.email.trim().toLowerCase(),
          password: parsed.password.trim(),
          name: parsed.name || "مدير المتجر",
          updatedAt: parsed.updatedAt,
        };
      }
    }
  } catch (err) {
    console.error("Error reading adminAccount.json:", err);
  }

  // Default credentials (single authoritative source)
  const defaultEmail = (process.env.ADMIN_EMAIL || "admin@juvenile.com").trim().toLowerCase();
  const defaultPassword = (process.env.ADMIN_PASSWORD || "juvenile2026").trim();

  return {
    email: defaultEmail,
    password: defaultPassword,
    name: "مدير المتجر",
  };
}

/**
 * Verify if the provided current password matches the active admin account
 */
export function verifyCurrentPassword(currentPass: string): boolean {
  if (!currentPass) return false;
  const current = getAdminAccount();
  return timingSafeCompare(String(currentPass).trim(), current.password);
}

/**
 * Update the single admin account credentials
 */
export function updateAdminAccount(newEmail?: string, newPassword?: string): AdminAccountData {
  const current = getAdminAccount();
  const cleanEmail = newEmail ? String(newEmail).trim().toLowerCase() : current.email;
  const cleanPassword = newPassword ? String(newPassword).trim() : current.password;

  const accountData: AdminAccountData = {
    email: cleanEmail,
    password: cleanPassword,
    name: "مدير المتجر",
    updatedAt: new Date().toISOString(),
  };

  try {
    const dir = path.dirname(ACCOUNT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(ACCOUNT_FILE_PATH, JSON.stringify(accountData, null, 2), "utf-8");
  } catch (err) {
    console.error("Error saving adminAccount.json:", err);
    throw new Error("فشل حفظ بيانات الحساب في الخادم");
  }

  return accountData;
}

/**
 * Verify against the single admin account using timing-safe comparison
 */
export function verifyAdminCredentials(inputEmail: string, inputPass: string): boolean {
  if (!inputEmail || !inputPass) return false;
  const current = getAdminAccount();
  const normalizedEmail = String(inputEmail).trim().toLowerCase();
  const normalizedPass = String(inputPass).trim();

  return (
    timingSafeCompare(normalizedEmail, current.email) &&
    timingSafeCompare(normalizedPass, current.password)
  );
}
