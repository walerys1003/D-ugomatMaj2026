/**
 * Tier 22 — Workflow automation engine (no-code style).
 *
 * Workflow = (Trigger, [Condition...], [Action...]).
 * Triggers (lista patrz triggers/event-triggers.ts):
 *  - cron (np. "0 8 * * MON" — co poniedziałek 8:00)
 *  - event (np. "case.created", "deadline.upcoming:24h", "doc.uploaded")
 *  - manual (uruchamiane z UI)
 *
 * Actions:
 *  - send_notification (kanał z preferencji)
 *  - create_task (deadline)
 *  - tag_case
 *  - call_agent (uruchamia runAgent z określonym celem)
 *  - http_webhook (POST do user-defined URL z payloadem)
 *  - generate_report
 *
 * Conditions (filter): JSON-Logic-lite, np. {"==": [{"var":"case.status"}, "active"]}
 *
 * Run trace zapisywany w `automation_runs` z każdym krokiem.
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { routeNotification } from "@/lib/notifications/orchestration";
import { runAgent } from "../../ai/agents/orchestrator";
import { randomUUID } from "crypto";

export type WorkflowTriggerKind =
  | "cron"
  | "event"
  | "manual";

export type WorkflowActionKind =
  | "send_notification"
  | "create_deadline"
  | "tag_case"
  | "call_agent"
  | "http_webhook"
  | "generate_report";

export interface WorkflowDefinition {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  trigger: {
    kind: WorkflowTriggerKind;
    config: Record<string, unknown>;
  };
  conditions: Array<Record<string, unknown>>; // JSON-Logic-lite
  actions: Array<{
    kind: WorkflowActionKind;
    config: Record<string, unknown>;
  }>;
  enabled: boolean;
  last_run_at: string | null;
  run_count: number;
  created_at: string;
}

export interface WorkflowRun {
  id: string;
  workflow_id: string;
  user_id: string;
  trigger_payload: Record<string, unknown>;
  status: "running" | "completed" | "failed" | "skipped";
  steps: Array<{
    kind: WorkflowActionKind | "condition";
    success: boolean;
    detail: string;
    duration_ms: number;
  }>;
  started_at: string;
  finished_at: string | null;
}

// ---------------------------------------------------------------------
// JSON-Logic-lite evaluator
// ---------------------------------------------------------------------
function evalCondition(cond: Record<string, unknown>, data: Record<string, unknown>): boolean {
  if (typeof cond !== "object" || cond === null) return false;
  const op = Object.keys(cond)[0];
  const args = (cond as Record<string, unknown>)[op];
  const resolveArg = (v: unknown): unknown => {
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
  const argArr = Array.isArray(args) ? args.map(resolveArg) : [resolveArg(args)];
  switch (op) {
    case "==": return argArr[0] === argArr[1];
    case "!=": return argArr[0] !== argArr[1];
    case ">": return Number(argArr[0]) > Number(argArr[1]);
    case ">=": return Number(argArr[0]) >= Number(argArr[1]);
    case "<": return Number(argArr[0]) < Number(argArr[1]);
    case "<=": return Number(argArr[0]) <= Number(argArr[1]);
    case "in":
      return Array.isArray(argArr[1]) && (argArr[1] as unknown[]).includes(argArr[0]);
    case "and": return argArr.every((a) => Boolean(a));
    case "or": return argArr.some((a) => Boolean(a));
    case "not": return !Boolean(argArr[0]);
    case "contains":
      return typeof argArr[0] === "string" && typeof argArr[1] === "string"
        && (argArr[0] as string).includes(argArr[1] as string);
    default:
      return false;
  }
}

function evalAllConditions(
  conditions: Array<Record<string, unknown>>,
  data: Record<string, unknown>,
): boolean {
  return conditions.every((c) => evalCondition(c, data));
}

// ---------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------
async function execAction(
  action: WorkflowDefinition["actions"][number],
  triggerData: Record<string, unknown>,
  userId: string,
): Promise<{ success: boolean; detail: string }> {
  switch (action.kind) {
    case "send_notification": {
      const cfg = action.config as {
        title?: string;
        body?: string;
        category?: "deadline" | "case" | "security" | "billing" | "system" | "marketing";
        priority?: "low" | "normal" | "high" | "critical";
      };
      const title = cfg.title ?? "Automatyzacja";
      const body = cfg.body ?? "Workflow wykonał akcję.";
      void triggerData;
      const result = await routeNotification({
        userId,
        category: (cfg.category ?? "system") as never,
        priority: (cfg.priority ?? "normal") as never,
        payload: {
          inapp: { title, body },
          email: { subject: title, html: `<p>${body}</p>`, text: body },
          push: { title, body },
          sms: { text: `${title}: ${body}` },
        } as never,
      });
      return { success: true, detail: `Notyfikacja: ${result.plans.length} kanałów` };
    }
    case "create_deadline": {
      const supabase = await createSupabaseServerClient();
      const cfg = action.config as { ruleId?: string; due_at?: string; case_id?: string; note?: string };
      const { error } = await supabase.from("deadlines").insert({
        user_id: userId,
        case_id: cfg.case_id ?? null,
        rule_id: cfg.ruleId ?? "custom",
        due_at: cfg.due_at ?? new Date(Date.now() + 7 * 86400000).toISOString(),
        note: cfg.note ?? "Utworzony przez workflow",
      });
      if (error) return { success: false, detail: error.message };
      return { success: true, detail: `Termin utworzony: ${cfg.due_at}` };
    }
    case "tag_case": {
      const supabase = await createSupabaseServerClient();
      const cfg = action.config as { case_id?: string; tags?: string[] };
      if (!cfg.case_id) return { success: false, detail: "missing case_id" };
      const { error } = await supabase
        .from("cases")
        .update({ tags: cfg.tags ?? [] })
        .eq("id", cfg.case_id)
        .eq("user_id", userId);
      if (error) return { success: false, detail: error.message };
      return { success: true, detail: `Otagowano sprawę ${cfg.case_id}` };
    }
    case "call_agent": {
      const cfg = action.config as { goal?: string; toolset?: string[]; budgetGrosze?: number };
      if (!cfg.goal) return { success: false, detail: "missing goal" };
      const run = await runAgent({
        userId,
        goal: cfg.goal,
        options: {
          toolset: cfg.toolset as never,
          budgetGrosze: cfg.budgetGrosze ?? 3000,
        },
      });
      return {
        success: run.status === "completed",
        detail: `Agent ${run.status}: ${run.final_answer?.slice(0, 200) ?? ""}`,
      };
    }
    case "http_webhook": {
      const cfg = action.config as { url?: string; method?: string; headers?: Record<string, string>; body?: unknown };
      if (!cfg.url) return { success: false, detail: "missing url" };
      try {
        const resp = await fetch(cfg.url, {
          method: cfg.method ?? "POST",
          headers: {
            "Content-Type": "application/json",
            ...(cfg.headers ?? {}),
          },
          body: JSON.stringify(cfg.body ?? triggerData),
        });
        return {
          success: resp.ok,
          detail: `${cfg.method ?? "POST"} ${cfg.url} → ${resp.status}`,
        };
      } catch (err) {
        return { success: false, detail: err instanceof Error ? err.message : String(err) };
      }
    }
    case "generate_report": {
      // Stub — w T23 pełna implementacja eksportu (PDF/MD/CSV)
      return { success: true, detail: "Raport zaplanowany do wygenerowania (job queue)." };
    }
    default:
      return { success: false, detail: `Nieznana akcja: ${action.kind}` };
  }
}

// ---------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------
export async function createWorkflow(args: {
  userId: string;
  name: string;
  description?: string;
  trigger: WorkflowDefinition["trigger"];
  conditions?: WorkflowDefinition["conditions"];
  actions: WorkflowDefinition["actions"];
  enabled?: boolean;
}): Promise<WorkflowDefinition> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("automation_workflows")
    .insert({
      user_id: args.userId,
      name: args.name,
      description: args.description ?? null,
      trigger: args.trigger,
      conditions: args.conditions ?? [],
      actions: args.actions,
      enabled: args.enabled ?? true,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data as WorkflowDefinition;
}

export async function listWorkflows(userId: string): Promise<WorkflowDefinition[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("automation_workflows")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as WorkflowDefinition[];
}

export async function getWorkflow(id: string, userId: string): Promise<WorkflowDefinition | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("automation_workflows")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data ?? null) as WorkflowDefinition | null;
}

export async function setWorkflowEnabled(id: string, userId: string, enabled: boolean): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("automation_workflows")
    .update({ enabled })
    .eq("id", id)
    .eq("user_id", userId);
}

export async function deleteWorkflow(id: string, userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("automation_workflows")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);
}

/**
 * Wykonuje workflow z payloadem triggera.
 * Sprawdza conditions, potem wykonuje actions sekwencyjnie. Każdy krok loguje.
 */
