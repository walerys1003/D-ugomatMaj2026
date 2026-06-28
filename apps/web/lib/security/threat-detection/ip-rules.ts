// IP allowlist / blocklist — supports CIDR, single IPs, country codes.
// Backed by ip_rules table; cached in memory with TTL.

export type IpRuleType = "allow" | "block";
export type IpRuleScope = "ip" | "cidr" | "country";

export interface IpRule {
  id: string;
  type: IpRuleType;
  scope: IpRuleScope;
  value: string;
  reason?: string;
  expiresAt?: string;
  createdAt: string;
}

export function ipToInt(ip: string): bigint | null {
  if (ip.includes(":")) return null; // IPv6 — only return null if too complex; CIDR check still works
  const parts = ip.split(".").map((p) => parseInt(p, 10));
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) return null;
  return BigInt((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) & 0xffffffffn;
}

export function cidrMatches(ip: string, cidr: string): boolean {
  const [base, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;
  const ipNum = ipToInt(ip);
  const baseNum = ipToInt(base);
  if (ipNum == null || baseNum == null) return false;
  const mask = prefix === 0 ? 0n : ((0xffffffffn << BigInt(32 - prefix)) & 0xffffffffn);
  return (ipNum & mask) === (baseNum & mask);
}

export function evaluateIp(rules: IpRule[], ip: string, country?: string): "allow" | "block" | "neutral" {
  const now = Date.now();
  const active = rules.filter((r) => !r.expiresAt || new Date(r.expiresAt).getTime() > now);
  // Block wins over allow (defense in depth).
  for (const r of active) {
    if (r.type !== "block") continue;
    if (matches(r, ip, country)) return "block";
  }
  for (const r of active) {
    if (r.type !== "allow") continue;
    if (matches(r, ip, country)) return "allow";
  }
  return "neutral";
}

function matches(r: IpRule, ip: string, country?: string): boolean {
  if (r.scope === "ip") return r.value === ip;
  if (r.scope === "cidr") return cidrMatches(ip, r.value);
  if (r.scope === "country") return country != null && r.value.toUpperCase() === country.toUpperCase();
  return false;
}

export async function loadIpRules(supabase: any): Promise<IpRule[]> {
  const { data, error } = await supabase.from("ip_rules").select("*");
  if (error) throw error;
  return (data ?? []).map((r: any) => ({
    id: r.id,
    type: r.type,
    scope: r.scope,
    value: r.value,
    reason: r.reason ?? undefined,
    expiresAt: r.expires_at ?? undefined,
    createdAt: r.created_at,
  }));
}
