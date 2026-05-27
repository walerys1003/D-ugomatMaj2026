/**
 * Tier 24 — Court e-filing adapter for Polish judicial e-services.
 *
 * Obsługiwane bramki (proxy do oficjalnych systemów):
 *  - EPU (Elektroniczne Postępowanie Upominawcze)        — Sąd Rejonowy Lublin-Zachód
 *  - PRS (Portal Rejestrów Sądowych)                     — wpisy do KRS
 *  - KRZ (Krajowy Rejestr Zadłużonych)                   — wnioski upadłościowe
 *  - PI  (Portal Informacyjny Sądów Powszechnych)        — wgląd w sprawy
 *
 * Każdy submission idzie przez nasz adapter `COURT_GATEWAY_URL` (mTLS).
 * Wynikiem jest:
 *  - tracking_id (nasz)
 *  - external_ref (sygnatura systemowa)
 *  - upp (urzędowe potwierdzenie przedłożenia, podpisane PDF/XML)
 */
import { randomUUID, createHash } from "crypto";
import { createServerSupabase } from "@/lib/db/supabase-server";

export type CourtSystem = "epu" | "prs" | "krz" | "pi";

export type CourtFilingStatus =
  | "draft"
  | "queued"
  | "submitted"
  | "accepted"
  | "rejected"
  | "responded"
  | "failed";

export interface CourtAttachment {
  filename: string;
  content_base64: string;
  mime_type: string;
  sha256?: string;
}

export interface CourtFilingInput {
  user_id: string;
  case_id?: string;
  system: CourtSystem;
  court_code: string; // e.g. "SR_LUBLIN_ZACHOD" or KRS court code
  pleading_type: string; // e.g. "sprzeciw_epu", "wniosek_upadlosc"
  parties: Array<{
    role: "powod" | "pozwany" | "wnioskodawca" | "uczestnik";
    full_name: string;
    pesel?: string;
    nip?: string;
    krs?: string;
    address?: string;
  }>;
  documents: CourtAttachment[];
  metadata?: Record<string, unknown>;
  signed_envelope?: string; // XAdES-BES from ePUAP / qualified signature
}

export interface CourtFilingRecord {
  id: string;
  user_id: string;
  case_id: string | null;
  system: CourtSystem;
  court_code: string;
  pleading_type: string;
  status: CourtFilingStatus;
  external_ref: string | null;
  upp_id: string | null;
  upp_url: string | null;
  parties: CourtFilingInput["parties"];
  attempts: number;
  error: string | null;
  created_at: string;
  submitted_at: string | null;
  accepted_at: string | null;
}

function gatewayUrl(): string {
  const u = process.env.COURT_GATEWAY_URL;
  if (!u) throw new Error("COURT_GATEWAY_URL not configured");
  return u.replace(/\/+$/, "");
}

function gatewayToken(): string {
  const t = process.env.COURT_GATEWAY_TOKEN;
  if (!t) throw new Error("COURT_GATEWAY_TOKEN not configured");
  return t;
}

function hashDocs(docs: CourtAttachment[]): CourtAttachment[] {
  return docs.map((d) => ({
    ...d,
    sha256: d.sha256 ?? createHash("sha256").update(Buffer.from(d.content_base64, "base64")).digest("hex"),
  }));
}

/**
 * Persist a draft filing record without yet submitting to the court system.
 * Caller flow:
 *   1. createDraft(...) → returns id
 *   2. user signs envelope via ePUAP / qualified sig
 *   3. submitFiling(id, signedEnvelope)
 */
export async function createDraft(input: CourtFilingInput): Promise<CourtFilingRecord> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const id = randomUUID();
  const docs = hashDocs(input.documents);
  const row = {
    id,
    user_id: input.user_id,
    case_id: input.case_id ?? null,
    system: input.system,
    court_code: input.court_code,
    pleading_type: input.pleading_type,
    parties: input.parties,
    document_hashes: docs.map((d) => ({ filename: d.filename, sha256: d.sha256 })),
    status: "draft" as CourtFilingStatus,
    metadata: input.metadata ?? {},
    attempts: 0,
    created_at: new Date().toISOString(),
  };
  await sb.from("court_filings").insert(row);
  return {
    ...row,
    external_ref: null,
    upp_id: null,
    upp_url: null,
    submitted_at: null,
    accepted_at: null,
    error: null,
  } as CourtFilingRecord;
}

