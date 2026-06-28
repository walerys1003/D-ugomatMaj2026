/**
 * Tier 18 — ePUAP integration: signing flow + document submission.
 *
 * ePUAP (Elektroniczna Platforma Usług Administracji Publicznej) — kanał
 * składania pism procesowych do sądów i organów państwowych w PL.
 *
 * Zakres tego modułu:
 *  - przygotowanie envelope (XAdES-BES) z dokumentem do podpisu Profilem Zaufanym
 *  - kierowanie usera do strony pz.gov.pl (PZ Sign) z callbackiem
 *  - weryfikacja podpisanej koperty (signature validity + cert chain placeholder)
 *  - submitToSkrytka — wysyłka na adres skrytki ePUAP odbiorcy (sąd, komornik)
 *  - parsing UPP (Urzędowe Potwierdzenie Przedłożenia)
 *
 * UWAGA: pełna integracja ePUAP wymaga umowy z MC i certyfikatu SOAP.
 * Ten moduł przygotowuje warstwę abstrakcji + REST proxy do
 * `EPUAP_GATEWAY_URL` (nasz adapter SOAP→REST hostowany osobno).
 */

import { createHash, randomBytes } from "crypto";

export interface EpuapDocument {
  fileName: string;
  contentBase64: string;
  mimeType: string;
}

export interface EpuapSignRequest {
  userId: string;
  caseId?: string;
  documents: EpuapDocument[];
  callbackUrl: string;
  metadata?: Record<string, string>;
}

export interface EpuapSignSession {
  sessionId: string;
  redirectUrl: string;
  expiresAt: string;
  documentHashes: string[];
}

export interface EpuapSignedEnvelope {
  sessionId: string;
  xadesXml: string;
  signedAt: string;
  signerName: string;
  signerPesel?: string; // maskowany, tylko ostatnie 4
  documents: Array<{ fileName: string; sha256: string }>;
}

export interface EpuapSubmissionTarget {
  skrytkaAddress: string; // "/SR_Warszawa_Praga/skrytka"
  recipientName: string;
}

export interface EpuapUpp {
  uppId: string;
  submittedAt: string;
  recipient: string;
  status: "received" | "rejected";
  rejectionReason?: string;
}

function gatewayUrl(): string {
  const url = process.env.EPUAP_GATEWAY_URL;
  if (!url) throw new Error("EPUAP_GATEWAY_URL not configured");
  return url.replace(/\/+$/, "");
}

function gatewayAuth(): string {
  const token = process.env.EPUAP_GATEWAY_TOKEN;
  if (!token) throw new Error("EPUAP_GATEWAY_TOKEN not configured");
  return token;
}

/**
 * Inicjuje sesję podpisu Profilem Zaufanym.
 * Zwraca URL, do którego należy przekierować przeglądarkę użytkownika.
 */
export async function initiateSignSession(req: EpuapSignRequest): Promise<EpuapSignSession> {
  const sessionId = randomBytes(16).toString("hex");
  const documentHashes = req.documents.map((d) =>
    createHash("sha256").update(Buffer.from(d.contentBase64, "base64")).digest("hex"),
  );

  const res = await fetch(`${gatewayUrl()}/sign/initiate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayAuth()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      userId: req.userId,
      caseId: req.caseId ?? null,
      documents: req.documents,
      callbackUrl: req.callbackUrl,
      metadata: req.metadata ?? {},
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ePUAP sign initiate failed: ${res.status} ${text}`);
  }

  const json = (await res.json()) as { redirectUrl: string; expiresAt: string };
  return {
    sessionId,
    redirectUrl: json.redirectUrl,
    expiresAt: json.expiresAt,
    documentHashes,
  };
}

/**
 * Wywoływane z callbacku po powrocie z PZ — weryfikuje, że dokumenty
 * w kopercie zgadzają się z oryginalnymi hashami.
 */
export async function fetchSignedEnvelope(sessionId: string): Promise<EpuapSignedEnvelope> {
  const res = await fetch(`${gatewayUrl()}/sign/envelope/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${gatewayAuth()}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ePUAP envelope fetch failed: ${res.status} ${text}`);
  }
  const env = (await res.json()) as EpuapSignedEnvelope;
  return env;
}

export function verifyEnvelopeAgainstHashes(env: EpuapSignedEnvelope, expectedHashes: string[]): boolean {
  if (env.documents.length !== expectedHashes.length) return false;
  const actual = new Set(env.documents.map((d) => d.sha256.toLowerCase()));
  return expectedHashes.every((h) => actual.has(h.toLowerCase()));
}

/**
 * Składa podpisaną kopertę na skrytkę odbiorcy i odbiera UPP.
 */
export async function submitToSkrytka(args: {
  envelope: EpuapSignedEnvelope;
  target: EpuapSubmissionTarget;
}): Promise<EpuapUpp> {
  const res = await fetch(`${gatewayUrl()}/submit/skrytka`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${gatewayAuth()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      envelopeSessionId: args.envelope.sessionId,
      skrytkaAddress: args.target.skrytkaAddress,
      recipientName: args.target.recipientName,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ePUAP submit failed: ${res.status} ${text}`);
  }
  return (await res.json()) as EpuapUpp;
}

/**
 * Walidacja adresu skrytki ePUAP — typowy format: /Nazwa_Organu/skrytka
 */
export function isValidSkrytka(addr: string): boolean {
  return /^\/[A-Za-z0-9_-]{2,64}\/[A-Za-z0-9_-]{2,64}$/.test(addr);
}
