/**
 * Plik → SHA-256 hash (do dedup + cache OCR).
 *
 * Używa wyłącznie Web Crypto API (`crypto.subtle`) — dostępnego zarówno
 * w przeglądarce, jak i w Node 20+ (wymagane przez `engines` w package.json)
 * oraz w runtime Edge. Dzięki temu ten plik może być bezpiecznie importowany
 * przez komponenty klienckie (skaner OCR) — bez `node:crypto`, którego webpack
 * nie potrafi zbundlować dla przeglądarki (UnhandledSchemeError).
 */

export async function hashFile(file: File | Blob): Promise<string> {
  const buf = await file.arrayBuffer();
  return hashArrayBuffer(buf);
}

export async function hashArrayBuffer(buf: ArrayBuffer): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error(
      "Web Crypto API (crypto.subtle) niedostępne — wymagany Node 20+ lub nowoczesna przeglądarka.",
    );
  }
  const digest = await subtle.digest("SHA-256", buf);
  return bufferToHex(digest);
}

function bufferToHex(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}
