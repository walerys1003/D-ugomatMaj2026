// Zero-knowledge envelope encryption for sensitive documents.
// Server stores ciphertext + per-doc wrapped DEK; the DEK is wrapped with the
// user's KEK derived client-side from a password+salt (PBKDF2). The server
// CANNOT decrypt — it never sees the password or the unwrapped DEK.
//
// Wire format (server-stored): { v, ct_iv, ct, ct_tag, dek_iv, dek_wrapped, dek_tag, kdf_salt, kdf_iterations }.

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from "crypto";

export interface ZkEnvelope {
  v: 1;
  ct_iv: string;
  ct: string;
  ct_tag: string;
  dek_iv: string;
  dek_wrapped: string;
  dek_tag: string;
  kdf_salt: string;
  kdf_iterations: number;
}

const KDF_ITERATIONS = 600_000;

// CLIENT-SIDE helpers (would run in browser; included here for completeness/testing).
// In production the browser uses Web Crypto API; this Node version is used only for
// unit tests and server-side helpers (e.g. validating envelope structure).

export function deriveKek(password: string, saltHex?: string): { kek: Buffer; salt: string } {
  const salt = saltHex ? Buffer.from(saltHex, "hex") : randomBytes(16);
  const kek = pbkdf2Sync(password, salt, KDF_ITERATIONS, 32, "sha256");
  return { kek, salt: salt.toString("hex") };
}

export function encryptDocument(plaintext: Buffer, password: string): ZkEnvelope {
  const dek = randomBytes(32);
  const { kek, salt } = deriveKek(password);

  const ctIv = randomBytes(12);
  const ctCipher = createCipheriv("aes-256-gcm", dek, ctIv);
  const ct = Buffer.concat([ctCipher.update(plaintext), ctCipher.final()]);
  const ctTag = ctCipher.getAuthTag();

  const dekIv = randomBytes(12);
  const dekCipher = createCipheriv("aes-256-gcm", kek, dekIv);
  const dekWrapped = Buffer.concat([dekCipher.update(dek), dekCipher.final()]);
  const dekTag = dekCipher.getAuthTag();

  return {
    v: 1,
    ct_iv: ctIv.toString("hex"),
    ct: ct.toString("base64"),
    ct_tag: ctTag.toString("hex"),
    dek_iv: dekIv.toString("hex"),
    dek_wrapped: dekWrapped.toString("hex"),
    dek_tag: dekTag.toString("hex"),
    kdf_salt: salt,
    kdf_iterations: KDF_ITERATIONS,
  };
}

export function decryptDocument(env: ZkEnvelope, password: string): Buffer {
  const { kek } = deriveKek(password, env.kdf_salt);
  const dekDecipher = createDecipheriv("aes-256-gcm", kek, Buffer.from(env.dek_iv, "hex"));
  dekDecipher.setAuthTag(Buffer.from(env.dek_tag, "hex"));
  const dek = Buffer.concat([dekDecipher.update(Buffer.from(env.dek_wrapped, "hex")), dekDecipher.final()]);

  const ctDecipher = createDecipheriv("aes-256-gcm", dek, Buffer.from(env.ct_iv, "hex"));
  ctDecipher.setAuthTag(Buffer.from(env.ct_tag, "hex"));
  return Buffer.concat([ctDecipher.update(Buffer.from(env.ct, "base64")), ctDecipher.final()]);
}

// Validate envelope structure server-side (without ever decrypting).
export function isValidEnvelope(x: unknown): x is ZkEnvelope {
  if (!x || typeof x !== "object") return false;
  const e = x as Record<string, unknown>;
  return (
    e.v === 1 &&
    typeof e.ct_iv === "string" &&
    typeof e.ct === "string" &&
    typeof e.ct_tag === "string" &&
    typeof e.dek_iv === "string" &&
    typeof e.dek_wrapped === "string" &&
    typeof e.dek_tag === "string" &&
    typeof e.kdf_salt === "string" &&
    typeof e.kdf_iterations === "number" &&
    e.kdf_iterations >= 100_000
  );
}
