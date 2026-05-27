/**
 * Tier 22 — Agent orchestrator (think → act → observe loop).
 *
 * Implementuje ReAct-style pętlę z dyspozycją do tool registry:
 *  1. LLM dostaje system prompt + opis tools + dotychczasową historię
 *  2. LLM emituje JSON: {thought, action, action_input} | {final_answer}
 *  3. Orchestrator wywołuje tool, observation wraca jako kolejna wiadomość
 *  4. Loop do final_answer LUB max_steps LUB budget exhausted
 *
 * Zabezpieczenia:
 *  - max_steps (default 10)
 *  - cost budget (grosze) — circuit break przy przekroczeniu
 *  - timeout per krok (30s)
 *  - kompresja historii (tool obs > 2000 chars → streszczenie)
 *  - "loop detection" — wykrywa cykle (ta sama akcja+args 3 razy z rzędu)
 */

import { callWithFallback, type LlmMessage } from "../../llm-client";
import { selectModel } from "../../model-router";
import { getTool, listToolsForLlm, type ToolName } from "../tools/tool-registry";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { randomUUID } from "crypto";

export type AgentStepRole = "thought" | "action" | "observation" | "final";

export interface AgentStep {
  index: number;
  role: AgentStepRole;
  content: string;
  action?: { name: string; args: Record<string, unknown> };
  observation?: string;
  cost_grosze: number;
  latency_ms: number;
  at: string;
}

export interface AgentRun {
  id: string;
  user_id: string;
  goal: string;
  status: "running" | "completed" | "failed" | "canceled" | "budget_exceeded";
  steps: AgentStep[];
  final_answer: string | null;
  total_cost_grosze: number;
  started_at: string;
  finished_at: string | null;
}

export interface AgentRunOptions {
  maxSteps?: number;
  budgetGrosze?: number;
  toolset?: ToolName[];
  systemPrompt?: string;
  contextHint?: string;
}

const DEFAULT_MAX_STEPS = 10;
const DEFAULT_BUDGET_GROSZE = 5000; // 50 zł
const STEP_TIMEOUT_MS = 30_000;
const OBSERVATION_TRUNCATE = 2_000;

const ORCHESTRATOR_SYSTEM = `Jesteś prawniczym agentem AI Długomat. Twoje zadanie: rozwiązać cel użytkownika
używając dostępnych narzędzi. Każdą turę zwracasz ŚCIŚLE JSON jednej z form:

  {"thought": "...", "action": "tool_name", "action_input": {...}}

  lub

  {"thought": "...", "final_answer": "..."}

Zasady:
 - Nigdy nie zmyślaj cytatów art./KPC — używaj narzędzia search_law.
 - Jeżeli nie ma narzędzia odpowiedniego do zadania — odpowiedz final_answer z prośbą o uściślenie.
 - Cytuj źródła w final_answer (np. "art. 504 §1 KPC").
 - Liczb terminów NIGDY nie ustalaj sam — używaj calc_deadline.
 - Nie wywołuj tego samego narzędzia z tymi samymi argumentami dwa razy z rzędu.
`;

interface LoopState {
  history: LlmMessage[];
  steps: AgentStep[];
  totalCost: number;
  lastActions: string[];
}

function detectLoop(state: LoopState): boolean {
  if (state.lastActions.length < 3) return false;
  const [a, b, c] = state.lastActions.slice(-3);
  return a === b && b === c;
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return s.slice(0, max) + `\n…[obcięte ${s.length - max} znaków]`;
}

function parseAgentTurn(raw: string):
  | { kind: "action"; thought: string; action: string; action_input: Record<string, unknown> }
  | { kind: "final"; thought: string; final_answer: string }
  | { kind: "invalid"; raw: string } {
  // Wyciągnij JSON z odpowiedzi (model czasem zawija w ```json ... ```)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { kind: "invalid", raw };
  try {
    const obj = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    if (typeof obj.final_answer === "string") {
      return {
        kind: "final",
        thought: typeof obj.thought === "string" ? obj.thought : "",
        final_answer: obj.final_answer,
      };
    }
    if (typeof obj.action === "string") {
      return {
        kind: "action",
        thought: typeof obj.thought === "string" ? obj.thought : "",
        action: obj.action,
        action_input: (obj.action_input as Record<string, unknown>) ?? {},
      };
    }
    return { kind: "invalid", raw };
  } catch {
    return { kind: "invalid", raw };
  }
}

