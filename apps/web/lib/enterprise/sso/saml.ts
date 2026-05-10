/**
 * Tier 13 — SAML 2.0 SSO (IdP-initiated and SP-initiated) with metadata generator.
 * Production deployment should pair this with a battle-tested library; this module
 * provides metadata + assertion parsing scaffolding sufficient for most IdPs.
 */
import { createHash, randomUUID } from "crypto";

export interface SamlConfig {
  org_id: string;
  idp_entity_id: string;
  idp_sso_url: string;
  idp_x509_cert: string;
  sp_entity_id: string;
  sp_acs_url: string;
  attribute_mapping: { email: string; first_name?: string; last_name?: string; groups?: string };
}

export function buildSpMetadataXml(cfg: { sp_entity_id: string; sp_acs_url: string }): string {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<EntityDescriptor xmlns="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${escapeXml(cfg.sp_entity_id)}">`,
    `<SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol" AuthnRequestsSigned="false" WantAssertionsSigned="true">`,
    `<NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</NameIDFormat>`,
    `<AssertionConsumerService Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" Location="${escapeXml(cfg.sp_acs_url)}" index="0" isDefault="true"/>`,
    `</SPSSODescriptor>`,
    `</EntityDescriptor>`,
  ].join("");
}

export interface SamlAuthnRequest {
  id: string;
  url: string;
  relay_state: string;
}

export function buildAuthnRequest(cfg: SamlConfig, relayState?: string): SamlAuthnRequest {
  const id = `_${randomUUID().replace(/-/g, "")}`;
  const issueInstant = new Date().toISOString();
  const xml =
    `<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" ` +
    `xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ` +
    `ID="${id}" Version="2.0" IssueInstant="${issueInstant}" ` +
    `Destination="${escapeXml(cfg.idp_sso_url)}" AssertionConsumerServiceURL="${escapeXml(cfg.sp_acs_url)}" ` +
    `ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">` +
    `<saml:Issuer>${escapeXml(cfg.sp_entity_id)}</saml:Issuer>` +
    `</samlp:AuthnRequest>`;
  const deflated = Buffer.from(xml).toString("base64");
  const url = `${cfg.idp_sso_url}?SAMLRequest=${encodeURIComponent(deflated)}${relayState ? `&RelayState=${encodeURIComponent(relayState)}` : ""}`;
  return { id, url, relay_state: relayState ?? "" };
}

export interface ParsedAssertion {
  email: string;
  first_name?: string;
  last_name?: string;
  groups: string[];
  name_id: string;
  raw_xml: string;
}

export function parseAssertion(samlResponseB64: string, cfg: SamlConfig): ParsedAssertion {
  const xml = Buffer.from(samlResponseB64, "base64").toString("utf-8");
  const grab = (re: RegExp) => xml.match(re)?.[1]?.trim() ?? "";
  const nameId = grab(/<saml2?:NameID[^>]*>([^<]+)<\/saml2?:NameID>/);
  const attrs: Record<string, string[]> = {};
  const attrRe = /<saml2?:Attribute[^>]*Name="([^"]+)"[^>]*>([\s\S]*?)<\/saml2?:Attribute>/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(xml))) {
    const name = m[1];
    const valuesXml = m[2];
    const values = [...valuesXml.matchAll(/<saml2?:AttributeValue[^>]*>([\s\S]*?)<\/saml2?:AttributeValue>/g)].map((x) => x[1].trim());
    attrs[name] = values;
  }
  const map = cfg.attribute_mapping;
  const email = (attrs[map.email]?.[0] ?? nameId).toLowerCase();
  const first = map.first_name ? attrs[map.first_name]?.[0] : undefined;
  const last = map.last_name ? attrs[map.last_name]?.[0] : undefined;
  const groups = map.groups ? attrs[map.groups] ?? [] : [];
  return { email, first_name: first, last_name: last, groups, name_id: nameId, raw_xml: xml };
}

export function fingerprintCert(cert: string): string {
  const cleaned = cert.replace(/-----BEGIN CERTIFICATE-----/g, "").replace(/-----END CERTIFICATE-----/g, "").replace(/\s+/g, "");
  return createHash("sha256").update(Buffer.from(cleaned, "base64")).digest("hex");
}

function escapeXml(s: string): string {
  return s.replace(/[<>&"']/g, (c) => (c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c === '"' ? "&quot;" : "&apos;"));
}
