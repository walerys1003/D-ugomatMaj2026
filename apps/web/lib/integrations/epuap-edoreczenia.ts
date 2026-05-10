/**
 * e-Pismo / e-Doręczenia + ePUAP signature integration — zad. 322, 323, 345
 *
 * Scaffold for Polish e-government channels. Real integrations require:
 *  - ePUAP: SAML SSO + signature with kwalifikowany podpis lub Profil Zaufany
 *  - e-Doręczenia (KSED/ADE): registered electronic delivery with public-key infra
 *  - e-Pismo: simpler form-based submission (KIO, US, KRS)
 *
 * This module defines the interface and provides a stub implementation that
 * documents the integration steps. Production should plug in a vetted provider
 * (e.g. szafir SDK, Autenti, mojeID).
 */

import { logger } from "@/lib/observability/logger";

export type EChannel = "epuap" | "e_doreczenia" | "e_pismo" | "mobywatel";

export interface ESignInput {
  document_pdf_bytes: Uint8Array;
  /** Recipient: e.g. "Sąd Rejonowy w Warszawie" */
  recipient_name: string;
  /** ePUAP / e-Doręczenia identifier */
  recipient_address: string;
  /** Auth token from user's session (SAML / OIDC) */
  user_auth_token: string;
  /** Subject */
  subject: string;
}

export interface ESignResult {
  ok: boolean;
  channel: EChannel;
  reference_id?: string;
  signature_id?: string;
  upo_url?: string; // Urzędowe Poświadczenie Odbioru
  delivered_at?: string;
  error?: string;
  notes: string[];
}

export interface ESignProvider {
  channel: EChannel;
  available(): boolean;
  send(input: ESignInput): Promise<ESignResult>;
}

class EpuapProvider implements ESignProvider {
  channel: EChannel = "epuap";
  available(): boolean {
    return !!(process.env.EPUAP_API_BASE && process.env.EPUAP_CLIENT_ID && process.env.EPUAP_CLIENT_SECRET);
  }
  async send(input: ESignInput): Promise<ESignResult> {
    if (!this.available()) {
      return {
        ok: false,
        channel: "epuap",
        error: "epuap_not_configured",
        notes: [
          "Wymagane: EPUAP_API_BASE, EPUAP_CLIENT_ID, EPUAP_CLIENT_SECRET.",
          "Integracja wymaga zarejestrowanej aplikacji w katalogu ePUAP + certyfikatu SSL.",
          "Endpoints: /pk2/submit, /pk2/status, /pk2/upo (Urzędowe Poświadczenie Odbioru).",
        ],
      };
    }
    // TODO: real ePUAP API call
    logger.info("epuap.send_stub", { recipient: input.recipient_name });
    return {
      ok: false,
      channel: "epuap",
      error: "not_implemented",
      notes: ["Stub — integracja pending."],
    };
  }
}

class EDoreczeniaProvider implements ESignProvider {
  channel: EChannel = "e_doreczenia";
  available(): boolean {
    return !!(process.env.EDORECZENIA_API_BASE && process.env.EDORECZENIA_API_KEY);
  }
  async send(input: ESignInput): Promise<ESignResult> {
    if (!this.available()) {
      return {
        ok: false,
        channel: "e_doreczenia",
        error: "edoreczenia_not_configured",
        notes: [
          "Wymagane: EDORECZENIA_API_BASE, EDORECZENIA_API_KEY.",
          "Konieczna rejestracja w KSED (Krajowy System Doręczeń Elektronicznych).",
          "Adres usługi w formie ADE (np. AE:PL-XXXXX-YYYYY-AAAA).",
        ],
      };
    }
    logger.info("e_doreczenia.send_stub", { recipient: input.recipient_address });
    return {
      ok: false,
      channel: "e_doreczenia",
      error: "not_implemented",
      notes: ["Stub — integracja pending."],
    };
  }
}

class EPismoProvider implements ESignProvider {
  channel: EChannel = "e_pismo";
  available(): boolean {
    return true; // form-based, no key required
  }
  async send(_input: ESignInput): Promise<ESignResult> {
    return {
      ok: false,
      channel: "e_pismo",
      error: "manual_submission_required",
      notes: [
        "e-Pismo (Krajowa Izba Odwoławcza, niektóre sądy) wymaga ręcznego wypełnienia formularza.",
        "Długomat generuje gotowy plik PDF — użytkownik wkleja go w formularz e-Pismo.",
      ],
    };
  }
}

class MObywatelProvider implements ESignProvider {
  channel: EChannel = "mobywatel";
  available(): boolean {
    return !!(process.env.MOBYWATEL_CLIENT_ID && process.env.MOBYWATEL_CLIENT_SECRET);
  }
  async send(_input: ESignInput): Promise<ESignResult> {
    return {
      ok: false,
      channel: "mobywatel",
      error: "mobywatel_auto_fill_only",
      notes: [
        "mObywatel jest używany do AUTO-FILL danych identyfikacyjnych (PESEL, imię, nazwisko, adres).",
        "Nie służy do wysyłki pism — tylko do potwierdzenia tożsamości.",
      ],
    };
  }
}

const PROVIDERS: Record<EChannel, ESignProvider> = {
  epuap: new EpuapProvider(),
  e_doreczenia: new EDoreczeniaProvider(),
  e_pismo: new EPismoProvider(),
  mobywatel: new MObywatelProvider(),
};

export async function sendViaChannel(channel: EChannel, input: ESignInput): Promise<ESignResult> {
  const provider = PROVIDERS[channel];
  if (!provider) {
    return { ok: false, channel, error: "unknown_channel", notes: [] };
  }
  return provider.send(input);
}

export function listAvailableChannels(): Array<{ channel: EChannel; available: boolean }> {
  return (Object.keys(PROVIDERS) as EChannel[]).map((c) => ({ channel: c, available: PROVIDERS[c].available() }));
}
