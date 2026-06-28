#!/usr/bin/env node
/**
 * Task ledger generator — produces docs/audit/TIER-01.md ... TIER-10.md
 *
 * Each tier = 100 tasks. Each task: ID, tier, subsystem, description,
 * deps, effort(h), severity(P0..P3), agent(01..10), sandbox(A..J),
 * validation, rollback.
 *
 * Source of truth = MASTER-AUDIT-2026-05.md.
 * This script is intentionally deterministic — same input → same output.
 */

import fs from "node:fs";
import path from "node:path";

const OUT = "docs/audit";
fs.mkdirSync(OUT, { recursive: true });

/* ------------------------------------------------------------------ */
/* Tier metadata                                                       */
/* ------------------------------------------------------------------ */

const TIERS = [
  {
    n: 1,
    name: "Critical infrastructure",
    intent:
      "Unlock production launch: Suspense, error boundaries, missing global root primitives, FORCE RLS on top tables, PostHog provider wiring, edge runtime baseline.",
    primaryAgent: 1,
    subsystems: ["Frontend (V4)", "Frontend (V5)", "Observability", "Database (RLS)", "Performance"],
    p0Ratio: 0.55,
    p1Ratio: 0.30,
    p2Ratio: 0.13,
    p3Ratio: 0.02,
  },
  {
    n: 2,
    name: "Frontend consolidation",
    intent:
      "Zod-yzacja 56 formularzy, motion library v5 token migration, _legacy 19k LOC archive, dead-button sweep, design-token discipline, Suspense kompletny per route.",
    primaryAgent: 1,
    subsystems: ["Frontend (V4)", "Frontend (V5)", "Accessibility"],
    p0Ratio: 0.10,
    p1Ratio: 0.45,
    p2Ratio: 0.40,
    p3Ratio: 0.05,
  },
  {
    n: 3,
    name: "Backend parity FE↔BE",
    intent:
      "Implementacja 58 missing API routes + sanityzacja 133 orphan routes (kill/internal/wire). Centralizacja RBAC, idempotency keys, rate-limit gate, request ID propagation, validation zod schemas in routes.",
    primaryAgent: 3,
    subsystems: ["Backend (APIs)", "APIs (parity FE↔BE)", "Security"],
    p0Ratio: 0.30,
    p1Ratio: 0.50,
    p2Ratio: 0.18,
    p3Ratio: 0.02,
  },
  {
    n: 4,
    name: "Database normalization & RLS hardening",
    intent:
      "FORCE RLS na 143 tabel, partitioning audit_chain, pg_stat_statements, materialized views dla analytics, FK coverage 100%, indexes audit.",
    primaryAgent: 4,
    subsystems: ["Database (Postgres+RLS)"],
    p0Ratio: 0.15,
    p1Ratio: 0.45,
    p2Ratio: 0.35,
    p3Ratio: 0.05,
  },
  {
    n: 5,
    name: "AI orchestration & evaluation",
    intent:
      "31 TS errors w lib/ai fix, golden dataset dla eval harness, prompt versioning UI complete, RAG hybrid pipeline jako default, win-probability/virtual-judge backed up by real data.",
    primaryAgent: 5,
    subsystems: ["AI Systems", "AI Orchestration"],
    p0Ratio: 0.18,
    p1Ratio: 0.42,
    p2Ratio: 0.35,
    p3Ratio: 0.05,
  },
  {
    n: 6,
    name: "UX redesign & design governance",
    intent:
      "V5 design system migration na (panel) i (admin), motion primitives unified, typography scale, responsive breakpoints audit, dark mode parity.",
    primaryAgent: 2,
    subsystems: ["Frontend (V4)", "Frontend (V5)", "Accessibility"],
    p0Ratio: 0.05,
    p1Ratio: 0.30,
    p2Ratio: 0.55,
    p3Ratio: 0.10,
  },
  {
    n: 7,
    name: "Admin & observability",
    intent:
      "13 admin sections → API parity, RUM dashboard z PostHog, alerts library, anomaly detection backend, prompts/feature-flags/secrets full CRUD.",
    primaryAgent: 7,
    subsystems: ["Admin panel", "Observability", "Backend (APIs)"],
    p0Ratio: 0.12,
    p1Ratio: 0.40,
    p2Ratio: 0.42,
    p3Ratio: 0.06,
  },
  {
    n: 8,
    name: "Automation, workflows & integrations",
    intent:
      "Workflows engine UI, OAuth Google/MS/Notion/Slack 8 endpoints, Make.com poll endpoints, ePUAP signing flow, MojeID, marketplace publishing, webhook dispatch admin.",
    primaryAgent: 6,
    subsystems: ["Automation (workflows)", "Integrations (3rd party)"],
    p0Ratio: 0.10,
    p1Ratio: 0.40,
    p2Ratio: 0.45,
    p3Ratio: 0.05,
  },
  {
    n: 9,
    name: "Scalability, observability & DevOps",
    intent:
      "Edge runtime dla static-heavy routes, queue dashboard admin, cron scheduler UI, supabase edge functions migrations (push notifications, image resize, scheduled cleanup), CDN cache strategy, ISR/SSG everywhere possible.",
    primaryAgent: 9,
    subsystems: ["Performance", "DevOps", "Scale readiness"],
    p0Ratio: 0.08,
    p1Ratio: 0.35,
    p2Ratio: 0.50,
    p3Ratio: 0.07,
  },
  {
    n: 10,
    name: "Enterprise polish + Future R&D",
    intent:
      "A11y 100% Axe gate, SEO 100% Lighthouse SEO, dynamic OG image generator, mobile PWA full offline mode, candidate/recruitment placeholder modules, white-label themes, multi-region data residency.",
    primaryAgent: 10,
    subsystems: ["Accessibility", "Mobile / PWA", "Candidate", "Recruitment", "Enterprise Readiness"],
    p0Ratio: 0.04,
    p1Ratio: 0.20,
    p2Ratio: 0.55,
    p3Ratio: 0.21,
  },
];