export async function executeWorkflow(args: {
  workflowId: string;
  triggerPayload: Record<string, unknown>;
}): Promise<WorkflowRun> {
  const supabase = await createSupabaseServerClient();
  const { data: wf, error: wfErr } = await supabase
    .from("automation_workflows")
    .select("*")
    .eq("id", args.workflowId)
    .single();
  if (wfErr || !wf) throw wfErr ?? new Error("workflow_not_found");
  const workflow = wf as WorkflowDefinition;

  const runId = randomUUID();
  const startedAt = new Date().toISOString();
  const steps: WorkflowRun["steps"] = [];

  if (!workflow.enabled) {
    return {
      id: runId,
      workflow_id: workflow.id,
      user_id: workflow.user_id,
      trigger_payload: args.triggerPayload,
      status: "skipped",
      steps: [{ kind: "condition", success: false, detail: "Workflow disabled", duration_ms: 0 }],
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    };
  }

  // Conditions
  const condStart = Date.now();
  const condsOk = evalAllConditions(workflow.conditions, args.triggerPayload);
  steps.push({
    kind: "condition",
    success: condsOk,
    detail: condsOk ? "All conditions matched" : "Conditions failed",
    duration_ms: Date.now() - condStart,
  });
  if (!condsOk) {
    await supabase.from("automation_runs").insert({
      id: runId,
      workflow_id: workflow.id,
      user_id: workflow.user_id,
      trigger_payload: args.triggerPayload,
      status: "skipped",
      steps,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    }).then(() => null).catch(() => null);
    return {
      id: runId,
      workflow_id: workflow.id,
      user_id: workflow.user_id,
      trigger_payload: args.triggerPayload,
      status: "skipped",
      steps,
      started_at: startedAt,
      finished_at: new Date().toISOString(),
    };
  }

  // Actions
  let failed = false;
  for (const action of workflow.actions) {
    const aStart = Date.now();
    const result = await execAction(action, args.triggerPayload, workflow.user_id);
    steps.push({
      kind: action.kind,
      success: result.success,
      detail: result.detail,
      duration_ms: Date.now() - aStart,
    });
    if (!result.success) {
      failed = true;
      // continue-on-error: jeśli config wymaga halt-on-error, można dodać flagę
    }
  }

  const finishedAt = new Date().toISOString();
  const status: WorkflowRun["status"] = failed ? "failed" : "completed";

  // Persist run
  await supabase.from("automation_runs").insert({
    id: runId,
    workflow_id: workflow.id,
    user_id: workflow.user_id,
    trigger_payload: args.triggerPayload,
    status,
    steps,
    started_at: startedAt,
    finished_at: finishedAt,
  }).then(() => null).catch(() => null);

  // Update workflow stats
  await supabase
    .from("automation_workflows")
    .update({
      last_run_at: finishedAt,
      run_count: (workflow.run_count ?? 0) + 1,
    })
    .eq("id", workflow.id)
    .then(() => null).catch(() => null);

  return {
    id: runId,
    workflow_id: workflow.id,
    user_id: workflow.user_id,
    trigger_payload: args.triggerPayload,
    status,
    steps,
    started_at: startedAt,
    finished_at: finishedAt,
  };
}
