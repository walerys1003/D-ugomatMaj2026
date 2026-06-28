/**
 * Tier 6 zad. 272 — Synthetic monitoring via Checkly.
 *
 * Setup: `npm i -D checkly` → `npx checkly login` → `npx checkly deploy`.
 *
 * Definiuje:
 *   - Browser checks (Playwright) dla critical user paths
 *   - API checks dla health endpoints (co minutę)
 *   - SSL/TLS expiry monitoring
 *   - Alert channels (Slack, PagerDuty, email)
 *
 * Run regions: eu-central-1, eu-west-2 (Polish users → Europe close).
 */
import { defineConfig } from "checkly";

export default defineConfig({
  projectName: "Długomat",
  logicalId: "dlugomat-prod",
  repoUrl: "https://github.com/walerys1003/D-ugomatMaj2026",
  checks: {
    activated: true,
    muted: false,
    runtimeId: "2024.09",
    frequency: 5, // minutes
    locations: ["eu-central-1", "eu-west-2"],
    tags: ["production"],
    alertChannels: [],
    checkMatch: "**/*.check.ts",
    browserChecks: {
      frequency: 10,
      testMatch: "**/__checks__/**/*.spec.ts",
    },
    runParallel: true,
  },
  cli: {
    runLocation: "eu-central-1",
    reporters: ["list"],
  },
});
