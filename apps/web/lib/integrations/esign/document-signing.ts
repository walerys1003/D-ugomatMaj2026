/**
 * Tier 12 — E-signing abstraction (Autenti / SimplySign / DocuSign / built-in qualified signature placeholder).
 */
import { randomUUID } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type ESignProvider = "autenti" | "simplysign" | "docusign" | "internal";
export type ESignStatus = "draft" | "sent" | "viewed" | "signed" | "declined" | "expired";

export interface SignatureRequest {
  id: string;
  user_id: string;
  document_id: string;
  provider: ESignProvider;
  signers: { email: string; name: string; role?: string }[];
  status: ESignStatus;
  provider_ref?: string;
  signed_pdf_url?: string;
  expires_at?: string;
}

export interface ESignAdapter {
  send(req: { document_url: string; signers: SignatureRequest["signers"]; subject?: string; message?: string }): Promise<{
    provider_ref: string;
    signing_url?: string;
  }>;
  fetchStatus(providerRef: string): Promise<{ status: ESignStatus; signed_pdf_url?: string }>;
}

class InternalAdapter implements ESignAdapter {
  async send(req: Parameters<ESignAdapter["send"]>[0]) {
    return { provider_ref: `internal_${randomUUID().slice(0, 8)}`, signing_url: `/sign/${randomUUID()}` };
  }
  async fetchStatus() {
    return { status: "sent" as ESignStatus };
  }
}

class AutentiAdapter implements ESignAdapter {
  async send(req: Parameters<ESignAdapter["send"]>[0]) {
    const token = process.env.AUTENTI_API_TOKEN;
    if (!token) throw new Error("AUTENTI_API_TOKEN missing");
    const r = await fetch("https://api.autenti.com/v2/envelopes", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({
        documents: [{ url: req.document_url }],
        signers: req.signers.map((s) => ({ email: s.email, name: s.name, role: s.role ?? "signer" })),
        subject: req.subject ?? "Dokument do podpisu",
        message: req.message ?? "Proszę o podpis.",
      }),
    });
    if (!r.ok) throw new Error(`autenti_${r.status}`);
    const j: any = await r.json();
    return { provider_ref: j.id, signing_url: j.signing_url };
  }
  async fetchStatus(providerRef: string) {
    const token = process.env.AUTENTI_API_TOKEN;
    if (!token) throw new Error("AUTENTI_API_TOKEN missing");
    const r = await fetch(`https://api.autenti.com/v2/envelopes/${providerRef}`, {
      headers: { authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`autenti_${r.status}`);
    const j: any = await r.json();
    const status = mapAutentiStatus(j.status);
    return { status, signed_pdf_url: j.signed_pdf_url };
  }
}

function mapAutentiStatus(s: string): ESignStatus {
  if (s === "completed" || s === "signed") return "signed";
  if (s === "declined") return "declined";
  if (s === "expired") return "expired";
  if (s === "opened") return "viewed";
  if (s === "sent") return "sent";
  return "draft";
}

export function getAdapter(provider: ESignProvider): ESignAdapter {
  if (provider === "autenti") return new AutentiAdapter();
  return new InternalAdapter();
}

export async function createSignatureRequest(input: {
  user_id: string;
  document_id: string;
  document_url: string;
  provider?: ESignProvider;
  signers: SignatureRequest["signers"];
  subject?: string;
  message?: string;
  expires_in_days?: number;
}): Promise<SignatureRequest> {
  const provider = input.provider ?? "internal";
  const adapter = getAdapter(provider);
  const sent = await adapter.send({
    document_url: input.document_url,
    signers: input.signers,
    subject: input.subject,
    message: input.message,
  });
  const req: SignatureRequest = {
    id: randomUUID(),
    user_id: input.user_id,
    document_id: input.document_id,
    provider,
    signers: input.signers,
    status: "sent",
    provider_ref: sent.provider_ref,
    expires_at: input.expires_in_days
      ? new Date(Date.now() + input.expires_in_days * 86400_000).toISOString()
      : undefined,
  };
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  await sb.from("signature_requests").insert({
    ...req,
    signing_url: sent.signing_url ?? null,
    created_at: new Date().toISOString(),
  });
  return req;
}

export async function refreshSignatureStatus(requestId: string): Promise<ESignStatus> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createSupabaseServerClient();
  const { data } = await sb.from("signature_requests").select("*").eq("id", requestId).maybeSingle();
  if (!data) throw new Error("not_found");
  const adapter = getAdapter(data.provider as ESignProvider);
  if (!data.provider_ref) return data.status as ESignStatus;
  const { status, signed_pdf_url } = await adapter.fetchStatus(data.provider_ref);
  await sb
    .from("signature_requests")
    .update({ status, signed_pdf_url: signed_pdf_url ?? null, updated_at: new Date().toISOString() })
    .eq("id", requestId);
  return status;
}
