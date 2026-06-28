import "server-only";

/**
 * Tier 5 / zad. 205 — File upload security scan.
 *
 * Dwa poziomy walidacji uploadowanych plików (OCR, dokumenty wsparte
 * przez generację pism):
 *
 *   1) MAGIC BYTES — sprawdzenie pierwszych N bajtów pliku przeciw
 *      białej liście podpisów (PDF, JPEG, PNG, WEBP, TIFF). Zapobiega
 *      atakom typu "polyglot" (plik nazywa się .pdf, ale jest .exe)
 *      i odrzuca podstawowe MIME-spoofing.
 *
 *   2) CLAMAV — opcjonalne skanowanie antywirusowe. Wymaga osiągalnej
 *      instancji clamd (TCP) lub HTTP shim. Jeżeli ENV `CLAMAV_HOST`
 *      nie jest skonfigurowany, skanowanie jest pomijane (graceful
 *      degradation, ale logowane jako WARN). W produkcji REQUIRE_CLAMAV=true
 *      sprawia, że brak skanera blokuje upload (fail-closed).
 *
 * Zwracany rezultat zawsze zawiera:
 *   - ok: boolean   — czy plik przeszedł obie kontrole
 *   - reason: string | null  — kod odrzucenia (do telemetrii)
 *   - detectedType: 'pdf' | 'jpeg' | 'png' | 'webp' | 'tiff' | 'unknown'
 *   - clamScan: { ran: boolean; clean: boolean | null; signature?: string }
 */

export type AllowedFileType = "pdf" | "jpeg" | "png" | "webp" | "tiff";
export type DetectedFileType = AllowedFileType | "unknown";

export interface FileScanResult {
  ok: boolean;
  reason: string | null;
  detectedType: DetectedFileType;
  declaredMime: string;
  size: number;
  clamScan: ClamScanResult;
}

export interface ClamScanResult {
  ran: boolean;
  clean: boolean | null;
  signature?: string | null;
  error?: string | null;
}

export interface FileScanOptions {
  /** Deklarowany MIME (np. z multipart). Tylko do logowania spójności. */
  declaredMime?: string;
  /** Nazwa pliku (do błędów / logów). */
  fileName?: string;
  /** Limit bajtów. Default 20 MiB. */
  maxBytes?: number;
  /** Lista dozwolonych typów (default: pdf, jpeg, png, tiff). */
  allowedTypes?: AllowedFileType[];
  /** Wymuś skan ClamAV — gdy nie udało się, zwróć ok=false. */
  requireClamAv?: boolean;
}

const DEFAULT_MAX_BYTES = 20 * 1024 * 1024; // 20 MiB
const DEFAULT_ALLOWED: AllowedFileType[] = ["pdf", "jpeg", "png", "tiff"];

/* -------------------------------------------------------------------- */
/* Magic-byte detection                                                 */
/* -------------------------------------------------------------------- */

/**
 * Wykrywa typ pliku na podstawie pierwszych bajtów. Zwraca 'unknown' jeśli
 * żaden ze wspieranych podpisów nie pasuje.
 *
 * Sygnatury (źródło: https://en.wikipedia.org/wiki/List_of_file_signatures):
 *   PDF  : 25 50 44 46 2D            ("%PDF-")
 *   JPEG : FF D8 FF
 *   PNG  : 89 50 4E 47 0D 0A 1A 0A
 *   WEBP : 52 49 46 46 ?? ?? ?? ?? 57 45 42 50  ("RIFF....WEBP")
 *   TIFF : 49 49 2A 00  (little-endian)  lub  4D 4D 00 2A  (big-endian)
 */
export function detectFileType(buf: Uint8Array): DetectedFileType {
  if (buf.length < 8) return "unknown";

  // PDF
  if (
    buf[0] === 0x25 &&
    buf[1] === 0x50 &&
    buf[2] === 0x44 &&
    buf[3] === 0x46 &&
    buf[4] === 0x2d
  ) {
    return "pdf";
  }

  // JPEG (SOI + APP marker)
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) {
    return "jpeg";
  }

  // PNG
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47 &&
    buf[4] === 0x0d &&
    buf[5] === 0x0a &&
    buf[6] === 0x1a &&
    buf[7] === 0x0a
  ) {
    return "png";
  }

  // WEBP — RIFF...WEBP
  if (
    buf.length >= 12 &&
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  ) {
    return "webp";
  }

  // TIFF (II*\0 lub MM\0*)
  if (
    (buf[0] === 0x49 &&
      buf[1] === 0x49 &&
      buf[2] === 0x2a &&
      buf[3] === 0x00) ||
    (buf[0] === 0x4d &&
      buf[1] === 0x4d &&
      buf[2] === 0x00 &&
      buf[3] === 0x2a)
  ) {
    return "tiff";
  }

  return "unknown";
}

