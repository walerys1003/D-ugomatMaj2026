/**
 * Tier 18 — WhatsApp Business Cloud API client.
 *
 * Integracja z WhatsApp Cloud API (Meta Graph API v20+):
 *  - wysyłka template messages (HSM) — np. "deadline_reminder", "case_update"
 *  - wysyłka session messages (24h window po wiadomości użytkownika)
 *  - webhook do odbierania statusów (delivered/read/failed)
 *
 * Wymaga ENV:
 *  - WHATSAPP_PHONE_NUMBER_ID
 *  - WHATSAPP_ACCESS_TOKEN
 *  - WHATSAPP_VERIFY_TOKEN (do GET webhook)
 */

const WA_API_VERSION = "v20.0";

export interface WhatsAppTemplateMessage {
  to: string; // E.164 (+48...)
  templateName: string;
  languageCode: string; // np. "pl"
  components?: Array<{
    type: "header" | "body" | "footer" | "button";
    parameters?: Array<{ type: "text"; text: string }>;
  }>;
}

export interface WhatsAppSessionMessage {
  to: string;
  body: string;
}

export interface WhatsAppSendResult {
  externalId: string;
  recipient: string;
}

function getCreds(): { phoneNumberId: string; token: string } {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!phoneNumberId || !token) {
    throw new Error("WhatsApp credentials missing (WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_ACCESS_TOKEN)");
  }
  return { phoneNumberId, token };
}

export async function sendWhatsAppTemplate(msg: WhatsAppTemplateMessage): Promise<WhatsAppSendResult> {
  const { phoneNumberId, token } = getCreds();
  const url = `https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizePhone(msg.to),
    type: "template",
    template: {
      name: msg.templateName,
      language: { code: msg.languageCode },
      components: msg.components ?? [],
    },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp send failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { messages?: Array<{ id: string }>; contacts?: Array<{ wa_id: string }> };
  return {
    externalId: json.messages?.[0]?.id ?? "",
    recipient: json.contacts?.[0]?.wa_id ?? msg.to,
  };
}

export async function sendWhatsAppText(msg: WhatsAppSessionMessage): Promise<WhatsAppSendResult> {
  const { phoneNumberId, token } = getCreds();
  const url = `https://graph.facebook.com/${WA_API_VERSION}/${phoneNumberId}/messages`;
  const body = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: normalizePhone(msg.to),
    type: "text",
    text: { preview_url: false, body: msg.body },
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WhatsApp text send failed: ${res.status} ${text}`);
  }
  const json = (await res.json()) as { messages?: Array<{ id: string }> };
  return { externalId: json.messages?.[0]?.id ?? "", recipient: msg.to };
}

function normalizePhone(raw: string): string {
  const cleaned = raw.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+")) return cleaned.slice(1);
  if (cleaned.startsWith("00")) return cleaned.slice(2);
  if (cleaned.length === 9) return `48${cleaned}`; // PL fallback
  return cleaned;
}

/**
 * Weryfikacja webhook signature (HMAC-SHA256 z app_secret).
 * Meta wysyła nagłówek X-Hub-Signature-256: sha256=<hex>.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string, appSecret: string): boolean {
  if (!signatureHeader.startsWith("sha256=")) return false;
  const expected = signatureHeader.slice("sha256=".length);
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const crypto = require("crypto") as typeof import("crypto");
  const computed = crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex");
  if (computed.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(expected, "hex"));
}

export interface WhatsAppStatusUpdate {
  messageId: string;
  recipient: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  errorCode?: number;
  errorMessage?: string;
}

export function parseWebhookStatuses(payload: unknown): WhatsAppStatusUpdate[] {
  const updates: WhatsAppStatusUpdate[] = [];
  const entries = (payload as { entry?: Array<{ changes?: Array<{ value?: { statuses?: Array<Record<string, unknown>> } }> }> }).entry ?? [];
  for (const entry of entries) {
    for (const change of entry.changes ?? []) {
      for (const st of change.value?.statuses ?? []) {
        const err = (st.errors as Array<{ code?: number; title?: string }> | undefined)?.[0];
        updates.push({
          messageId: String(st.id ?? ""),
          recipient: String(st.recipient_id ?? ""),
          status: String(st.status ?? "sent") as WhatsAppStatusUpdate["status"],
          timestamp: String(st.timestamp ?? ""),
          errorCode: err?.code,
          errorMessage: err?.title,
        });
      }
    }
  }
  return updates;
}