export async function submitFiling(
  filingId: string,
  input: CourtFilingInput,
): Promise<CourtFilingRecord> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const now = new Date().toISOString();
  await sb.from("court_filings").update({ status: "queued", attempts: 0 }).eq("id", filingId);

  const docs = hashDocs(input.documents);
  let resp: Response;
  try {
    resp = await fetch(`${gatewayUrl()}/v1/${input.system}/submit`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${gatewayToken()}`,
        "content-type": "application/json",
        "X-Court-Filing-Id": filingId,
      },
      body: JSON.stringify({
        court_code: input.court_code,
        pleading_type: input.pleading_type,
        parties: input.parties,
        documents: docs,
        signed_envelope: input.signed_envelope,
        metadata: input.metadata,
      }),
      signal: AbortSignal.timeout(60_000),
    });
  } catch (e) {
    await sb
      .from("court_filings")
      .update({ status: "failed", error: String(e).slice(0, 500), attempts: 1 })
      .eq("id", filingId);
    throw e;
  }

  const j: any = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    await sb
      .from("court_filings")
      .update({
        status: "rejected",
        attempts: 1,
        error: j?.error ?? `gateway_${resp.status}`,
      })
      .eq("id", filingId);
    throw new Error(`court_${resp.status}: ${j?.error ?? ""}`);
  }

  await sb
    .from("court_filings")
    .update({
      status: "submitted",
      external_ref: j.external_ref ?? null,
      submitted_at: now,
      attempts: 1,
    })
    .eq("id", filingId);

  return {
    ...(await getFiling(filingId))!,
  };
}

export async function getFiling(filingId: string): Promise<CourtFilingRecord | null> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const { data } = await sb.from("court_filings").select("*").eq("id", filingId).maybeSingle();
  return (data as any) ?? null;
}

export async function listFilings(opts: {
  user_id?: string;
  case_id?: string;
  status?: CourtFilingStatus;
  limit?: number;
}): Promise<CourtFilingRecord[]> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  let q = sb.from("court_filings").select("*").order("created_at", { ascending: false });
  if (opts.user_id) q = q.eq("user_id", opts.user_id);
  if (opts.case_id) q = q.eq("case_id", opts.case_id);
  if (opts.status) q = q.eq("status", opts.status);
  q = q.limit(opts.limit ?? 50);
  const { data } = await q;
  return (data as any) ?? [];
}

/**
 * Poll the court gateway for updated status (called by cron / job runner).
 */
export async function refreshStatus(filingId: string): Promise<CourtFilingRecord | null> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const filing = await getFiling(filingId);
  if (!filing || !filing.external_ref) return filing;
  const r = await fetch(
    `${gatewayUrl()}/v1/${filing.system}/status/${encodeURIComponent(filing.external_ref)}`,
    { headers: { authorization: `Bearer ${gatewayToken()}` } },
  );
  if (!r.ok) return filing;
  const j: any = await r.json();
  const update: Partial<CourtFilingRecord> = {
    status: mapStatus(j.status),
  };
  if (j.upp_id) {
    update.upp_id = j.upp_id;
    update.upp_url = j.upp_url ?? null;
  }
  if (j.status === "accepted" && !filing.accepted_at) {
    update.accepted_at = new Date().toISOString();
  }
  await sb.from("court_filings").update(update).eq("id", filingId);
  return getFiling(filingId);
}

function mapStatus(s: string): CourtFilingStatus {
  if (s === "accepted" || s === "received") return "accepted";
  if (s === "rejected") return "rejected";
  if (s === "responded") return "responded";
  if (s === "submitted" || s === "queued") return "submitted";
  return "submitted";
}

/**
 * Convenience: end-to-end submit (draft → sign → submit) when caller already
 * has a signed envelope. Idempotent on (user_id, case_id, pleading_type) via
 * fingerprinting the document set.
 */
export async function submitOneShot(input: CourtFilingInput): Promise<CourtFilingRecord> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const fp = createHash("sha256")
    .update(JSON.stringify({ u: input.user_id, c: input.case_id, p: input.pleading_type, d: hashDocs(input.documents).map((d) => d.sha256) }))
    .digest("hex")
    .slice(0, 24);
  const existing = await sb
    .from("court_filings")
    .select("*")
    .eq("user_id", input.user_id)
    .eq("idempotency_key", fp)
    .maybeSingle();
  if (existing.data) return existing.data as any;
  const draft = await createDraft(input);
  await sb.from("court_filings").update({ idempotency_key: fp }).eq("id", draft.id);
  return submitFiling(draft.id, input);
}

export const COURT_SYSTEMS_META: Record<
  CourtSystem,
  { name: string; description: string; max_doc_mb: number; allowed_mime: string[] }
> = {
  epu: {
    name: "EPU – Elektroniczne Postępowanie Upominawcze",
    description: "Sąd Rejonowy Lublin-Zachód, sprzeciwy od nakazów Nc-e.",
    max_doc_mb: 5,
    allowed_mime: ["application/pdf", "application/xml"],
  },
  prs: {
    name: "PRS – Portal Rejestrów Sądowych",
    description: "Zmiany w KRS, wpisy do rejestru przedsiębiorców.",
    max_doc_mb: 15,
    allowed_mime: ["application/pdf"],
  },
  krz: {
    name: "KRZ – Krajowy Rejestr Zadłużonych",
    description: "Wnioski o upadłość konsumencką, restrukturyzacje.",
    max_doc_mb: 25,
    allowed_mime: ["application/pdf", "application/xml"],
  },
  pi: {
    name: "PI – Portal Informacyjny Sądów Powszechnych",
    description: "Wgląd w akta sprawy, status postępowania.",
    max_doc_mb: 0,
    allowed_mime: [],
  },
};