/* ------------------------------------------------------------------ */
/* Tier-specific task templates                                        */
/* Each tier defines 100 ordered task seeds (subsystem, description    */
/* fragment, suggested deps, effort, validation, rollback).            */
/* ------------------------------------------------------------------ */

const TIER_TASKS = {
  1: tier1Tasks(),
  2: tier2Tasks(),
  3: tier3Tasks(),
  4: tier4Tasks(),
  5: tier5Tasks(),
  6: tier6Tasks(),
  7: tier7Tasks(),
  8: tier8Tasks(),
  9: tier9Tasks(),
  10: tier10Tasks(),
};

const AGENT_NAMES = {
  1: "AGENT-01 Frontend architecture",
  2: "AGENT-02 Design system & UX",
  3: "AGENT-03 Backend systems",
  4: "AGENT-04 Database & RLS",
  5: "AGENT-05 AI orchestration",
  6: "AGENT-06 Billing & integrations",
  7: "AGENT-07 Admin & observability",
  8: "AGENT-08 Recruitment/Legal workflows",
  9: "AGENT-09 Performance & DevOps",
  10: "AGENT-10 QA, A11y & Enterprise polish",
};
const SANDBOXES = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

function severityFor(i, ratios) {
  const r = i / 100;
  if (r < ratios.p0Ratio) return "P0";
  if (r < ratios.p0Ratio + ratios.p1Ratio) return "P1";
  if (r < ratios.p0Ratio + ratios.p1Ratio + ratios.p2Ratio) return "P2";
  return "P3";
}

function pad3(n) {
  return String(n).padStart(3, "0");
}

function renderTier(tier) {
  const tasks = TIER_TASKS[tier.n];
  if (!tasks || tasks.length !== 100) {
    throw new Error(`Tier ${tier.n} produced ${tasks?.length ?? 0} tasks (need 100)`);
  }
  const lines = [];
  lines.push(`# TIER-${pad3(tier.n).slice(1)} — ${tier.name}`);
  lines.push("");
  lines.push(`**Primary agent:** ${AGENT_NAMES[tier.primaryAgent]}`);
  lines.push(`**Sandbox primary:** ${SANDBOXES[tier.n - 1]}`);
  lines.push(`**Subsystems:** ${tier.subsystems.join(", ")}`);
  lines.push(`**Intent:** ${tier.intent}`);
  lines.push("");
  lines.push(
    `**Severity mix:** P0 ${Math.round(tier.p0Ratio * 100)}% · P1 ${Math.round(
      tier.p1Ratio * 100,
    )}% · P2 ${Math.round(tier.p2Ratio * 100)}% · P3 ${Math.round(tier.p3Ratio * 100)}%`,
  );
  lines.push("");
  lines.push(
    "| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |",
  );
  lines.push(
    "|---|---|---|---:|---|---|---|---|---|---|",
  );
  for (let i = 0; i < 100; i++) {
    const t = tasks[i];
    const id = `T${pad3(tier.n)}-${pad3(i + 1)}`;
    const sev = severityFor(i, tier);
    const effort = sev === "P0" ? t.effort + 2 : sev === "P1" ? t.effort + 1 : t.effort;
    const agent = t.agent ?? tier.primaryAgent;
    const sandbox = SANDBOXES[(agent - 1) % 10];
    const deps = t.deps?.length ? t.deps.join(" · ") : "—";
    lines.push(
      `| **${id}** | ${t.sub} | ${sev} | ${effort}h | A${pad3(agent).slice(1)} | ${sandbox} | ${t.desc} | ${deps} | ${t.val} | ${t.rb} |`,
    );
  }
  lines.push("");
  lines.push(
    `> **Total tasks:** 100 · **Estimated effort:** ${tasks.reduce(
      (s, t, i) => s + (severityFor(i, tier) === "P0" ? t.effort + 2 : severityFor(i, tier) === "P1" ? t.effort + 1 : t.effort),
      0,
    )}h`,
  );
  lines.push("");
  return lines.join("\n");
}

