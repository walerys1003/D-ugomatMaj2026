// Field-level encryption — AES-256-GCM with per-row IV. Uses a master key from
// env (KMS-style key wrapping is the next step). Encrypted columns store
// `v1:<iv_hex>:<ciphertext_hex>:<tag_hex>`.

import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGO = "aes-256-gcm";
const IV_LEN = 12;
const TAG_LEN = 16;
const FORMAT_VERSION = "v1";

function loadKey(): Buffer {
  const k = process.env.DLUGOMAT_FIELD_KEY;
  if (!k) {
    // Soft fallback for local dev — derived from a fixed string; production must set env.
    return createHash("sha256").update("dlugomat-dev-field-key-do-not-use-in-prod").digest();
  }
  if (k.length === 64) return Buffer.from(k, "hex"); // 32-byte hex
  return createHash("sha256").update(k).digest();
}

export function encryptField(plaintext: string): string {
  if (plaintext == null) return plaintext as any;
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv(ALGO, loadKey(), iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${FORMAT_VERSION}:${iv.toString("hex")}:${ct.toString("hex")}:${tag.toString("hex")}`;
}

export function decryptField(payload: string): string {
  if (payload == null) return payload as any;
  const parts = payload.split(":");
  if (parts.length !== 4 || parts[0] !== FORMAT_VERSION) {
    throw new Error("unsupported_field_format");
  }
  const iv = Buffer.from(parts[1], "hex");
  const ct = Buffer.from(parts[2], "hex");
  const tag = Buffer.from(parts[3], "hex");
  const decipher = createDecipheriv(ALGO, loadKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
}

export function isEncrypted(payload: string | null | undefined): boolean {
  if (!payload) return false;
  return payload.startsWith(`${FORMAT_VERSION}:`) && payload.split(":").length === 4;
}

// Deterministic search index — HMAC of the plaintext for equality lookups
// without leaking content. NOT reversible; use only for exact-match search.
export function indexHash(plaintext: string): string {
  const k = loadKey();
  return createHash("sha256")
    .update(Buffer.concat([k, Buffer.from(plaintext, "utf8")]))
    .digest("hex");
}
