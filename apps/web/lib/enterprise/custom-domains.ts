/**
 * Tier 13 — Custom domain (white-label) registry with verification.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";
import { randomUUID } from "crypto";

export interface CustomDomain {
  id: string;
  org_id: string;
  domain: string;
  verification_token: string;
  status: "pending" | "verified" | "failed";
  ssl_status: "pending" | "issued" | "renewing" | "failed";
  created_at: string;
  verified_at?: string | null;
}

export async function registerDomain(orgId: string, domain: string): Promise<CustomDomain> {
  const sb = await createServerSupabase();
  const d: CustomDomain = {
    id: randomUUID(),
    org_id: orgId,
    domain: domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, ""),
    verification_token: `dlugomat-verify=${randomUUID().replace(/-/g, "").slice(0, 24)}`,
    status: "pending",
    ssl_status: "pending",
    created_at: new Date().toISOString(),
  };
  await sb.from("custom_domains").insert(d);
  return d;
}

export async function verifyDomain(domainId: string): Promise<{ verified: boolean; method?: "txt" | "cname" }> {
  const sb = await createServerSupabase();
  const { data: d } = await sb.from("custom_domains").select("*").eq("id", domainId).maybeSingle();
  if (!d) throw new Error("not_found");
  // DNS verification via DoH (Cloudflare 1.1.1.1)
  const txtOk = await checkTxtRecord(d.domain, d.verification_token);
  const cnameOk = await checkCnameRecord(d.domain, "domains.dlugomat.pl");
  if (txtOk || cnameOk) {
    await sb
      .from("custom_domains")
      .update({ status: "verified", verified_at: new Date().toISOString() })
      .eq("id", domainId);
    return { verified: true, method: txtOk ? "txt" : "cname" };
  }
  await sb.from("custom_domains").update({ status: "failed" }).eq("id", domainId);
  return { verified: false };
}

async function checkTxtRecord(domain: string, expected: string): Promise<boolean> {
  try {
    const r = await fetch(`https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=TXT`, {
      headers: { accept: "application/dns-json" },
    });
    const j: any = await r.json();
    const records = (j.Answer ?? []).map((a: any) => String(a.data ?? "").replace(/^"|"$/g, ""));
    return records.some((rec: string) => rec.includes(expected));
  } catch {
    return false;
  }
}

async function checkCnameRecord(domain: string, expectedTarget: string): Promise<boolean> {
  try {
    const r = await fetch(`https://1.1.1.1/dns-query?name=${encodeURIComponent(domain)}&type=CNAME`, {
      headers: { accept: "application/dns-json" },
    });
    const j: any = await r.json();
    const records = (j.Answer ?? []).map((a: any) => String(a.data ?? "").replace(/\.$/, ""));
    return records.some((rec: string) => rec.toLowerCase() === expectedTarget.toLowerCase());
  } catch {
    return false;
  }
}
