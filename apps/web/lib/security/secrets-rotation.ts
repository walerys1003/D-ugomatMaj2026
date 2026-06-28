/**
 * Tier 6 zad. 285 — Secrets rotation policy helper.
 *
 * Pomocnik dla operacji rotacji sekretów (Stripe webhook secret, Anthropic
 * key, Supabase service-role, Resend API). Sam plik NIE zawiera sekretów —
 * to runtime audit + grace-period validator.
 *
 * Wzorzec: w `.env` trzymamy `_CURRENT` i `_PREVIOUS` warianty wybranych
 * sekretów (np. STRIPE_WEBHOOK_SECRET + STRIPE_WEBHOOK_SECRET_PREVIOUS).
 * Webhook handler waliduje signature przeciwko obu — jeśli `_PREVIOUS`
 * dziala, zwracamy 200 ale logujemy `secret.rotation.legacy_used`.
 *
 * Po 24 h od deployu nowego sekretu kasujemy `_PREVIOUS` z .env.
 *
 * Plik eksportuje:
 *   - getRotationCandidates() — lista sekretów do rotacji wg wieku w env
 *   - validateAgainstBoth(verify, current, previous) — helper signature
 *   - auditSecretAge() — zwraca wiek sekretów dla `/admin/secrets`
 */

import { logger } from "@/lib/observability/logger";

export interface SecretSpec {
  /** Env var name (current). */
  envName: string;
  /** Optional env var with rotation history (previous secret). */
  prevEnvName?: string;
  /** Last rotation timestamp env var (ISO). */
  lastRotatedEnv?: string;
  /** Max age (days) before warning fires. */
  maxAgeDays: number;
  /** Human-readable label. */
  label: string;
}

export const SECRETS_INVENTORY: readonly SecretSpec[] = [
  {
    envName: "STRIPE_SECRET_KEY",
    lastRotatedEnv: "STRIPE_SECRET_KEY_ROTATED_AT",
    maxAgeDays: 90,
    label: "Stripe API key (secret)",
  },
  {
    envName: "STRIPE_WEBHOOK_SECRET",
    prevEnvName: "STRIPE_WEBHOOK_SECRET_PREVIOUS",
    lastRotatedEnv: "STRIPE_WEBHOOK_SECRET_ROTATED_AT",
    maxAgeDays: 90,
    label: "Stripe webhook signing secret",
  },
  {
    envName: "ANTHROPIC_API_KEY",
    lastRotatedEnv: "ANTHROPIC_API_KEY_ROTATED_AT",
    maxAgeDays: 90,
    label: "Anthropic API key",
  },
  {
    envName: "SUPABASE_SERVICE_ROLE_KEY",
    lastRotatedEnv: "SUPABASE_SERVICE_ROLE_KEY_ROTATED_AT",
    maxAgeDays: 180, // higher impact rotation
    label: "Supabase service role key",
  },
  {
    envName: "RESEND_API_KEY",
    lastRotatedEnv: "RESEND_API_KEY_ROTATED_AT",
    maxAgeDays: 90,
    label: "Resend API key",
  },
  {
    envName: "HEALTH_DEEP_TOKEN",
    lastRotatedEnv: "HEALTH_DEEP_TOKEN_ROTATED_AT",
    maxAgeDays: 365,
    label: "Internal health-deep bearer",
  },
] as const;

export interface SecretAudit {
  envName: string;
  label: string;
  configured: boolean;
  hasPrevious: boolean;
  ageDays: number | null;
  maxAgeDays: number;
  overdue: boolean;
}

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / (24 * 60 * 60 * 1000));
}

export function auditSecretAge(): SecretAudit[] {
  return SECRETS_INVENTORY.map((spec) => {
    const configured = Boolean(process.env[spec.envName]);
    const hasPrevious = Boolean(spec.prevEnvName && process.env[spec.prevEnvName]);
    const ageDays = daysSince(
      spec.lastRotatedEnv ? process.env[spec.lastRotatedEnv] : undefined,
    );
    const overdue = ageDays !== null && ageDays > spec.maxAgeDays;
    return {
      envName: spec.envName,
      label: spec.label,
      configured,
      hasPrevious,
      ageDays,
      maxAgeDays: spec.maxAgeDays,
      overdue,
    };
  });
}

/**
 * Helper dla dual-secret webhook validation (Stripe / Resend itd.).
 * `verify(secret)` powinien rzucać, jeśli signature nie pasuje.
 * Zwraca true/false bez throw, loguje `secret.rotation.legacy_used`.
 */
export async function validateAgainstBoth(
  verify: (secret: string) => Promise<boolean> | boolean,
  currentSecret: string | undefined,
  previousSecret: string | undefined,
  label: string,
): Promise<boolean> {
  if (currentSecret) {
    try {
      if (await verify(currentSecret)) return true;
    } catch {
      // fall through to previous
    }
  }
  if (previousSecret) {
    try {
      if (await verify(previousSecret)) {
        logger.warn("secret.rotation.legacy_used", { label });
        return true;
      }
    } catch {
      // fall through
    }
  }
  return false;
}

/** For startup banner — log overdue secrets so on-call sees them. */
export function logOverdueSecretsAtBoot(): void {
  const audits = auditSecretAge();
  const overdue = audits.filter((a) => a.overdue);
  if (overdue.length === 0) return;
  logger.warn("secrets.rotation.overdue", {
    count: overdue.length,
    secrets: overdue.map((a) => ({ name: a.envName, ageDays: a.ageDays })),
  });
}
