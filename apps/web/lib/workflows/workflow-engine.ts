/**
 * Tier 12 — In-app workflow engine: trigger → conditions → actions.
 * Users can build automations like "When deadline.approaching AND days_left <= 3 → send SMS + Slack".
 */
import { createServerSupabase } from "@/lib/db/supabase-server";
import { sendSms } from "@/lib/integrations/sms-whatsapp";
import { postSlackMessage, postTeamsMessage } from "@/lib/integrations/notify/slack-teams";
import { emitEvent, WebhookEvent } from "@/lib/integrations/webhooks-v2";

export type WorkflowTrigger = WebhookEvent | "schedule.daily" | "schedule.weekly";

export type ConditionOp = "eq" | "neq" | "lt" | "lte" | "gt" | "gte" | "contains" | "exists";

export interface Condition {
  field: string;
  op: ConditionOp;
  value?: unknown;
}

export type ActionType = "sms" | "whatsapp" | "slack" | "teams" | "email" | "webhook" | "ai_generate";

export interface WorkflowAction {
  type: ActionType;
  params: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  enabled: boolean;
  trigger: WorkflowTrigger;
  conditions: Condition[];
  actions: WorkflowAction[];
}

function getField(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

export function evaluateConditions(conditions: Condition[], payload: Record<string, unknown>): boolean {
  for (const c of conditions) {
    const val = getField(payload, c.field);
    switch (c.op) {
      case "eq":
        if (val !== c.value) return false;
        break;
      case "neq":
        if (val === c.value) return false;
        break;
      case "lt":
        if (!(typeof val === "number" && typeof c.value === "number" && val < c.value)) return false;
        break;
      case "lte":
        if (!(typeof val === "number" && typeof c.value === "number" && val <= c.value)) return false;
        break;
      case "gt":
        if (!(typeof val === "number" && typeof c.value === "number" && val > c.value)) return false;
        break;
      case "gte":
        if (!(typeof val === "number" && typeof c.value === "number" && val >= c.value)) return false;
        break;
      case "contains":
        if (typeof val !== "string" || !val.includes(String(c.value))) return false;
        break;
      case "exists":
        if (val === undefined || val === null) return false;
        break;
    }
  }
  return true;
}

export async function executeWorkflows(trigger: WorkflowTrigger, payload: Record<string, unknown> & { user_id?: string }): Promise<{ executed: number }> {
  const sb = await createServerSupabase();
  const q = sb.from("workflows").select("*").eq("enabled", true).eq("trigger", trigger);
  if (payload.user_id) q.eq("user_id", payload.user_id);
  const { data: workflows } = await q;
  let executed = 0;
  for (const w of (workflows as Workflow[]) ?? []) {
    if (!evaluateConditions(w.conditions ?? [], payload)) continue;
    for (const a of w.actions ?? []) {
      try {
        await runAction(a, payload);
      } catch (e) {
        console.warn(`workflow ${w.id} action ${a.type} failed`, e);
      }
    }
    executed++;
    // workflow_runs is not yet present in the generated Supabase types — cast
    // the insert payload via `as never` until the schema is regenerated.
    await sb.from("workflow_runs").insert({
      workflow_id: w.id,
      trigger,
      payload,
      executed_at: new Date().toISOString(),
    } as never);
  }
  return { executed };
}

async function runAction(a: WorkflowAction, payload: Record<string, unknown>) {
  switch (a.type) {
    case "sms":
    case "whatsapp": {
      const to = String(a.params.to ?? payload.phone ?? "");
      const body = renderTemplate(String(a.params.body ?? ""), payload);
      if (to) await sendSms(to, body, a.type === "whatsapp" ? "whatsapp" : "sms");
      break;
    }
    case "slack": {
      const url = String(a.params.webhook_url ?? "");
      if (url) await postSlackMessage(url, { text: renderTemplate(String(a.params.text ?? ""), payload) });
      break;
    }
    case "teams": {
      const url = String(a.params.webhook_url ?? "");
      if (url) await postTeamsMessage(url, { title: String(a.params.title ?? "Długomat"), text: renderTemplate(String(a.params.text ?? ""), payload) });
      break;
    }
    case "webhook": {
      if (payload.user_id) {
        await emitEvent((a.params.event as WebhookEvent) ?? "case.updated", String(payload.user_id), payload);
      }
      break;
    }
    case "email":
    case "ai_generate":
      // hooks for future integration; logged via runs table
      break;
  }
}

function renderTemplate(tpl: string, vars: Record<string, unknown>): string {
  return tpl.replace(/\{\{([\w.]+)\}\}/g, (_, path) => {
    const v = getField(vars, path);
    return v === undefined || v === null ? "" : String(v);
  });
}
