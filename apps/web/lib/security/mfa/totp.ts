// TOTP (RFC 6238) — time-based one-time passwords for MFA. Zero external deps;
// uses Node's crypto for HMAC-SHA1. 30-second steps, 6-digit codes, drift ±1 step.

import { createHmac, randomBytes } from "crypto";

export interface TotpSecret {
  secret: string; // base32
  issuer: string;
  account: string;
  digits: number;
  period: number;
  algorithm: "SHA1" | "SHA256" | "SHA512";
}

const BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function generateSecret(account: string, issuer = "Długomat"): TotpSecret {
  const buf = randomBytes(20);
  return {
    secret: toBase32(buf),
    issuer,
    account,
    digits: 6,
    period: 30,
    algorithm: "SHA1",
  };
}

export function otpauthUrl(s: TotpSecret): string {
  const label = encodeURIComponent(`${s.issuer}:${s.account}`);
  const params = new URLSearchParams({
    secret: s.secret,
    issuer: s.issuer,
    algorithm: s.algorithm,
    digits: String(s.digits),
    period: String(s.period),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function generateTotp(secretBase32: string, atSec: number = Math.floor(Date.now() / 1000), period = 30, digits = 6): string {
  const counter = Math.floor(atSec / period);
  const key = fromBase32(secretBase32);
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac("sha1", key).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = bin % 10 ** digits;
  return String(code).padStart(digits, "0");
}

export function verifyTotp(token: string, secretBase32: string, drift = 1): boolean {
  const clean = token.replace(/\s+/g, "");
  const now = Math.floor(Date.now() / 1000);
  for (let i = -drift; i <= drift; i++) {
    const expected = generateTotp(secretBase32, now + i * 30);
    if (constantTimeEqual(expected, clean)) return true;
  }
  return false;
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toBase32(buf: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = "";
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) out += BASE32[(value << (5 - bits)) & 0x1f];
  return out;
}

function fromBase32(b32: string): Buffer {
  const clean = b32.replace(/=+$/g, "").toUpperCase();
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const c of clean) {
    const idx = BASE32.indexOf(c);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}
