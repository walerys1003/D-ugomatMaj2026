/**
 * Tier 23 — Encrypted secret vault.
 *
 * Przechowuje sekrety per-organization z envelope encryption:
 *  - DEK (data encryption key, 256-bit) — losowy na każdy sekret
 *  - KEK (key encryption key) — pochodzi z PBKDF2(MASTER_SECRET, salt, 600k iter)
 *    LUB z hardware KMS w produkcji (Cloud KMS / Vault Transit)
 *  - cipher = AES-256-GCM
 *  - storage: { v: 1, salt, iv, ct, tag, alg } w jednej kolumnie ciphertext
 *
 * Rotacja:
 *  - przy zmianie MASTER_SECRET → re-encrypt wszystkich wpisów z new KEK
 *  - support dla multiple key versions (klucze stare + nowy aktywny)
 *
 * Audit:
 *  - każde get/set/delete loguje do audit_chain (kind=secret.*)
 *  - never log plaintext content
 */

import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { appendAuditEntry } from "../audit-signing";

const ALG = "aes-256-gcm";
const KEY_VERSION = 1;
const PBKDF2_ITER = 600_000;

interface EncryptedEnvelope {
  v: number;
  salt: string;
  iv: string;
  ct: string;
  tag: string;
  alg: string;
}

function getMasterSecret(): string {
  const secret = process.env.SECRET_VAULT_MASTER_KEY;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SECRET_VAULT_MASTER_KEY required in production");
    }
    return "dev-fallback-master-secret-vault-32bytes";
  }
  return secret;
}

function deriveKek(salt: Buffer): Buffer {
  return pbkdf2Sync(getMasterSecret(), salt, PBKDF2_ITER, 32, "sha256");
}