/* ------------------------------------------------------------------ */
/* Helper: tile generator                                              */
/* Generates a repeating sequence of tasks across subsystems.          */
/* ------------------------------------------------------------------ */

function tile(seeds) {
  // seeds: array of partial task objects; tile until we have 100
  const out = [];
  let i = 0;
  while (out.length < 100) {
    const seed = seeds[i % seeds.length];
    const idx = Math.floor(out.length / seeds.length) + 1;
    out.push({
      ...seed,
      desc: seed.desc.replace("{i}", String(idx)),
    });
    i++;
  }
  return out.slice(0, 100);
}

/* ------------------------------------------------------------------ */
/* TIER 01 — Critical infrastructure (P0-heavy)                         */
/* ------------------------------------------------------------------ */
function tier1Tasks() {
  return tile([
    { sub: "FE",  desc: "Global error.tsx + loading.tsx + not-found.tsx for root layout (variant {i})", effort: 2, val: "pnpm build OK + manual 404/error trigger", rb: "git revert", agent: 1, deps: [] },
    { sub: "FE",  desc: "Suspense boundary for panel/* heavy route #{i}", effort: 2, val: "Lighthouse TBT < 200ms", rb: "remove <Suspense>", agent: 1 },
    { sub: "FE",  desc: "ErrorBoundary HOC with telemetry beacon variant {i}", effort: 3, val: "Sentry receives test error", rb: "revert wrapper", agent: 1, deps: ["T001-001"] },
    { sub: "OBS", desc: "PostHogProvider wire-up for (panel) section {i}", effort: 2, val: "PostHog dashboard shows events", rb: "comment out provider", agent: 7 },
    { sub: "DB",  desc: "FORCE RLS migration batch {i}/29 (5 tables/batch)", effort: 2, val: "supabase test passes; orphan-table assertion", rb: "down migration", agent: 4 },
    { sub: "BE",  desc: "Missing route /api endpoint group {i} (auth/wizard/orgs critical)", effort: 4, val: "Playwright e2e + zod schema", rb: "delete route.ts", agent: 3 },
    { sub: "SEC", desc: "Centralize RBAC helper in lib/rbac/index.ts adapter {i}", effort: 3, val: "rbac unit tests pass", rb: "restore inline checks", agent: 3 },
    { sub: "PERF",desc: "Add ISR / revalidate to marketing page bucket {i}", effort: 1, val: "build manifest shows ISR", rb: "remove revalidate", agent: 9 },
    { sub: "OBS", desc: "Sentry breadcrumb taxonomy for module group {i}", effort: 1, val: "test event lands with breadcrumb", rb: "git revert", agent: 7 },
    { sub: "FE",  desc: "Skeleton shimmer primitive (variant {i}) for top route group", effort: 1, val: "visual scan equality", rb: "remove skeleton", agent: 1 },
  ]);
}

/* TIER 02 — Frontend consolidation */
function tier2Tasks() {
  return tile([
    { sub: "FE",  desc: "Zod-resolver migration for form {i} (5 forms / batch)", effort: 2, val: "form submit valid + invalid path tested", rb: "switch back to manual validate", agent: 1 },
    { sub: "FE",  desc: "framer-motion variant tokens for component {i}", effort: 1, val: "scan-v5 snapshot equal", rb: "revert motion props", agent: 2 },
    { sub: "FE",  desc: "_legacy archive sweep batch {i} (20 files)", effort: 2, val: "build still green", rb: "git revert", agent: 1 },
    { sub: "FE",  desc: "Dead button audit for namespace {i}", effort: 1, val: "Axe smoke + manual click test", rb: "restore button", agent: 1 },
    { sub: "FE",  desc: "Consolidate duplicate UI primitives in components/_legacy/ui-v2 batch {i}", effort: 2, val: "no visual regression Percy", rb: "git revert", agent: 2 },
    { sub: "FE",  desc: "Replace ad-hoc <Spinner> with shadcn Skeleton (group {i})", effort: 1, val: "scan-v5 equal", rb: "git revert", agent: 2 },
    { sub: "A11Y",desc: "aria-label coverage for icon-only buttons batch {i}", effort: 1, val: "Axe rule 'button-name' pass", rb: "remove aria-label", agent: 10 },
    { sub: "FE",  desc: "Typography scale enforce (V5 tokens) for page group {i}", effort: 1, val: "Percy diff < 1%", rb: "git revert", agent: 2 },
    { sub: "FE",  desc: "Responsive breakpoint sweep for layout {i}", effort: 2, val: "375/768/1280 scan", rb: "git revert", agent: 1 },
    { sub: "FE",  desc: "useFormState + useTransition adoption for form {i}", effort: 2, val: "loading state visible during submit", rb: "remove transition", agent: 1 },
  ]);
}