async function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return await Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout:${label}:${ms}ms`)), ms),
    ),
  ]);
}

export async function runAgent(args: {
  userId: string;
  goal: string;
  options?: AgentRunOptions;
}): Promise<AgentRun> {
  const maxSteps = args.options?.maxSteps ?? DEFAULT_MAX_STEPS;
  const budget = args.options?.budgetGrosze ?? DEFAULT_BUDGET_GROSZE;
  const toolset = args.options?.toolset;

  const runId = randomUUID();
  const startedAt = new Date().toISOString();

  // Persist run kickoff (best-effort)
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb.from("agent_runs").insert({
    id: runId,
    user_id: args.userId,
    goal: args.goal,
    status: "running",
    started_at: startedAt,
  }).then(() => null).catch(() => null);

  const toolsDescription = listToolsForLlm(toolset);
  const systemPrompt =
    (args.options?.systemPrompt ?? ORCHESTRATOR_SYSTEM) +
    `\n\nDostępne narzędzia:\n${toolsDescription}`;

  const state: LoopState = {
    history: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Cel: ${args.goal}${args.options?.contextHint ? `\n\nKontekst: ${args.options.contextHint}` : ""}` },
    ],
    steps: [],
    totalCost: 0,
    lastActions: [],
  };

  let finalAnswer: string | null = null;
  let status: AgentRun["status"] = "running";

  for (let i = 0; i < maxSteps; i++) {
    if (state.totalCost >= budget) {
      status = "budget_exceeded";
      break;
    }
    if (detectLoop(state)) {
      finalAnswer = "Agent wpadł w pętlę — przerywam. Spróbuj inaczej sformułować cel.";
      status = "failed";
      break;
    }

    const stepStart = Date.now();
    const model = selectModel({ taskType: "legal_reasoning", qualityHint: "premium" });

    let llmResp;
    try {
      llmResp = await withTimeout(
        callWithFallback(model.primary, model.fallbacks, state.history, { max_tokens: 800, temperature: 0.2 }),
        STEP_TIMEOUT_MS,
        "llm",
      );
    } catch (err) {
      state.steps.push({
        index: i,
        role: "action",
        content: err instanceof Error ? err.message : String(err),
        cost_grosze: 0,
        latency_ms: Date.now() - stepStart,
        at: new Date().toISOString(),
      });
      status = "failed";
      break;
    }

    state.totalCost += llmResp.cost_grosze;
    const turn = parseAgentTurn(llmResp.text);

    if (turn.kind === "final") {
      state.steps.push({
        index: i,
        role: "final",
        content: turn.final_answer,
        cost_grosze: llmResp.cost_grosze,
        latency_ms: Date.now() - stepStart,
        at: new Date().toISOString(),
      });
      finalAnswer = turn.final_answer;
      status = "completed";
      break;
    }

    if (turn.kind === "invalid") {
      // Daj agentowi szansę poprawić się
      state.history.push({ role: "assistant", content: llmResp.text });
      state.history.push({
        role: "user",
        content:
          "Nieprawidłowy format. Zwróć JSON: {\"thought\":\"…\",\"action\":\"…\",\"action_input\":{…}} lub {\"thought\":\"…\",\"final_answer\":\"…\"}.",
      });
      state.steps.push({
        index: i,
        role: "thought",
        content: `[invalid_format] ${truncate(llmResp.text, 200)}`,
        cost_grosze: llmResp.cost_grosze,
        latency_ms: Date.now() - stepStart,
        at: new Date().toISOString(),
      });
      continue;
    }

    // turn.kind === "action"
    state.history.push({ role: "assistant", content: llmResp.text });
    state.steps.push({
      index: i,
      role: "thought",
      content: turn.thought,
      cost_grosze: llmResp.cost_grosze,
      latency_ms: Date.now() - stepStart,
      at: new Date().toISOString(),
    });

    const actionSig = `${turn.action}:${JSON.stringify(turn.action_input)}`;
    state.lastActions.push(actionSig);

    const tool = getTool(turn.action);
    let observation: string;
    let actionCost = 0;
    const actionStart = Date.now();
    if (!tool) {
      observation = `Błąd: nieznane narzędzie "${turn.action}".`;
    } else if (toolset && !toolset.includes(turn.action as ToolName)) {
      observation = `Błąd: narzędzie "${turn.action}" jest wyłączone w tym kontekście.`;
    } else {
      try {
        const result = await withTimeout(
          tool.invoke(turn.action_input, { userId: args.userId }),
          STEP_TIMEOUT_MS,
          `tool:${turn.action}`,
        );
        observation = typeof result === "string" ? result : JSON.stringify(result);
        actionCost = tool.costGrosze ?? 0;
      } catch (err) {
        observation = `Błąd narzędzia: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    state.totalCost += actionCost;
    const truncatedObs = truncate(observation, OBSERVATION_TRUNCATE);
    state.history.push({
      role: "user",
      content: `Observation (${turn.action}):\n${truncatedObs}`,
    });
    state.steps.push({
      index: i + 0.5,
      role: "action",
      content: turn.action,
      action: { name: turn.action, args: turn.action_input },
      observation: truncatedObs,
      cost_grosze: actionCost,
      latency_ms: Date.now() - actionStart,
      at: new Date().toISOString(),
    });
  }

  if (!finalAnswer && status === "running") {
    status = "failed";
    finalAnswer = "Przekroczono limit kroków bez końcowej odpowiedzi.";
  }

  const finishedAt = new Date().toISOString();
  const run: AgentRun = {
    id: runId,
    user_id: args.userId,
    goal: args.goal,
    status,
    steps: state.steps,
    final_answer: finalAnswer,
    total_cost_grosze: state.totalCost,
    started_at: startedAt,
    finished_at: finishedAt,
  };

  // Persist steps + final
  await sb.from("agent_runs").update({
    status,
    final_answer: finalAnswer,
    total_cost_grosze: state.totalCost,
    finished_at: finishedAt,
  }).eq("id", runId).then(() => null).catch(() => null);

  if (state.steps.length > 0) {
    await sb.from("agent_steps").insert(
      state.steps.map((s) => ({
        run_id: runId,
        index: s.index,
        role: s.role,
        content: s.content,
        action_name: s.action?.name ?? null,
        action_args: s.action?.args ?? null,
        observation: s.observation ?? null,
        cost_grosze: s.cost_grosze,
        latency_ms: s.latency_ms,
        at: s.at,
      })),
    ).then(() => null).catch(() => null);
  }

  return run;
}

export async function cancelAgentRun(runId: string, userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  await sb
    .from("agent_runs")
    .update({ status: "canceled", finished_at: new Date().toISOString() })
    .eq("id", runId)
    .eq("user_id", userId)
    .eq("status", "running");
}
