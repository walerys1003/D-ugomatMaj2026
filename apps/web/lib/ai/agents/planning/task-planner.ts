/**
 * Tier 22 — Plan-and-execute task planner.
 *
 * Dla złożonych celów (np. "przygotuj sprzeciw od nakazu zapłaty dla sprawy X
 * z analizą terminów + szablonem pisma + listą dowodów") agent buduje plan
 * wieloetapowy i wykonuje go krokami.
 *
 * Algorytm:
 *  1. PLAN — LLM dostaje goal + tools opis → emituje JSON {steps: [...]}
 *  2. EXECUTE — dla każdego kroku uruchamia agent-loop z subgoalem
 *  3. REFLECT — po każdym kroku LLM ocenia: continue / replan / abort
 *  4. SYNTHESIZE — final answer z agregacją wyników kroków
 */

import { callWithFallback, type LlmMessage } from "../../llm-client";
import { selectModel } from "../../model-router";
import { runAgent, type AgentRun } from "../orchestrator";
import { listToolsForLlm, type ToolName } from "../tools";

export interface PlanStep {
  index: number;
  goal: string;
  expected_output: string;
  tools_hint?: ToolName[];
}

export interface ExecutedStep extends PlanStep {
  run: AgentRun;
  reflection: "continue" | "replan" | "abort";
  reflection_note: string;
}

export interface PlanExecutionResult {
  goal: string;
  plan: PlanStep[];
  executed: ExecutedStep[];
  final_synthesis: string;
  total_cost_grosze: number;
  status: "completed" | "aborted" | "partial";
}

const PLANNER_PROMPT = `Jesteś planistą zadań prawniczych. Dostajesz cel użytkownika i listę dostępnych narzędzi.
Twoje zadanie: rozbij cel na 2-5 minimalnych, NIEZALEŻNYCH kroków. Każdy krok powinien być
możliwy do wykonania przez sub-agenta z jednym tool-callem lub krótką serią tool-calli.

Zwracasz ŚCIŚLE JSON:
{
  "steps": [
    {"goal": "...", "expected_output": "...", "tools_hint": ["search_law"]},
    ...
  ]
}

Zasady:
 - max 5 kroków
 - każdy "goal" jest konkretny i mierzalny
 - jeśli cel jest prosty (jeden tool wystarczy) → zwróć 1 krok
`;

export async function planTask(args: {
  userId: string;
  goal: string;
  contextHint?: string;
}): Promise<PlanStep[]> {
  const toolsDesc = listToolsForLlm();
  const messages: LlmMessage[] = [
    { role: "system", content: PLANNER_PROMPT + `\n\nDostępne narzędzia:\n${toolsDesc}` },
    {
      role: "user",
      content: `Cel: ${args.goal}${args.contextHint ? `\n\nKontekst: ${args.contextHint}` : ""}`,
    },
  ];
  const model = selectModel({ taskType: "legal_reasoning", qualityHint: "premium" });
  const resp = await callWithFallback(model.primary, model.fallbacks, messages, { max_tokens: 800, temperature: 0.2 });
  const match = resp.text.match(/\{[\s\S]*\}/);
  if (!match) {
    // Fallback: 1-step plan
    return [{ index: 0, goal: args.goal, expected_output: "Odpowiedź na cel użytkownika." }];
  }
  try {
    const parsed = JSON.parse(match[0]) as { steps?: Array<Record<string, unknown>> };
    const steps = (parsed.steps ?? [])
      .slice(0, 5)
      .map((s, i) => ({
        index: i,
        goal: String(s.goal ?? ""),
        expected_output: String(s.expected_output ?? ""),
        tools_hint: Array.isArray(s.tools_hint)
          ? (s.tools_hint.filter((t): t is ToolName => typeof t === "string") as ToolName[])
          : undefined,
      }))
      .filter((s) => s.goal.length > 0);
    if (steps.length === 0) {
      return [{ index: 0, goal: args.goal, expected_output: "Odpowiedź na cel użytkownika." }];
    }
    return steps;
  } catch {
    return [{ index: 0, goal: args.goal, expected_output: "Odpowiedź na cel użytkownika." }];
  }
}

const REFLECTION_PROMPT = `Oceń, czy poniższy wynik podkroku spełnia oczekiwania. Zwróć JSON:
{"verdict": "continue" | "replan" | "abort", "note": "krótkie uzasadnienie"}
`;