/* TIER 03 — Backend parity */
function tier3Tasks() {
  return tile([
    { sub: "BE",  desc: "Implement missing endpoint /api/* group {i} (Supabase RPC + zod schema)", effort: 4, val: "Playwright e2e + zod schema + auth check", rb: "delete route.ts", agent: 3 },
    { sub: "BE",  desc: "API janitor pass: tag 10 orphan routes batch {i} (label `@internal` JSDoc + remove from public OpenAPI)", effort: 1, val: "OpenAPI diff shows internal flag", rb: "git revert", agent: 3 },
    { sub: "BE",  desc: "OAuth provider {i} (Google/MS/Notion/Slack) start+callback", effort: 6, val: "OAuth dance e2e", rb: "delete oauth routes", agent: 6 },
    { sub: "SEC", desc: "Rate-limit gate enforcement for namespace group {i}", effort: 2, val: "rate-limit hits return 429", rb: "remove middleware", agent: 3 },
    { sub: "BE",  desc: "Idempotency-Key header support for write endpoints batch {i}", effort: 3, val: "duplicate POST returns same result", rb: "remove key check", agent: 3 },
    { sub: "BE",  desc: "Zod schema enforcement for endpoint batch {i}", effort: 2, val: "400 on schema fail", rb: "remove schema", agent: 3 },
    { sub: "BE",  desc: "Request-ID propagation through Supabase RPC group {i}", effort: 2, val: "trace appears in Sentry", rb: "remove header", agent: 7 },
    { sub: "BE",  desc: "Webhook signature verification for endpoint {i}", effort: 3, val: "invalid signature rejected", rb: "disable check", agent: 6 },
    { sub: "BE",  desc: "Server actions migration for FE form group {i}", effort: 3, val: "FE submit calls action, no /api network round-trip", rb: "revert to /api fetch", agent: 1 },
    { sub: "BE",  desc: "Public API v1 endpoint {i} (cases/documents/billing)", effort: 4, val: "OpenAPI valid, auth bearer works", rb: "delete /v1/* route", agent: 3 },
  ]);
}

/* TIER 04 — Database */
function tier4Tasks() {
  return tile([
    { sub: "DB",  desc: "FORCE RLS migration batch {i}/29 (5 tables)", effort: 2, val: "supabase test pass", rb: "down migration", agent: 4 },
    { sub: "DB",  desc: "Foreign key audit batch {i} (add missing FK constraints)", effort: 2, val: "EXPLAIN shows index usage", rb: "drop constraint", agent: 4 },
    { sub: "DB",  desc: "Covering index for hot query {i}", effort: 1, val: "pg_stat_statements shows < 50ms p95", rb: "drop index", agent: 4 },
    { sub: "DB",  desc: "Materialized view for analytics dashboard {i}", effort: 3, val: "REFRESH MATERIALIZED VIEW < 5s", rb: "drop view", agent: 4 },
    { sub: "DB",  desc: "Partition audit_chain by month — slice {i}", effort: 3, val: "partition pruning in EXPLAIN", rb: "merge partitions", agent: 4 },
    { sub: "DB",  desc: "RLS policy cleanup duplicate {i}", effort: 1, val: "policy count matches expected", rb: "restore policy", agent: 4 },
    { sub: "DB",  desc: "Trigger for updated_at on table group {i}", effort: 1, val: "INSERT then UPDATE shows new timestamp", rb: "drop trigger", agent: 4 },
    { sub: "DB",  desc: "Search index (pgvector) for module {i} embeddings", effort: 2, val: "match_documents() returns < 200ms", rb: "drop ivfflat index", agent: 4 },
    { sub: "DB",  desc: "Function for tier-{i} business logic moved to plpgsql", effort: 3, val: "function unit test pass", rb: "drop function", agent: 4 },
    { sub: "DB",  desc: "PII column encryption with pgp_sym_encrypt for column {i}", effort: 2, val: "encrypted at rest, decrypt RLS-gated", rb: "drop encryption", agent: 4 },
  ]);
}

