/**
 * Tier 20 — Feature flags engine.
 *
 * Lekki silnik feature flags z:
 *  - typami flag: boolean / multivariate / json payload
 *  - targeting rules: user_id, email_domain, plan, country, role, custom_attr
 *  - rollout strategy: percentage (deterministic by hash), gradual ramp, ring
 *  - kill switch: globalny override (incident response)
 *  - per-environment overrides (dev/staging/prod)
 *  - eval cache 30s (in-memory) z invalidation po update
 *
 * Brak zewnętrznych zależności — flagi w DB (`feature_flags`).
 */

import { createHash } from "crypto";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export type FlagKind = "boolean" | "multivariate" | "json";

export interface FlagRule {
  id: string;
  attribute: "user_id" | "email_domain" | "plan" | "country" | "role" | "tenant_id" | "custom";
  customKey?: string;
  op: "eq" | "neq" | "in" | "not_in" | "matches" | "contains";
  values: string[];
  serveVariant: string; // klucz wariantu
}

export interface FlagVariant {
  key: string;
  value: boolean | string | Record<string, unknown>;
  weight: number; // 0..100 — używane przy percentage rollout
}

export interface FeatureFlag {
  key: string;
  kind: FlagKind;
  enabled: boolean; // master switch
  description: string;
  variants: FlagVariant[];
  rules: FlagRule[];
  defaultVariant: string;
  killSwitch: boolean; // jeśli true → zawsze zwracamy `off`/false
  environment: "dev" | "staging" | "prod" | "all";
  updated_at: string;
}

export interface EvaluationContext {
  userId?: string;
  email?: string;
  plan?: string;
  country?: string;
  role?: string;
  tenantId?: string;
  custom?: Record<string, string | number | boolean>;
}

export interface EvaluationResult {
  flagKey: string;
  variant: string;
  value: boolean | string | Record<string, unknown>;
  reason: "kill_switch" | "disabled" | "rule_match" | "percentage" | "default";
  matchedRuleId?: string;
}

const CACHE_TTL_MS = 30_000;
const cache = new Map<string, { at: number; flag: FeatureFlag | null }>();

export async function getFlag(key: string): Promise<FeatureFlag | null> {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.flag;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("feature_flags")
    .select("*")
    .eq("key", key)
    .maybeSingle();
  if (error) throw error;
  const flag = (data ?? null) as FeatureFlag | null;
  cache.set(key, { at: Date.now(), flag });
  return flag;
}

export function invalidateFlagCache(key?: string): void {
  if (key) cache.delete(key);
  else cache.clear();
}

export async function evaluateFlag(
  key: string,
  ctx: EvaluationContext,
): Promise<EvaluationResult> {
  const flag = await getFlag(key);
  if (!flag) {
    return { flagKey: key, variant: "off", value: false, reason: "default" };
  }
  if (flag.killSwitch) {
    return { flagKey: key, variant: "off", value: false, reason: "kill_switch" };
  }
  if (!flag.enabled) {
    return {
      flagKey: key,
      variant: flag.defaultVariant,
      value: variantValue(flag, flag.defaultVariant),
      reason: "disabled",
    };
  }

  // 1) Targeting rules — pierwsza pasująca wygrywa.
  for (const rule of flag.rules) {
    if (matchesRule(rule, ctx)) {
      return {
        flagKey: key,
        variant: rule.serveVariant,
        value: variantValue(flag, rule.serveVariant),
        reason: "rule_match",
        matchedRuleId: rule.id,
      };
    }
  }

  // 2) Percentage rollout via deterministic hash bucket.
  if (flag.variants.length > 1) {
    const bucket = hashBucket(`${flag.key}:${ctx.userId ?? ctx.tenantId ?? "anon"}`);
    let cumulative = 0;
    for (const v of flag.variants) {
      cumulative += Math.max(0, v.weight);
      if (bucket < cumulative) {
        return {
          flagKey: key,
          variant: v.key,
          value: v.value,
          reason: "percentage",
        };
      }
    }
  }

  return {
    flagKey: key,
    variant: flag.defaultVariant,
    value: variantValue(flag, flag.defaultVariant),
    reason: "default",
  };
}

export async function isFlagEnabled(key: string, ctx: EvaluationContext): Promise<boolean> {
  const res = await evaluateFlag(key, ctx);
  return Boolean(res.value);
}

function variantValue(flag: FeatureFlag, variantKey: string): boolean | string | Record<string, unknown> {
  const v = flag.variants.find((x) => x.key === variantKey);
  return v ? v.value : false;
}

function matchesRule(rule: FlagRule, ctx: EvaluationContext): boolean {
  const value = resolveAttribute(rule, ctx);
  if (value === undefined || value === null) return false;
  const sv = String(value);
  switch (rule.op) {
    case "eq": return rule.values.length > 0 && sv === rule.values[0];
    case "neq": return rule.values.length > 0 && sv !== rule.values[0];
    case "in": return rule.values.includes(sv);
    case "not_in": return !rule.values.includes(sv);
    case "contains": return rule.values.some((v) => sv.includes(v));
    case "matches":
      try {
        return rule.values.some((pat) => new RegExp(pat).test(sv));
      } catch {
        return false;
      }
    default: return false;
  }
}

function resolveAttribute(rule: FlagRule, ctx: EvaluationContext): string | number | boolean | undefined {
  switch (rule.attribute) {
    case "user_id": return ctx.userId;
    case "email_domain": return ctx.email ? ctx.email.split("@")[1] : undefined;
    case "plan": return ctx.plan;
    case "country": return ctx.country;
    case "role": return ctx.role;
    case "tenant_id": return ctx.tenantId;
    case "custom":
      if (!rule.customKey) return undefined;
      return ctx.custom?.[rule.customKey];
  }
}

/** Hash → bucket 0..100 (deterministyczny). */
function hashBucket(key: string): number {
  const h = createHash("sha1").update(key).digest();
  const v = h.readUInt32BE(0);
  return v % 100;
}

/** Bulk evaluation — przydatne do hydration warstwy klienckiej. */
export async function evaluateAll(
  keys: string[],
  ctx: EvaluationContext,
): Promise<Record<string, EvaluationResult>> {
  const results = await Promise.all(keys.map((k) => evaluateFlag(k, ctx)));
  const out: Record<string, EvaluationResult> = {};
  for (let i = 0; i < keys.length; i++) out[keys[i]] = results[i];
  return out;
}