async function reflectStep(args: {
  step: PlanStep;
  run: AgentRun;
}): Promise<{ verdict: "continue" | "replan" | "abort"; note: string }> {
  if (args.run.status !== "completed") {
    return {
      verdict: "abort",
      note: `Sub-agent zakończył statusem ${args.run.status}.`,
    };
  }
  const messages: LlmMessage[] = [
    { role: "system", content: REFLECTION_PROMPT },
    {
      role: "user",
      content: `Cel kroku: ${args.step.goal}\nOczekiwane: ${args.step.expected_output}\nOtrzymano:\n${args.run.final_answer?.slice(0, 1500) ?? "(brak)"}`,
    },
  ];
  const model = selectModel({ taskType: "quick_summary", qualityHint: "fast" });
  try {
    const resp = await callWithFallback(model.primary, model.fallbacks, messages, { max_tokens: 200, temperature: 0 });
    const match = resp.text.match(/\{[\s\S]*\}/);
    if (!match) return { verdict: "continue", note: "Brak refleksji — kontynuujemy." };
    const obj = JSON.parse(match[0]) as { verdict?: string; note?: string };
    if (obj.verdict === "replan" || obj.verdict === "abort" || obj.verdict === "continue") {
      return { verdict: obj.verdict, note: String(obj.note ?? "") };
    }
    return { verdict: "continue", note: "" };
  } catch {
    return { verdict: "continue", note: "Refleksja nieudana — kontynuujemy." };
  }
}

const SYNTHESIZER_PROMPT = `Jesteś syntezatorem. Dostajesz oryginalny cel użytkownika oraz wyniki
wszystkich kroków planu. Zwróć finalną, spójną odpowiedź w języku polskim,
zawierającą wszystkie istotne fakty, cytaty prawne i konkluzje. Bez metakomentarzy.`;

async function synthesize(args: {
  goal: string;
  executed: ExecutedStep[];
}): Promise<string> {
  const summary = args.executed
    .map(
      (e, i) =>
        `Krok ${i + 1}: ${e.goal}\nWynik: ${e.run.final_answer?.slice(0, 1200) ?? "(brak)"}`,
    )
    .join("\n\n---\n\n");
  const messages: LlmMessage[] = [
    { role: "system", content: SYNTHESIZER_PROMPT },
    { role: "user", content: `Oryginalny cel: ${args.goal}\n\nWyniki kroków:\n${summary}` },
  ];
  const model = selectModel({ taskType: "document_draft", qualityHint: "premium" });
  const resp = await callWithFallback(model.primary, model.fallbacks, messages, { max_tokens: 1500, temperature: 0.3 });
  return resp.text.trim();
}

/**
 * Główna funkcja: plan → execute → reflect → synthesize.
 */
export async function planAndExecute(args: {
  userId: string;
  goal: string;
  contextHint?: string;
  maxStepsPerSub?: number;
  budgetGrosze?: number;
}): Promise<PlanExecutionResult> {
  const plan = await planTask({
    userId: args.userId,
    goal: args.goal,
    contextHint: args.contextHint,
  });
  const executed: ExecutedStep[] = [];
  let totalCost = 0;
  const budget = args.budgetGrosze ?? 15_000;
  let aborted = false;

  for (const step of plan) {
    if (totalCost >= budget) {
      aborted = true;
      break;
    }
    const subRun = await runAgent({
      userId: args.userId,
      goal: step.goal,
      options: {
        maxSteps: args.maxStepsPerSub ?? 6,
        toolset: step.tools_hint,
        contextHint: args.contextHint,
        budgetGrosze: Math.max(1000, budget - totalCost),
      },
    });
    totalCost += subRun.total_cost_grosze;
    const reflection = await reflectStep({ step, run: subRun });
    executed.push({ ...step, run: subRun, reflection: reflection.verdict, reflection_note: reflection.note });
    if (reflection.verdict === "abort") {
      aborted = true;
      break;
    }
    // "replan" w T22 traktujemy jak continue (replan wymaga osobnej iteracji — TBD T23)
  }

  const finalSynthesis = await synthesize({ goal: args.goal, executed });

  return {
    goal: args.goal,
    plan,
    executed,
    final_synthesis: finalSynthesis,
    total_cost_grosze: totalCost,
    status: aborted ? (executed.length === plan.length ? "completed" : "aborted") : "completed",
  };
}