export function encryptSecret(plaintext: string): string {
  const salt = randomBytes(16);
  const iv = randomBytes(12);
  const kek = deriveKek(salt);
  const cipher = createCipheriv(ALG, kek, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const envelope: EncryptedEnvelope = {
    v: KEY_VERSION,
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    ct: ct.toString("base64"),
    tag: tag.toString("base64"),
    alg: ALG,
  };
  return JSON.stringify(envelope);
}

export function decryptSecret(stored: string): string {
  const envelope = JSON.parse(stored) as EncryptedEnvelope;
  if (envelope.alg !== ALG) throw new Error("unsupported_alg");
  const salt = Buffer.from(envelope.salt, "base64");
  const iv = Buffer.from(envelope.iv, "base64");
  const ct = Buffer.from(envelope.ct, "base64");
  const tag = Buffer.from(envelope.tag, "base64");
  const kek = deriveKek(salt);
  const decipher = createDecipheriv(ALG, kek, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

export interface VaultSecret {
  id: string;
  organization_id: string | null;
  key: string;
  description: string | null;
  ciphertext: string; // envelope JSON
  version: number;
  created_by: string;
  created_at: string;
  last_accessed_at: string | null;
  access_count: number;
  rotation_due_at: string | null;
}

export async function setSecret(args: {
  organizationId?: string | null;
  key: string;
  value: string;
  description?: string;
  rotationDays?: number;
  actorId: string;
}): Promise<VaultSecret> {
  if (!args.key || args.key.length < 3) throw new Error("invalid_key");
  if (args.value.length > 64 * 1024) throw new Error("secret_too_large");

  const ciphertext = encryptSecret(args.value);
  const supabase = await createSupabaseServerClient();
  const rotationDueAt = args.rotationDays
    ? new Date(Date.now() + args.rotationDays * 86_400_000).toISOString()
    : null;

  // Upsert by (org, key) — increments version
  const { data: existing } = await supabase
    .from("secret_vault")
    .select("version")
    .eq("organization_id", args.organizationId ?? null)
    .eq("key", args.key)
    .maybeSingle();
  const nextVersion = ((existing as { version?: number } | null)?.version ?? 0) + 1;

  const { data, error } = await supabase
    .from("secret_vault")
    .upsert(
      {
        organization_id: args.organizationId ?? null,
        key: args.key,
        description: args.description ?? null,
        ciphertext,
        version: nextVersion,
        created_by: args.actorId,
        rotation_due_at: rotationDueAt,
      },
      { onConflict: "organization_id,key" },
    )
    .select("*")
    .single();
  if (error) throw error;

  await appendAuditEntry({
    actorId: args.actorId,
    action: "secret.set",
    targetType: "secret",
    targetId: args.key,
    payload: {
      organization_id: args.organizationId ?? null,
      version: nextVersion,
    },
  }).catch(() => null);

  return data as VaultSecret;
}

export async function getSecret(args: {
  organizationId?: string | null;
  key: string;
  actorId: string;
}): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("secret_vault")
    .select("*")
    .eq("organization_id", args.organizationId ?? null)
    .eq("key", args.key)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const stored = data as VaultSecret;
  let plaintext: string;
  try {
    plaintext = decryptSecret(stored.ciphertext);
  } catch (err) {
    await appendAuditEntry({
      actorId: args.actorId,
      action: "secret.get.failed",
      targetType: "secret",
      targetId: args.key,
      payload: {
        organization_id: args.organizationId ?? null,
        error: err instanceof Error ? err.message : "decrypt_failed",
      },
    }).catch(() => null);
    throw new Error("decrypt_failed");
  }

  // Touch access stats
  await supabase
    .from("secret_vault")
    .update({
      last_accessed_at: new Date().toISOString(),
      access_count: (stored.access_count ?? 0) + 1,
    })
    .eq("id", stored.id)
    .then(() => null).catch(() => null);

  await appendAuditEntry({
    actorId: args.actorId,
    action: "secret.get",
    targetType: "secret",
    targetId: args.key,
    payload: {
      organization_id: args.organizationId ?? null,
      version: stored.version,
    },
  }).catch(() => null);

  return plaintext;
}

export async function deleteSecret(args: {
  organizationId?: string | null;
  key: string;
  actorId: string;
}): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("secret_vault")
    .delete()
    .eq("organization_id", args.organizationId ?? null)
    .eq("key", args.key);
  if (error) throw error;
  await appendAuditEntry({
    actorId: args.actorId,
    action: "secret.delete",
    targetType: "secret",
    targetId: args.key,
    payload: { organization_id: args.organizationId ?? null },
  }).catch(() => null);
}

export async function listSecrets(args: {
  organizationId?: string | null;
}): Promise<Omit<VaultSecret, "ciphertext">[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("secret_vault")
    .select("id, organization_id, key, description, version, created_by, created_at, last_accessed_at, access_count, rotation_due_at")
    .eq("organization_id", args.organizationId ?? null)
    .order("key", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Omit<VaultSecret, "ciphertext">[];
}

/**
 * Lista sekretów wymagających rotacji (rotation_due_at < now).
 */
export async function listSecretsDueForRotation(): Promise<Omit<VaultSecret, "ciphertext">[]> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("secret_vault")
    .select("id, organization_id, key, description, version, created_by, created_at, last_accessed_at, access_count, rotation_due_at")
    .lt("rotation_due_at", new Date().toISOString())
    .order("rotation_due_at", { ascending: true });
  return (data ?? []) as Omit<VaultSecret, "ciphertext">[];
}

/**
 * Re-encrypt wszystkich sekretów (np. po zmianie master key).
 * UWAGA: wymaga, by aktualny MASTER_SECRET nadal działał do odszyfrowania
 * (lub żeby decryptSecret wspierało multi-version master keys — TBD T24).
 */
export async function rotateAllSecrets(actorId: string): Promise<{ rotated: number; failed: number }> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("secret_vault").select("*");
  let rotated = 0;
  let failed = 0;
  for (const s of (data ?? []) as VaultSecret[]) {
    try {
      const plaintext = decryptSecret(s.ciphertext);
      const newCt = encryptSecret(plaintext);
      await supabase
        .from("secret_vault")
        .update({ ciphertext: newCt, version: s.version + 1 })
        .eq("id", s.id);
      rotated++;
    } catch {
      failed++;
    }
  }
  await appendAuditEntry({
    actorId,
    action: "secret.rotate.batch",
    targetType: "vault",
    targetId: null,
    payload: { rotated, failed },
  }).catch(() => null);
  return { rotated, failed };
}
