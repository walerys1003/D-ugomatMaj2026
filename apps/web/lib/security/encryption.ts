import "server-only";

/**
 * Tier 5 / zad. 207 — Encryption-at-rest helpers.
 *
 * Wraps pgcrypto SQL functions (`fn_set_encryption_key`, `fn_encrypt_pii`,
 * `fn_decrypt_pii`) for use w server actions / API routes. Klucz pochodzi z
 * env `DB_ENCRYPTION_KEY` (≥ 32 znaki) — nie persystowany ani w bazie ani
 * w migracjach.
 *
 * Wzorzec użycia (np. server action zapisujący PESEL):
 *
 *   const supabase = createSupabaseAdminClient();
 *   await primeEncryptionKey(supabase);
 *   const { data } = await supabase.rpc("fn_encrypt_pii", { p_plain: pesel });
 *   await supabase.from("cases").update({ pozwany_pesel_enc: data }).eq(...);
 *
 * Lub helper one-liner: `encryptPiiWith(supabase, "12345678901")`.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";

export class EncryptionConfigError extends Error {
  constructor(message = "DB_ENCRYPTION_KEY nie jest skonfigurowany lub jest za krótki (min 32 znaki).") {
    super(message);
    this.name = "EncryptionConfigError";
  }
}

export class EncryptionFailure extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EncryptionFailure";
  }
}

function getKey(): string {
  const key = process.env.DB_ENCRYPTION_KEY;
  if (!key || key.length < 32) {
    throw new EncryptionConfigError();
  }
  return key;
}

export function isEncryptionAvailable(): boolean {
  const key = process.env.DB_ENCRYPTION_KEY;
  return !!key && key.length >= 32;
}

/**
 * Wstrzykuje klucz do bieżącej sesji DB. Należy wywołać raz po utworzeniu
 * klienta, zanim użyjemy `fn_encrypt_pii` / `fn_decrypt_pii` lub widoku
 * `cases_decrypted`.
 *
 * UWAGA: Supabase JS client zazwyczaj używa connection pool — ustawienie
 * jest per-request (PG session) ale przy keepalive może przetrwać między
 * requestami. Dlatego prime'ujemy zawsze przed użyciem (idempotent).
 */
export async function primeEncryptionKey(
  supabase: SupabaseClient,
): Promise<void> {
  const key = getKey();
  const { error } = await supabase.rpc("fn_set_encryption_key", {
    p_key: key,
  });
  if (error) {
    throw new EncryptionFailure(
      `fn_set_encryption_key failed: ${error.message}`,
    );
  }
}

/**
 * Szyfruje plaintext PII na bytea. Zwraca surowy hex string `\\x...`
 * gotowy do przekazania jako bytea w insert/update.
 *
 * Plaintext NULL / "" → return null (dla wygody UPSERT-ów).
 */
export async function encryptPii(
  supabase: SupabaseClient,
  plaintext: string | null | undefined,
): Promise<string | null> {
  if (plaintext == null) return null;
  const trimmed = plaintext.trim();
  if (trimmed.length === 0) return null;
  await primeEncryptionKey(supabase);
  const { data, error } = await supabase.rpc("fn_encrypt_pii", {
    p_plain: trimmed,
  });
  if (error) {
    throw new EncryptionFailure(`fn_encrypt_pii failed: ${error.message}`);
  }
  return (data as string | null) ?? null;
}

/**
 * Deszyfruje bytea (przekazane jako hex `\\x...` lub buffer) → plaintext.
 * Zwraca null dla NULL/empty inputu. Błąd kryptograficzny (zły klucz,
 * uszkodzony cipher) → rzuca `EncryptionFailure`.
 */
export async function decryptPii(
  supabase: SupabaseClient,
  cipher: string | Uint8Array | null | undefined,
): Promise<string | null> {
  if (cipher == null) return null;
  if (typeof cipher === "string" && cipher.length === 0) return null;
  await primeEncryptionKey(supabase);
  const { data, error } = await supabase.rpc("fn_decrypt_pii", {
    p_cipher: cipher,
  });
  if (error) {
    throw new EncryptionFailure(`fn_decrypt_pii failed: ${error.message}`);
  }
  return (data as string | null) ?? null;
}

/**
 * Convenience helper — szyfruje PII bez ręcznego stworzenia klienta.
 * Używa service-role (bypass RLS) — wywoływać tylko z server actions /
 * route handlerów po walidacji uprawnień.
 */
export async function encryptPiiAdmin(
  plaintext: string | null | undefined,
): Promise<string | null> {
  const supabase = createSupabaseAdminClient();
  return encryptPii(supabase as unknown as SupabaseClient, plaintext);
}

/**
 * Walidacja PESEL (11 cyfr + checksum). Nie szyfrujemy gdy jest błędny —
 * zapobiega zapisaniu śmieci do bytea kolumny.
 */
export function isValidPesel(pesel: string): boolean {
  if (!/^\d{11}$/.test(pesel)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i += 1) {
    sum += Number(pesel[i]) * weights[i];
  }
  const control = (10 - (sum % 10)) % 10;
  return control === Number(pesel[10]);
}

/**
 * Walidacja NIP (10 cyfr + checksum).
 */
export function isValidNip(nip: string): boolean {
  const cleaned = nip.replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(cleaned)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i += 1) {
    sum += Number(cleaned[i]) * weights[i];
  }
  const control = sum % 11;
  return control < 10 && control === Number(cleaned[9]);
}
