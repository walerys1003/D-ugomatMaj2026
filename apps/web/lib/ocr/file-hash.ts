/**
 * Plik → SHA-256 hash (do dedup + cache OCR).
 *
 * Działa zarówno w przeglądarce (Web Crypto API) jak i na serwerze
 * (node:crypto). Identyczny output → idempotentny cache key.
 */

export async function hashFile(file: File | Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  return hashArrayBuffer(buf);
}

export async function hashArrayBuffer(buf: ArrayBuffer): Promise<string> {
  // Browser path
  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    const digest = await globalThis.crypto.subtle.digest("SHA-256", buf);
    return bufferToHex(digest);
  }
  // Node path
  const { createHash } = await import("node:crypto");
  const h = createHash("sha256");
  h.update(Buffer.from(buf));
  return h.digest("hex");
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}