/**
 * Mapuje wykryty typ na canonical MIME. Używane do walidacji spójności
 * z deklarowanym Content-Type w multipart upload.
 */
export function canonicalMimeFor(t: DetectedFileType): string {
  switch (t) {
    case "pdf":
      return "application/pdf";
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "tiff":
      return "image/tiff";
    default:
      return "application/octet-stream";
  }
}

/* -------------------------------------------------------------------- */
/* ClamAV — TCP INSTREAM client (RFC clamd protocol)                    */
/* -------------------------------------------------------------------- */

export class ClamAvUnavailableError extends Error {
  constructor(message = "ClamAV nie jest skonfigurowany.") {
    super(message);
    this.name = "ClamAvUnavailableError";
  }
}

export function isClamAvAvailable(): boolean {
  return !!process.env.CLAMAV_HOST;
}

/**
 * Skanuje bufor przez clamd używając protokołu INSTREAM:
 *   zINSTREAM\0
 *   <chunk_len:uint32 BE><chunk_bytes>
 *   <0:uint32 BE>
 * Zwraca:
 *   "stream: OK\0"                  — czysty
 *   "stream: <Sig> FOUND\0"         — wykryto wirusa
 *   "stream: <error>\0"             — błąd skanera
 *
 * Wymaga env:
 *   CLAMAV_HOST  (np. "clamav" w sieci docker, "clamd.internal" w VPC)
 *   CLAMAV_PORT  (default 3310)
 *   CLAMAV_TIMEOUT_MS (default 10000)
 *
 * Implementacja używa node:net (TCP socket) — działa wyłącznie w runtime
 * `nodejs`, nie w edge.
 */
export async function clamAvScan(
  buf: Uint8Array,
): Promise<ClamScanResult> {
  if (!isClamAvAvailable()) {
    throw new ClamAvUnavailableError();
  }
  const host = process.env.CLAMAV_HOST!;
  const port = Number(process.env.CLAMAV_PORT ?? 3310);
  const timeoutMs = Number(process.env.CLAMAV_TIMEOUT_MS ?? 10_000);

  // Lazy import — żeby moduł działał w edge runtime (gdy clamav off).
  const net = await import("node:net");

  return await new Promise<ClamScanResult>((resolve) => {
    const socket = new net.Socket();
    let response = "";
    let settled = false;

    const finish = (r: ClamScanResult) => {
      if (settled) return;
      settled = true;
      try {
        socket.destroy();
      } catch {
        /* noop */
      }
      resolve(r);
    };

    socket.setTimeout(timeoutMs);
    socket.on("timeout", () =>
      finish({
        ran: false,
        clean: null,
        error: `clamav_timeout_${timeoutMs}ms`,
      }),
    );
    socket.on("error", (err) =>
      finish({
        ran: false,
        clean: null,
        error: `clamav_socket_error:${err.message}`,
      }),
    );
    socket.on("data", (chunk) => {
      response += chunk.toString("utf8");
    });
    socket.on("close", () => {
      const text = response.replace(/\0+$/, "");
      // Possible answers:
      //   "stream: OK"
      //   "stream: <Signature> FOUND"
      //   "stream: <error>"
      if (/:\s*OK$/.test(text)) {
        finish({ ran: true, clean: true, signature: null });
        return;
      }
      const m = /:\s*(.+?)\s+FOUND/.exec(text);
      if (m) {
        finish({ ran: true, clean: false, signature: m[1] });
        return;
      }
      finish({
        ran: true,
        clean: null,
        error: `clamav_unparseable:${text.slice(0, 80)}`,
      });
    });

    socket.connect(port, host, () => {
      try {
        socket.write("zINSTREAM\0");
        // Wysyłamy całość jako jeden chunk (do 100 MB to bezpieczne).
        const lenBuf = Buffer.alloc(4);
        lenBuf.writeUInt32BE(buf.length, 0);
        socket.write(lenBuf);
        socket.write(Buffer.from(buf));
        const zero = Buffer.alloc(4); // terminator
        socket.write(zero);
      } catch (e) {
        finish({
          ran: false,
          clean: null,
          error: `clamav_write_error:${e instanceof Error ? e.message : String(e)}`,
        });
      }
    });
  });
}

