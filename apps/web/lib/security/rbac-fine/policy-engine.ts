/**
 * Tier 23 — Fine-grained RBAC policy engine.
 *
 * Rozszerza istniejącą macierz role→permission (lib/enterprise/rbac.ts) o:
 *  - policies per resource (np. case:42 — tylko właściciel + assignees)
 *  - conditions (JSON-Logic-lite: time-of-day, IP range, MFA required)
 *  - role inheritance (admin > member > viewer)
 *  - effect deny > allow (explicit deny wygrywa)
 *  - cache decyzji per request (in-memory LRU)
 *
 * Model decyzji ABAC:
 *  subject (user_id, roles, attrs) × action (verb) × resource (type, id, attrs)
 *  → ALLOW | DENY | NEUTRAL (NEUTRAL = brak reguły, default=DENY)
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type { Json } from "@/lib/db/types";

export type PolicyEffect = "allow" | "deny";

export interface PolicyRule {
  id: string;
  name: string;
  effect: PolicyEffect;
  actions: string[];          // np. ["case.read", "case.update"] lub ["*"]
  resources: string[];        // np. ["case:*", "case:42", "doc:*"]
  subjects: {
    roles?: string[];         // role uprawniające
    user_ids?: string[];      // konkretni userzy
    attributes?: Record<string, unknown>; // dopasowane do subject.attrs
  };
  conditions: Array<Record<string, unknown>>; // JSON-Logic-lite
  priority: number;           // wyższy = ważniejszy przy konflikcie
  enabled: boolean;
}

export interface Subject {
  user_id: string;
  roles: string[];
  attrs: Record<string, unknown>; // mfa, ip, country, plan, etc.
}

export interface Resource {
  type: string; // np. "case", "doc", "user"
  id?: string;
  attrs: Record<string, unknown>;
}

export interface Decision {
  effect: PolicyEffect | "neutral";
  matchedRule: PolicyRule | null;
  reason: string;
}

// ---------------------------------------------------------------------
// Role inheritance — domyślny hierarchia
// ---------------------------------------------------------------------
const ROLE_INHERITANCE: Record<string, string[]> = {
  owner: ["admin", "member", "viewer"],
  admin: ["member", "viewer"],
  member: ["viewer"],
  viewer: [],
};

export function expandRoles(roles: string[]): string[] {
  const out = new Set<string>(roles);
  for (const r of roles) {
    for (const inh of ROLE_INHERITANCE[r] ?? []) {
      out.add(inh);
    }
  }
  return Array.from(out);
}

// ---------------------------------------------------------------------
// Resource pattern matching — "case:*" lub "case:42" lub "*"
// ---------------------------------------------------------------------
export function matchResourcePattern(pattern: string, resource: Resource): boolean {
  if (pattern === "*") return true;
  const [type, id] = pattern.split(":");
  if (type !== resource.type) return false;
  if (!id || id === "*") return true;
  return id === resource.id;
}

export function matchActionPattern(pattern: string, action: string): boolean {
  if (pattern === "*") return true;
  if (pattern === action) return true;
  // np. "case.*" matches "case.read"
  if (pattern.endsWith(".*")) {
    const prefix = pattern.slice(0, -2);
    return action.startsWith(prefix + ".");
  }
  return false;
}

// ---------------------------------------------------------------------
// JSON-Logic-lite condition evaluator
// ---------------------------------------------------------------------
export function evalCondition(
  cond: Record<string, unknown>,
  data: Record<string, unknown>,
): boolean {
  if (!cond || typeof cond !== "object") return true;
  const op = Object.keys(cond)[0];
  const args = (cond as Record<string, unknown>)[op];
  const resolve = (v: unknown): unknown => {
    if (typeof v === "object" && v !== null && "var" in (v as object)) {
      const path = (v as { var: string }).var.split(".");
      let cur: unknown = data;
      for (const p of path) {
        if (cur && typeof cur === "object") cur = (cur as Record<string, unknown>)[p];
        else return undefined;
      }
      return cur;
    }
    return v;
  };
  const arr = Array.isArray(args) ? args.map(resolve) : [resolve(args)];
  switch (op) {
    case "==": return arr[0] === arr[1];
    case "!=": return arr[0] !== arr[1];
    case ">": return Number(arr[0]) > Number(arr[1]);
    case ">=": return Number(arr[0]) >= Number(arr[1]);
    case "<": return Number(arr[0]) < Number(arr[1]);
    case "<=": return Number(arr[0]) <= Number(arr[1]);
    case "in": return Array.isArray(arr[1]) && (arr[1] as unknown[]).includes(arr[0]);
    case "and": return arr.every(Boolean);
    case "or": return arr.some(Boolean);
    case "not": return !arr[0];
    case "ip_in_cidr": return isIpInCidr(String(arr[0]), String(arr[1]));
    case "time_between": return isTimeBetween(String(arr[0]), String(arr[1]), new Date());
    default: return false;
  }
}

function isIpInCidr(ip: string, cidr: string): boolean {
  // IPv4 only — uproszczone
  const [base, bitsStr] = cidr.split("/");
  const bits = parseInt(bitsStr ?? "32", 10);
  const toInt = (s: string) => s.split(".").reduce((a, b) => (a << 8) + Number(b), 0) >>> 0;
  try {
    const ipInt = toInt(ip);
    const baseInt = toInt(base);
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0;
    return (ipInt & mask) === (baseInt & mask);
  } catch {
    return false;
  }
}

function isTimeBetween(start: string, end: string, now: Date): boolean {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  const s = sh * 60 + sm;
  const e = eh * 60 + em;
  return s <= cur && cur <= e;
}

// ---------------------------------------------------------------------
// Subject/Resource matching
// ---------------------------------------------------------------------
function subjectMatches(rule: PolicyRule, subject: Subject): boolean {
  const expandedRoles = expandRoles(subject.roles);
  if (rule.subjects.user_ids?.includes(subject.user_id)) return true;
  if (rule.subjects.roles?.some((r) => expandedRoles.includes(r))) return true;
  if (rule.subjects.attributes) {
    return Object.entries(rule.subjects.attributes).every(([k, v]) => subject.attrs[k] === v);
  }
  return (
    !rule.subjects.user_ids &&
    !rule.subjects.roles &&
    !rule.subjects.attributes
  ); // empty subjects => matches any (rzadko używane)
}

// ---------------------------------------------------------------------
// Decision cache (per-request)
// ---------------------------------------------------------------------
const DECISION_CACHE_MAX = 256;
const cacheStore = new Map<string, Decision>();
function cacheKey(subject: Subject, action: string, resource: Resource): string {
  return `${subject.user_id}|${action}|${resource.type}:${resource.id ?? ""}`;
}

// ---------------------------------------------------------------------
// Main decision function
// ---------------------------------------------------------------------
export async function decide(args: {
  subject: Subject;
  action: string;
  resource: Resource;
  policies?: PolicyRule[];
  cache?: boolean;
}): Promise<Decision> {
  const useCache = args.cache !== false;
  const key = cacheKey(args.subject, args.action, args.resource);
  if (useCache && cacheStore.has(key)) {
    return cacheStore.get(key)!;
  }

  const policies = args.policies ?? (await loadPoliciesForResource(args.resource.type));
  const enabled = policies.filter((p) => p.enabled);
  const sorted = enabled
    .filter((p) => p.actions.some((a) => matchActionPattern(a, args.action)))
    .filter((p) => p.resources.some((r) => matchResourcePattern(r, args.resource)))
    .filter((p) => subjectMatches(p, args.subject))
    .sort((a, b) => b.priority - a.priority);

  const data = {
    subject: args.subject,
    resource: args.resource,
    action: args.action,
  };

  // Explicit deny wygrywa
  for (const p of sorted) {
    if (p.effect !== "deny") continue;
    if (p.conditions.every((c) => evalCondition(c, data))) {
      const decision: Decision = {
        effect: "deny",
        matchedRule: p,
        reason: `Explicit deny by rule "${p.name}"`,
      };
      cacheDecision(key, decision, useCache);
      return decision;
    }
  }

  // Allow z najwyższym priorytetem
  for (const p of sorted) {
    if (p.effect !== "allow") continue;
    if (p.conditions.every((c) => evalCondition(c, data))) {
      const decision: Decision = {
        effect: "allow",
        matchedRule: p,
        reason: `Allowed by rule "${p.name}"`,
      };
      cacheDecision(key, decision, useCache);
      return decision;
    }
  }

  const neutral: Decision = {
    effect: "neutral",
    matchedRule: null,
    reason: "No matching rule (default deny)",
  };
  cacheDecision(key, neutral, useCache);
  return neutral;
}

function cacheDecision(key: string, dec: Decision, useCache: boolean): void {
  if (!useCache) return;
  if (cacheStore.size >= DECISION_CACHE_MAX) {
    // Drop oldest (FIFO)
    const first = cacheStore.keys().next().value;
    if (first) cacheStore.delete(first);
  }
  cacheStore.set(key, dec);
}

export function clearDecisionCache(): void {
  cacheStore.clear();
}

// ---------------------------------------------------------------------
// Policy persistence
// ---------------------------------------------------------------------
export async function loadPoliciesForResource(resourceType: string): Promise<PolicyRule[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data, error } = await sb
    .from("rbac_policies")
    .select("*")
    .eq("enabled", true)
    .or(`resources.cs.{${resourceType}:*},resources.cs.{*}`)
    .order("priority", { ascending: false });
  if (error) return [];
  return (data ?? []) as unknown as PolicyRule[];
}

export async function listAllPolicies(): Promise<PolicyRule[]> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { data } = await sb
    .from("rbac_policies")
    .select("*")
    .order("priority", { ascending: false });
  return (data ?? []) as unknown as PolicyRule[];
}

export async function upsertPolicy(rule: Omit<PolicyRule, "id"> & { id?: string }): Promise<PolicyRule> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  // subjects/conditions to kolumny jsonb (Json) — rzutujemy strukturalne
  // pola PolicyRule na Json przy zapisie.
  const payload = {
    ...rule,
    id: rule.id ?? undefined,
    subjects: rule.subjects as unknown as Json,
    conditions: rule.conditions as unknown as Json,
  };
  const { data, error } = await sb
    .from("rbac_policies")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();
  if (error) throw error;
  clearDecisionCache();
  return data as unknown as PolicyRule;
}

export async function deletePolicy(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const sb = supabase;
  const { error } = await sb.from("rbac_policies").delete().eq("id", id);
  if (error) throw error;
  clearDecisionCache();
}

/** Helper: prosta funkcja boolean check. */
export async function can(
  subject: Subject,
  action: string,
  resource: Resource,
): Promise<boolean> {
  const dec = await decide({ subject, action, resource });
  return dec.effect === "allow";
}
