/**
 * Tier 22 — Event triggers dispatcher.
 *
 * Zewnętrzna powierzchnia: kod aplikacji wywołuje `dispatchEvent({kind, payload, userId})`
 * w momencie wystąpienia zdarzenia (np. po utworzeniu sprawy, po dodaniu dokumentu).
 *
 * Dispatcher:
 *  1. Czyta workflowy z `automation_workflows` gdzie trigger.kind="event"
 *     i trigger.config.event_kind = `kind`
 *  2. Dla każdego — wywołuje executeWorkflow (asynchronicznie, fire-and-forget)
 *  3. Loguje do `realtime_events` z kind="system.broadcast" (audit trail)
 *
 * Cron triggers obsługiwany w osobnym scheduler (Vercel Cron / Supabase pg_cron).
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { executeWorkflow } from "../workflows";
import { channelBroker } from "@/lib/realtime/channel";

export type EventTriggerKind =
  | "case.created"
  | "case.updated"
  | "case.archived"
  | "doc.uploaded"
  | "doc.ocr_completed"
  | "deadline.created"
  | "deadline.upcoming"
  | "deadline.fired"
  | "notification.delivered"
  | "agent.completed"
  | "bulk.completed"
  | "subscription.changed"
  | "user.signed_up";

export interface EventPayload {
  kind: EventTriggerKind;
  userId: string;
  data: Record<string, unknown>;
  occurredAt?: string;
}

/**
 * Dispatch — non-blocking. W route handlerze wywołujemy `void dispatchEvent(...)`.
 */
export async function dispatchEvent(payload: EventPayload): Promise<{ triggered: number }> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: workflows, error } = await sb
    .from("automation_workflows")
    .select("id, user_id, trigger")
    .eq("user_id", payload.userId)
    .eq("enabled", true);
  if (error || !workflows) return { triggered: 0 };

  const matching = (workflows as Array<{ id: string; user_id: string; trigger: { kind: string; config: { event_kind?: string } } }>)
    .filter(
      (w) =>
        w.trigger.kind === "event" &&
        w.trigger.config.event_kind === payload.kind,
    );

  // Fire-and-forget — żeby nie blokować callera
  let triggered = 0;
  for (const wf of matching) {
    triggered++;
    void executeWorkflow({
      workflowId: wf.id,
      triggerPayload: {
        event_kind: payload.kind,
        user_id: payload.userId,
        occurred_at: payload.occurredAt ?? new Date().toISOString(),
        ...payload.data,
      },
    }).catch(() => null);
  }

  // Notify realtime channel (dla UI live update workflow logs)
  if (triggered > 0) {
    void channelBroker.publish({
      topic: `user:${payload.userId}`,
      kind: "system.broadcast",
      payload: {
        type: "workflows_triggered",
        event_kind: payload.kind,
        count: triggered,
      },
      userId: payload.userId,
      persist: false,
    }).catch(() => null);
  }

  return { triggered };
}

/**
 * Cron evaluator — wywoływany z /api/cron/workflows (z CRON_SECRET).
 * Sprawdza workflowy z trigger.kind="cron" i config.cron expression.
 * Używamy uproszczonego matchera (minute hour dow).
 */
export async function evaluateCronTriggers(): Promise<{ triggered: number }> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data: workflows, error } = await sb
    .from("automation_workflows")
    .select("id, user_id, trigger")
    .eq("enabled", true);
  if (error || !workflows) return { triggered: 0 };

  const now = new Date();
  let triggered = 0;
  for (const wf of workflows as Array<{ id: string; user_id: string; trigger: { kind: string; config: { cron?: string } } }>) {
    if (wf.trigger.kind !== "cron") continue;
    const cron = wf.trigger.config.cron;
    if (!cron || !matchesCronExpression(cron, now)) continue;
    triggered++;
    void executeWorkflow({
      workflowId: wf.id,
      triggerPayload: {
        trigger: "cron",
        cron,
        fired_at: now.toISOString(),
      },
    }).catch(() => null);
  }
  return { triggered };
}

/**
 * Uproszczony cron matcher — wspiera "minute hour dom month dow"
 * z wartościami: * | liczba | a,b,c | *\/n
 */
export function matchesCronExpression(cron: string, date: Date): boolean {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return false;
  const fields: Array<[string, number]> = [
    [parts[0], date.getMinutes()],
    [parts[1], date.getHours()],
    [parts[2], date.getDate()],
    [parts[3], date.getMonth() + 1],
    [parts[4], date.getDay()],
  ];
  return fields.every(([expr, value]) => matchCronField(expr, value));
}

function matchCronField(expr: string, value: number): boolean {
  if (expr === "*") return true;
  // step: */n
  const stepMatch = expr.match(/^\*\/(\d+)$/);
  if (stepMatch) {
    return value % Number(stepMatch[1]) === 0;
  }
  // list: a,b,c
  if (expr.includes(",")) {
    return expr.split(",").some((p) => Number(p) === value);
  }
  // range: a-b
  if (expr.includes("-")) {
    const [a, b] = expr.split("-").map(Number);
    return value >= a && value <= b;
  }
  return Number(expr) === value;
}

/**
 * Helper dla "deadline.upcoming" — uruchamiany przez cron co godzinę,
 * znajduje terminy w ciągu 24h i emituje event per termin.
 */
export async function scanUpcomingDeadlines(): Promise<{ found: number }> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const now = new Date();
  const cutoff = new Date(now.getTime() + 24 * 3_600_000);
  const { data, error } = await sb
    .from("deadlines")
    .select("id, user_id, due_at, rule_id, case_id, notified_24h")
    .gte("due_at", now.toISOString())
    .lte("due_at", cutoff.toISOString())
    .is("completed_at", null)
    .or("notified_24h.is.null,notified_24h.eq.false")
    .limit(500);
  if (error || !data) return { found: 0 };

  for (const dl of data as Array<{
    id: string;
    user_id: string;
    due_at: string;
    rule_id: string;
    case_id: string | null;
  }>) {
    void dispatchEvent({
      kind: "deadline.upcoming",
      userId: dl.user_id,
      data: {
        deadline_id: dl.id,
        due_at: dl.due_at,
        rule_id: dl.rule_id,
        case_id: dl.case_id,
        hours_remaining: Math.round(
          (new Date(dl.due_at).getTime() - now.getTime()) / 3_600_000,
        ),
      },
    }).catch(() => null);

    // Mark as notified
    await sb
      .from("deadlines")
      .update({ notified_24h: true })
      .eq("id", dl.id)
      .then(() => null)
      .catch(() => null);
  }

  return { found: data.length };
}