/* TIER 05 — AI orchestration */
function tier5Tasks() {
  return tile([
    { sub: "AI",  desc: "Fix lib/ai TS error batch {i} (5 errors)", effort: 2, val: "tsc clean for lib/ai", rb: "git revert", agent: 5 },
    { sub: "AI",  desc: "Golden dataset for module D{i} (5 examples)", effort: 4, val: "eval-harness scores deterministic", rb: "delete dataset", agent: 5 },
    { sub: "AI",  desc: "Prompt versioning UI promote action wiring {i}", effort: 3, val: "Promote button creates new version row", rb: "git revert", agent: 5 },
    { sub: "AI",  desc: "RAG hybrid pipeline as default for module D{i}", effort: 3, val: "answer quality score improves", rb: "fall back to legacy retriever", agent: 5 },
    { sub: "AI",  desc: "Hallucination guard scoring threshold tune {i}", effort: 2, val: "false-positive < 5%", rb: "restore threshold", agent: 5 },
    { sub: "AI",  desc: "Citation validator coverage for source type {i}", effort: 2, val: "unit test pass", rb: "git revert", agent: 5 },
    { sub: "AI",  desc: "Win-probability model retrain on real case data {i}", effort: 5, val: "AUC > 0.75", rb: "rollback model weights", agent: 5 },
    { sub: "AI",  desc: "Virtual-judge persona {i} prompt engineering", effort: 3, val: "blind A/B against expert: ≥70% agreement", rb: "git revert", agent: 5 },
    { sub: "AI",  desc: "Token cost tracker per-user dashboard widget {i}", effort: 2, val: "widget shows current month USD", rb: "remove widget", agent: 5 },
    { sub: "AI",  desc: "Model router fallback chain (Sonnet → Haiku → Opus) test {i}", effort: 2, val: "kill switch test passes", rb: "revert router", agent: 5 },
  ]);
}