/* -------------------------------------------------------------------- */
/* Public API                                                           */
/* -------------------------------------------------------------------- */

/**
 * Pełna walidacja uploadowanego pliku — magic bytes + ClamAV.
 *
 * Reasons (przy ok=false):
 *   - empty_file
 *   - too_large
 *   - mime_mismatch_or_unknown_type
 *   - type_not_allowed
 *   - clamav_required_but_unavailable
 *   - virus_detected
 *   - clamav_error
 */
export async function scanUploadedFile(
  data: Uint8Array | ArrayBuffer | Buffer,
  opts: FileScanOptions = {},
): Promise<FileScanResult> {
  // Note: in Node-typed TS `Buffer` extends `Uint8Array`, so after the first
  // two branches TS narrows the `else` to `never`. Cast back to Buffer for
  // the final branch — runtime behaviour is unchanged.
  const buf =
    data instanceof Uint8Array
      ? data
      : data instanceof ArrayBuffer
        ? new Uint8Array(data)
        : new Uint8Array(
            (data as Buffer).buffer,
            (data as Buffer).byteOffset,
            (data as Buffer).byteLength,
          );

  const declaredMime = opts.declaredMime ?? "application/octet-stream";
  const maxBytes = opts.maxBytes ?? DEFAULT_MAX_BYTES;
  const allowed = opts.allowedTypes ?? DEFAULT_ALLOWED;
  const requireClamAv =
    opts.requireClamAv ?? process.env.REQUIRE_CLAMAV === "true";

  const baseFail = (reason: string): FileScanResult => ({
    ok: false,
    reason,
    detectedType: "unknown",
    declaredMime,
    size: buf.length,
    clamScan: { ran: false, clean: null },
  });

  if (buf.length === 0) return baseFail("empty_file");
  if (buf.length > maxBytes) return baseFail("too_large");

  // 1) Magic-byte check
  const detected = detectFileType(buf);
  if (detected === "unknown") {
    return baseFail("mime_mismatch_or_unknown_type");
  }
  if (!allowed.includes(detected as AllowedFileType)) {
    return {
      ...baseFail("type_not_allowed"),
      detectedType: detected,
    };
  }

  // Spójność z declared MIME (best-effort — niektóre browsery
  // pomijają lub używają nieprawidłowego MIME). Logujemy niespójność,
  // ale nie blokujemy uploadu, jeśli magic bytes się zgadzają.
  const canonical = canonicalMimeFor(detected);
  if (
    declaredMime &&
    declaredMime !== "application/octet-stream" &&
    declaredMime !== canonical &&
    // JPEG ma kilka aliasów
    !(detected === "jpeg" && /^image\/(jpeg|jpg|pjpeg)$/.test(declaredMime))
  ) {
    // Tylko log; nie zatrzymujemy.
    console.warn(
      `[file-scan] declared MIME (${declaredMime}) ≠ detected (${canonical}); ` +
        `file=${opts.fileName ?? "?"}`,
    );
  }

  // 2) ClamAV
  let clamScan: ClamScanResult = { ran: false, clean: null };
  if (isClamAvAvailable()) {
    try {
      clamScan = await clamAvScan(buf);
    } catch (e) {
      clamScan = {
        ran: false,
        clean: null,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  } else if (requireClamAv) {
    return {
      ok: false,
      reason: "clamav_required_but_unavailable",
      detectedType: detected,
      declaredMime,
      size: buf.length,
      clamScan,
    };
  }

  if (clamScan.ran && clamScan.clean === false) {
    return {
      ok: false,
      reason: "virus_detected",
      detectedType: detected,
      declaredMime,
      size: buf.length,
      clamScan,
    };
  }
  if (requireClamAv && (!clamScan.ran || clamScan.clean !== true)) {
    return {
      ok: false,
      reason: "clamav_error",
      detectedType: detected,
      declaredMime,
      size: buf.length,
      clamScan,
    };
  }

  return {
    ok: true,
    reason: null,
    detectedType: detected,
    declaredMime,
    size: buf.length,
    clamScan,
  };
}
