/**
 * Tier 10 — Deployment runbook generator. Machine-readable steps for releases.
 */
export interface RunbookStep {
  id: string;
  title: string;
  command?: string;
  notes?: string;
  rollback?: string;
  manual?: boolean;
}

export const DEPLOYMENT_RUNBOOK: RunbookStep[] = [
  {
    id: "0-prereq",
    title: "Verify clean working tree + green CI",
    command: "git status --porcelain && git log -1 --oneline",
    manual: true,
  },
  {
    id: "1-readiness",
    title: "Run readiness checklist",
    command: "curl -fsS $APP_URL/api/launch/readiness | jq .ready",
    rollback: "Fix blocking env vars before proceeding.",
  },
  {
    id: "2-db-backup",
    title: "Backup Supabase DB",
    command: "supabase db dump --linked > backups/$(date +%F_%H%M)_pre_release.sql",
    notes: "Retain for 30 days.",
  },
  {
    id: "3-migrations",
    title: "Apply migrations (idempotent)",
    command: "supabase db push --linked",
    rollback: "supabase db reset --linked && psql < backups/<latest>.sql",
  },
  {
    id: "4-build",
    title: "Build production artifact",
    command: "pnpm -F web build",
  },
  {
    id: "5-deploy",
    title: "Deploy to Vercel / target host",
    command: "vercel deploy --prod",
    rollback: "vercel rollback <previous-deployment>",
  },
  {
    id: "6-smoke",
    title: "Smoke test post-deploy",
    command: "curl -fsS $APP_URL/api/quality/health/deep",
  },
  {
    id: "7-monitor",
    title: "Watch Sentry + Stripe webhook log first 30 min",
    manual: true,
  },
  {
    id: "8-announce",
    title: "Announce release in #release channel",
    manual: true,
  },
];

export function getRunbookMarkdown(): string {
  const lines = ["# Długomat — deployment runbook", ""];
  for (const s of DEPLOYMENT_RUNBOOK) {
    lines.push(`## ${s.id} — ${s.title}`);
    if (s.manual) lines.push("_(manual step)_");
    if (s.command) lines.push("```bash\n" + s.command + "\n```");
    if (s.notes) lines.push(`> ${s.notes}`);
    if (s.rollback) lines.push(`**Rollback:** ${s.rollback}`);
    lines.push("");
  }
  return lines.join("\n");
}
