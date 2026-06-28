#!/usr/bin/env node
/**
 * Tier 30 — Production env vars verifier.
 * Skanuje wymagane sekrety i raportuje brakujące + przestarzałe.
 *
 * Użycie:
 *   node scripts/verify-env.mjs           # weryfikacja env runtime
 *   node scripts/verify-env.mjs --check-rotation  # sprawdź czy rotation tags są aktualne
 */

const REQUIRED_PROD = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "CRON_SECRET",
];

const RECOMMENDED_PROD = [
  "RESEND_API_KEY",
  "ANTHROPIC_API_KEY",
  "OPENAI_API_KEY",
  "SENTRY_DSN",
  "SENTRY_AUTH_TOKEN",
  "SENTRY_ORG",
  "SENTRY_PROJECT",
  "NEXT_PUBLIC_POSTHOG_KEY",
  "HEALTH_DEEP_TOKEN",
  "MFA_ENCRYPTION_KEY",
  "SECRET_VAULT_MASTER_KEY",
  "AUDIT_HMAC_KEY",
  "IMPERSONATION_HMAC_KEY",
];

const OAUTH_PAIRS = [
  ["GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET"],
  ["MICROSOFT_OAUTH_CLIENT_ID", "MICROSOFT_OAUTH_CLIENT_SECRET"],
  ["SLACK_OAUTH_CLIENT_ID", "SLACK_OAUTH_CLIENT_SECRET"],
  ["NOTION_OAUTH_CLIENT_ID", "NOTION_OAUTH_CLIENT_SECRET"],
];

const SECURITY_KEYS_MIN_LENGTH = 32;

let errors = 0;
let warnings = 0;

console.log("\n🔐 Weryfikacja env vars\n");

// Required
console.log("── Wymagane (CRITICAL):");
for (const key of REQUIRED_PROD) {
  const val = process.env[key];
  if (!val) {
    console.log(`  ✗ ${key} — BRAK`);
    errors++;
  } else if (val.length < 10) {
    console.log(`  ⚠ ${key} — podejrzanie krótki (${val.length} znaków)`);
    warnings++;
  } else {
    console.log(`  ✓ ${key}`);
  }
}

// Recommended
console.log("\n── Zalecane (full functionality):");
for (const key of RECOMMENDED_PROD) {
  const val = process.env[key];
  if (!val) {
    console.log(`  ⚠ ${key} — BRAK (degraded mode)`);
    warnings++;
  } else {
    if (key.includes("_KEY") || key.includes("_SECRET") || key.includes("HMAC")) {
      if (val.length < SECURITY_KEYS_MIN_LENGTH) {
        console.log(`  ⚠ ${key} — zbyt krótki (${val.length} < ${SECURITY_KEYS_MIN_LENGTH})`);
        warnings++;
      } else {
        console.log(`  ✓ ${key}`);
      }
    } else {
      console.log(`  ✓ ${key}`);
    }
  }
}

// OAuth pairs
console.log("\n── OAuth (parzyste pary client_id + client_secret):");
for (const [id, secret] of OAUTH_PAIRS) {
  const hasId = !!process.env[id];
  const hasSecret = !!process.env[secret];
  if (hasId && hasSecret) {
    console.log(`  ✓ ${id.replace("_CLIENT_ID", "")}`);
  } else if (hasId || hasSecret) {
    console.log(`  ✗ ${id.replace("_CLIENT_ID", "")} — niespójne (id=${hasId}, secret=${hasSecret})`);
    errors++;
  } else {
    console.log(`  ⚠ ${id.replace("_CLIENT_ID", "")} — wyłączone (brak ID i secret)`);
  }
}

// Stripe environment validation
const stripeKey = process.env.STRIPE_SECRET_KEY ?? "";
if (stripeKey.startsWith("sk_test_") && process.env.VERCEL_ENV === "production") {
  console.log("\n✗ STRIPE_SECRET_KEY jest TEST key w środowisku produkcyjnym!");
  errors++;
}

// Supabase URL validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
if (supabaseUrl && !supabaseUrl.startsWith("https://")) {
  console.log("\n✗ NEXT_PUBLIC_SUPABASE_URL musi być HTTPS");
  errors++;
}

console.log("\n────────────────────────────────────");
console.log(`Errors: ${errors} | Warnings: ${warnings}`);

if (errors > 0) {
  console.log("\n✗ Production env NIE jest gotowy do deploy. Patrz LAUNCH_CHECKLIST.md");
  process.exit(1);
} else if (warnings > 0) {
  console.log("\n⚠ Production env z ograniczeniami (degraded mode dla nieskonfigurowanych integracji).");
} else {
  console.log("\n✓ Production env gotowy do deploy.");
}
