// Backup recovery codes — 10 single-use codes generated at MFA enrollment.
// Stored hashed (bcrypt-style argon2 with Node crypto scrypt fallback).

import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const CODE_GROUPS = 2;
const CODE_GROUP_LEN = 5;
const TOTAL_CODES = 10;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I/L confusion

export function generateBackupCodes(count = TOTAL_CODES): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const groups: string[] = [];
    for (let g = 0; g < CODE_GROUPS; g++) {
      let s = "";
      const buf = randomBytes(CODE_GROUP_LEN);
      for (let k = 0; k < CODE_GROUP_LEN; k++) s += ALPHABET[buf[k] % ALPHABET.length];
      groups.push(s);
    }
    codes.push(groups.join("-"));
  }
  return codes;
}

export function hashBackupCode(code: string): string {
  const salt = randomBytes(16);
  const key = scryptSync(code.toUpperCase(), salt, 32, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${key.toString("hex")}`;
}

export function verifyBackupCode(code: string, stored: string): boolean {
  const [scheme, saltHex, keyHex] = stored.split("$");
  if (scheme !== "scrypt") return false;
  try {
    const salt = Buffer.from(saltHex, "hex");
    const expected = Buffer.from(keyHex, "hex");
    const candidate = scryptSync(code.replace(/[\s-]/g, "").toUpperCase(), salt, expected.length, { N: 16384, r: 8, p: 1 });
    return candidate.length === expected.length && timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}