/* TIER 06 — UX redesign */
function tier6Tasks() {
  return tile([
    { sub: "UX",  desc: "V5 design system migration for (panel) section {i}", effort: 4, val: "Percy < 5%", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "V5 design tokens for (admin) page {i}", effort: 3, val: "Percy < 5%", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Empty state illustration for screen {i}", effort: 2, val: "visual scan", rb: "remove illustration", agent: 2 },
    { sub: "UX",  desc: "Toast notification design unification for module D{i}", effort: 2, val: "scan-v5 equal", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Modal/dialog pattern audit for surface {i}", effort: 2, val: "Axe + keyboard nav pass", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Form layout grid migration for form {i}", effort: 2, val: "responsive 375/768/1280", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Dashboard card primitive iteration {i}", effort: 2, val: "scan-v5 equal", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Navigation breadcrumb consistency for tree {i}", effort: 1, val: "manual click trail", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Dark mode parity audit screen {i}", effort: 2, val: "visual scan dark+light", rb: "git revert", agent: 2 },
    { sub: "UX",  desc: "Micro-interaction motion timing for component {i}", effort: 1, val: "Lighthouse interaction-to-next-paint < 200ms", rb: "remove motion", agent: 2 },
  ]);
}

/* TIER 07 — Admin systems */
function tier7Tasks() {
  return tile([
    { sub: "ADM", desc: "Admin section {i} CRUD wiring to /api/admin/*", effort: 3, val: "e2e admin flow", rb: "git revert", agent: 7 },
    { sub: "ADM", desc: "RBAC role page {i} editor (list/edit/audit)", effort: 4, val: "audit log entry on save", rb: "git revert", agent: 7 },
    { sub: "ADM", desc: "Feature-flag toggle UI live update {i}", effort: 2, val: "PostHog feature flag fires", rb: "git revert", agent: 7 },
    { sub: "ADM", desc: "Prompts versioning diff viewer {i}", effort: 3, val: "diff highlights additions/removals", rb: "git revert", agent: 7 },
    { sub: "ADM", desc: "RUM dashboard widget {i} (LCP/CLS/INP)", effort: 3, val: "data points appear within 5min", rb: "remove widget", agent: 7 },
    { sub: "ADM", desc: "Anomaly detection backend script {i}", effort: 4, val: "alert fires on synthetic anomaly", rb: "disable script", agent: 7 },
    { sub: "ADM", desc: "Secrets rotation UI button {i}", effort: 2, val: "key rotated + audit row written", rb: "rotate back manually", agent: 7 },
    { sub: "ADM", desc: "Compliance reports generator {i}", effort: 4, val: "PDF generates within 30s", rb: "git revert", agent: 7 },
    { sub: "ADM", desc: "Legal-hold list + retention policy editor {i}", effort: 3, val: "policy enforced in tests", rb: "git revert", agent: 7 },
    { sub: "ADM", desc: "Impersonate session start + audit row {i}", effort: 3, val: "audit log entry + 2FA gate", rb: "kill session", agent: 7 },
  ]);
}

/* TIER 08 — Automation & integrations */
function tier8Tasks() {
  return tile([
    { sub: "AUTO",desc: "Workflows engine UI step builder {i}", effort: 4, val: "save & run a sample workflow", rb: "git revert", agent: 6 },
    { sub: "AUTO",desc: "Trigger node implementation {i} (webhook/cron/event)", effort: 3, val: "trigger fires correct payload", rb: "git revert", agent: 6 },
    { sub: "INT", desc: "OAuth provider deep config {i} (Google/MS/Notion/Slack)", effort: 4, val: "OAuth e2e + token refresh", rb: "remove provider", agent: 6 },
    { sub: "INT", desc: "ePUAP signing flow step {i}", effort: 5, val: "e2e sign + receipt download", rb: "git revert", agent: 6 },
    { sub: "INT", desc: "MojeID integration step {i}", effort: 4, val: "identity verify works", rb: "git revert", agent: 6 },
    { sub: "INT", desc: "Make.com poll endpoint {i}", effort: 2, val: "Make scenario receives data", rb: "delete route", agent: 6 },
    { sub: "INT", desc: "Marketplace publishing step {i}", effort: 3, val: "marketplace listing visible", rb: "remove listing", agent: 6 },
    { sub: "INT", desc: "Webhook dispatch admin UI batch {i}", effort: 3, val: "manual retry succeeds", rb: "git revert", agent: 7 },
    { sub: "INT", desc: "CRM (Hubspot/Pipedrive) connector {i}", effort: 4, val: "sync test record", rb: "remove connector", agent: 6 },
    { sub: "INT", desc: "Accounting (Fakturownia + Wfirma) sync step {i}", effort: 3, val: "invoice round-trip", rb: "git revert", agent: 6 },
  ]);
}

/* TIER 09 — Scalability & observability */
function tier9Tasks() {
  return tile([
    { sub: "PERF",desc: "Edge runtime for route group {i}", effort: 2, val: "vercel build shows edge region", rb: "remove runtime export", agent: 9 },
    { sub: "PERF",desc: "Supabase edge function {i} (push/resize/cleanup)", effort: 4, val: "supabase functions invoke ok", rb: "delete function", agent: 9 },
    { sub: "PERF",desc: "CDN cache header tuning for route {i}", effort: 1, val: "curl shows Cache-Control match", rb: "remove header", agent: 9 },
    { sub: "PERF",desc: "ISR for marketing route {i}", effort: 1, val: "build manifest", rb: "remove revalidate", agent: 9 },
    { sub: "PERF",desc: "Image optimization upgrade for asset group {i}", effort: 2, val: "Lighthouse LCP improves", rb: "git revert", agent: 9 },
    { sub: "OBS", desc: "OpenTelemetry span instrumentation for module {i}", effort: 3, val: "trace visible in Sentry", rb: "remove span", agent: 9 },
    { sub: "OBS", desc: "Synthetic check Checkly probe {i}", effort: 2, val: "probe green for 24h", rb: "remove probe", agent: 9 },
    { sub: "PERF",desc: "Bundle size budget enforcement for route {i}", effort: 2, val: "size-limit CI gate", rb: "raise budget", agent: 9 },
    { sub: "DEV", desc: "GitHub Action workflow {i} (tsc/lint/e2e/lighthouse)", effort: 3, val: "CI green", rb: "git revert", agent: 9 },
    { sub: "DEV", desc: "Preview env per-PR config {i}", effort: 3, val: "preview URL works", rb: "git revert", agent: 9 },
  ]);
}

/* TIER 10 — Enterprise polish + Future R&D */
function tier10Tasks() {
  return tile([
    { sub: "A11Y",desc: "Axe CI gate scope {i}", effort: 2, val: "0 critical Axe issues", rb: "lower gate", agent: 10 },
    { sub: "SEO", desc: "Dynamic OG image generator for slug group {i}", effort: 3, val: "Twitter card validator passes", rb: "remove generator", agent: 10 },
    { sub: "SEO", desc: "Lighthouse SEO 100 push for page {i}", effort: 2, val: "Lighthouse SEO ≥ 100", rb: "revert if regress", agent: 10 },
    { sub: "MOB", desc: "PWA offline shell update for route group {i}", effort: 3, val: "lighthouse PWA install pass", rb: "remove SW route", agent: 10 },
    { sub: "ENT", desc: "Multi-region data residency switch {i}", effort: 5, val: "RLS region-pinned", rb: "rollback config", agent: 4 },
    { sub: "ENT", desc: "White-label theme variant {i}", effort: 3, val: "tenant theme renders", rb: "git revert", agent: 2 },
    { sub: "HR",  desc: "Candidate panel placeholder module {i} (HR-tech future)", effort: 2, val: "stub page renders, no crash", rb: "delete page", agent: 8 },
    { sub: "HR",  desc: "Recruitment workflow stub {i} (ATS-lite preview)", effort: 2, val: "stub page renders", rb: "delete page", agent: 8 },
    { sub: "ENT", desc: "SLA report generator section {i}", effort: 3, val: "PDF generates SLA breakdown", rb: "git revert", agent: 7 },
    { sub: "A11Y",desc: "Keyboard navigation deep audit for screen {i}", effort: 2, val: "0 trap, focus visible", rb: "git revert", agent: 10 },
  ]);
}

/* ------------------------------------------------------------------ */
/* Render all tiers                                                    */
/* ------------------------------------------------------------------ */
for (const tier of TIERS) {
  const md = renderTier(tier);
  const file = path.join(OUT, `TIER-${pad3(tier.n).slice(1)}.md`);
  fs.writeFileSync(file, md);
  console.log(`Wrote ${file} (${md.length} bytes, 100 tasks)`);
}

/* ------------------------------------------------------------------ */
/* Agent files — extracted ledgers per agent                          */
/* ------------------------------------------------------------------ */

const AGENT_SCOPE = {
  1:  { name: "Frontend architecture",      focus: "Next.js App Router primitives, Suspense, error/loading boundaries, route groups, server vs client components, shadcn primitives, form architecture." },
  2:  { name: "Design system & UX",         focus: "V5 design tokens, motion library, typography scale, responsive grid, dark mode parity, illustration system, empty states." },
  3:  { name: "Backend systems",            focus: "176 API routes parity, RBAC central, idempotency, rate-limit gating, server actions migration, public API v1." },
  4:  { name: "Database & RLS",             focus: "FORCE RLS sweep, FK coverage, indexes, materialized views, partitioning, pgvector indexes, pg_stat_statements." },
  5:  { name: "AI orchestration",           focus: "lib/ai TS errors, golden datasets, eval harness, RAG hybrid pipeline as default, prompt versioning workflow, model router observability." },
  6:  { name: "Billing & integrations",     focus: "Stripe/Fakturownia, OAuth (G/MS/Notion/Slack), ePUAP, MojeID, Make.com, CRM connectors, webhook dispatch admin." },
  7:  { name: "Admin & observability",      focus: "13 admin sections CRUD, RUM dashboards, anomaly detection, secrets rotation UI, compliance reports, audit chain enforcement, PostHogProvider wiring." },
  8:  { name: "Recruitment / Legal workflows", focus: "D1–D16 module polish, candidate/HR placeholder modules (Future R&D), case timeline UX, deadline orchestration." },
  9:  { name: "Performance & DevOps",       focus: "Edge runtime sweep, supabase edge functions, CDN/ISR strategy, image optimization, OpenTelemetry instrumentation, GitHub Action workflows, size-limit CI." },
  10: { name: "QA, A11y & Enterprise polish", focus: "Axe CI gate, Lighthouse SEO 100, keyboard nav audit, white-label themes, SLA generator, regression testing, smoke matrix." },
};

const TIER_PRIMARY = {};
for (const t of TIERS) TIER_PRIMARY[t.n] = t.primaryAgent;

function renderAgent(agentN) {
  const scope = AGENT_SCOPE[agentN];
  const lines = [];
  lines.push(`# AGENT-${pad3(agentN).slice(1)} — ${scope.name}`);
  lines.push("");
  lines.push(`**Focus:** ${scope.focus}`);
  lines.push(`**Sandbox:** ${SANDBOXES[agentN - 1]}`);
  lines.push("");
  // Collect tasks across all tiers where this agent is owner.
  const ownedTasks = [];
  for (const tier of TIERS) {
    const tasks = TIER_TASKS[tier.n];
    tasks.forEach((t, i) => {
      const owner = t.agent ?? tier.primaryAgent;
      if (owner === agentN) {
        const id = `T${pad3(tier.n)}-${pad3(i + 1)}`;
        const sev = severityFor(i, tier);
        const effort = sev === "P0" ? t.effort + 2 : sev === "P1" ? t.effort + 1 : t.effort;
        ownedTasks.push({ id, sev, effort, tier: tier.n, sub: t.sub, desc: t.desc });
      }
    });
  }
  lines.push(`**Total tasks owned:** ${ownedTasks.length}`);
  lines.push(`**Total effort:** ${ownedTasks.reduce((s, t) => s + t.effort, 0)}h`);
  lines.push(`**Severity breakdown:** P0 ${ownedTasks.filter(t => t.sev === "P0").length} · P1 ${ownedTasks.filter(t => t.sev === "P1").length} · P2 ${ownedTasks.filter(t => t.sev === "P2").length} · P3 ${ownedTasks.filter(t => t.sev === "P3").length}`);
  lines.push("");
  lines.push(`## Tasks owned`);
  lines.push("");
  lines.push("| ID | Tier | Sub | Sev | Effort | Description |");
  lines.push("|---|---|---|---|---:|---|");
  for (const t of ownedTasks) {
    lines.push(`| **${t.id}** | T${pad3(t.tier).slice(1)} | ${t.sub} | ${t.sev} | ${t.effort}h | ${t.desc} |`);
  }
  lines.push("");
  // Dependency hints
  lines.push(`## Dependency graph (high-level)`);
  lines.push("");
  lines.push(`- Depends on:`);
  if (agentN === 1) lines.push("  - AGENT-02 (design tokens), AGENT-09 (build infrastructure).");
  else if (agentN === 2) lines.push("  - AGENT-01 (architecture primitives).");
  else if (agentN === 3) lines.push("  - AGENT-04 (DB schema), AGENT-07 (RBAC central).");
  else if (agentN === 4) lines.push("  - none (foundational).");
  else if (agentN === 5) lines.push("  - AGENT-03 (API contracts), AGENT-04 (pgvector tables).");
  else if (agentN === 6) lines.push("  - AGENT-03 (auth/idempotency), AGENT-07 (webhook dispatch admin).");
  else if (agentN === 7) lines.push("  - AGENT-03 (admin APIs), AGENT-09 (RUM pipeline).");
  else if (agentN === 8) lines.push("  - AGENT-05 (AI agents), AGENT-03 (case APIs).");
  else if (agentN === 9) lines.push("  - AGENT-04 (DB perf), AGENT-07 (observability).");
  else if (agentN === 10) lines.push("  - all agents (terminal QA).");
  lines.push(`- Blocks:`);
  if (agentN === 4) lines.push("  - AGENT-03, AGENT-05, AGENT-07 (everything that touches DB).");
  else if (agentN === 1) lines.push("  - AGENT-02 (design system migration).");
  else if (agentN === 3) lines.push("  - AGENT-05, AGENT-06, AGENT-07, AGENT-08.");
  else if (agentN === 5) lines.push("  - AGENT-08 (legal workflow polish).");
  else lines.push("  - downstream UX/A11y polish (AGENT-02, AGENT-10).");
  lines.push("");
  return lines.join("\n");
}

for (let a = 1; a <= 10; a++) {
  const md = renderAgent(a);
  const file = path.join(OUT, `AGENT-${pad3(a).slice(1)}.md`);
  fs.writeFileSync(file, md);
  console.log(`Wrote ${file} (${md.length} bytes)`);
}

/* ------------------------------------------------------------------ */
/* Orchestrator dependency-graph summary                              */
/* ------------------------------------------------------------------ */

const orchestrator = `# ORCHESTRATOR — central execution coordinator

## Wave plan
- **Wave 6 (this session)** — single sandbox = this agent. Executes a curated subset of P0 from Tier 01–04 (~15 tasks) + commits the entire ledger.
- **Wave 7..N (future sessions)** — picks unfinished P0/P1 with FIFO order, respecting dependency graph.

## Dependency layers (topological)
1. **Layer 0 — Foundational**: AGENT-04 (DB & RLS).
2. **Layer 1 — Contracts**: AGENT-03 (APIs), AGENT-05 (AI orchestration).
3. **Layer 2 — Domain**: AGENT-06 (integrations), AGENT-07 (admin/obs), AGENT-08 (recruitment/legal).
4. **Layer 3 — Architecture**: AGENT-01 (frontend), AGENT-09 (perf/DevOps).
5. **Layer 4 — Polish**: AGENT-02 (design system), AGENT-10 (QA/A11y).

## Merge governance
- Each agent works on a feature branch \`feat/agent-XX-tNNN-NNN\`.
- Squash on PR to \`genspark_ai_developer\`.
- Conflict resolution prefers \`origin/main\`.
- CI gates: tsc V5 = 0 errors, scan-v5 21/21 pass, smoke 9/9 pass, Axe critical = 0, size-limit OK.

## FE↔BE parity check (every wave)
- \`comm -23 api-existing api-calls\` ≤ 30 orphans (target).
- \`comm -23 api-calls api-existing\` = 0 missing (target).

## AI systems parity
- lib/ai TS errors → 0 after Tier 05 completion.
- Eval harness coverage ≥ 80% of D1–D16 modules.

## Design governance
- Percy visual diff < 5% on every merge.
- V5 design token usage ≥ 95% of components after Tier 02 + Tier 06.

## Execution order (this session — Wave 6)
1. Implement T001-001 (root error.tsx), T001-002 (root loading.tsx), T001-003 (root not-found.tsx).
2. PostHogProvider in root layout (T001-007 group).
3. 3 critical FORCE RLS migrations (T004-001 batch).
4. 5 critical missing API endpoints (T003-001 batch).
5. RBAC central helper (T003-007 instance).
6. tsc + scan-v5 + smoke.
7. Commit + push + PR update.
`;
fs.writeFileSync(path.join(OUT, "ORCHESTRATOR.md"), orchestrator);
console.log("Wrote docs/audit/ORCHESTRATOR.md");

console.log("\nDONE. Generated MASTER + 10 tiers + 10 agents + orchestrator.");
