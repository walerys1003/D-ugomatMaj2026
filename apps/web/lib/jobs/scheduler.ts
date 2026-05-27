/**
 * Tier 12 — Cron-style scheduled job runner.
 * Jobs are registered statically; the /api/jobs/run endpoint is hit by Vercel Cron or sb pg_cron.
 */
import { processDueDeliveries } from "@/lib/integrations/webhooks-v2";
import { pruneOldCache } from "@/lib/ai/cache";
import { runMonthlyPayouts } from "@/lib/affiliate/payouts";
import { pruneInactiveDevices } from "@/lib/mobile/device-registration";

export type CronExpr = string;

export interface ScheduledJob {
  key: string;
  description: string;
  cron: CronExpr;
  run: () => Promise<Record<string, unknown>>;
}

export const SCHEDULED_JOBS: ScheduledJob[] = [
  {
    key: "webhooks.dispatch",
    description: "Dispatch pending/failed webhook deliveries",
    cron: "* * * * *", // every minute
    run: async () => processDueDeliveries(50) as unknown as Record<string, unknown>,
  },
  {
    key: "ai.cache.prune",
    description: "Prune old AI response cache entries",
    cron: "0 3 * * *", // 03:00 daily
    run: async () => ({ pruned: await pruneOldCache(30) }),
  },
  {
    key: "affiliate.payouts.monthly",
    description: "Run monthly affiliate payouts",
    cron: "0 4 1 * *", // 04:00 on day 1
    run: async () => {
      const r = await runMonthlyPayouts();
      return r as unknown as Record<string, unknown>;
    },
  },
  {
    key: "mobile.devices.prune",
    description: "Prune inactive mobile devices >90d",
    cron: "0 5 * * 0", // 05:00 sundays
    run: async () => {
      const pruned = await pruneInactiveDevices(90);
      return { pruned } as Record<string, unknown>;
    },
  },
];

export async function runJob(key: string): Promise<{ key: string; result: Record<string, unknown>; ms: number }> {
  const job = SCHEDULED_JOBS.find((j) => j.key === key);
  if (!job) throw new Error(`unknown_job:${key}`);
  const t0 = Date.now();
  const result = await job.run();
  return { key, result, ms: Date.now() - t0 };
}

export async function runDueJobs(): Promise<{ key: string; ms: number }[]> {
  // Simple "run all" — in production filter by cron expression vs current time.
  const out: { key: string; ms: number }[] = [];
  for (const j of SCHEDULED_JOBS) {
    const t0 = Date.now();
    try {
      await j.run();
      out.push({ key: j.key, ms: Date.now() - t0 });
    } catch {
      out.push({ key: j.key, ms: Date.now() - t0 });
    }
  }
  return out;
}
