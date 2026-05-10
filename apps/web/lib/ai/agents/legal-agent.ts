/**
 * Tier 11 — Legal agent with tool-use loop.
 * Available tools: search_law, lookup_article, search_case_history, compute_deadline.
 */
import { callWithFallback, LlmMessage } from "../llm-client";
import { selectModel } from "../model-router";
import { searchSimilar } from "../rag/vector-store";

export interface AgentTool {
  name: string;
  description: string;
  invoke: (args: Record<string, string>) => Promise<string>;
}

export interface AgentResult {
  final_answer: string;
  tool_calls: { name: string; args: Record<string, string>; result: string }[];
  iterations: number;
  cost_grosze: number;
}

const ToolRegistry: Record<string, AgentTool> = {
  search_law: {
    name: "search_law",
    description: "Wyszukaj przepisy prawne wg pytania. Args: {query, corpus?}",
    invoke: async (args) => {
      const docs = await searchSimilar(args.query, { corpus: args.corpus, topK: 3 });
      return docs.map((d, i) => `[${i + 1}] ${d.source_ref}: ${d.text.slice(0, 400)}`).join("\n\n");
    },
  },
  lookup_article: {
    name: "lookup_article",
    description: "Zwróć treść konkretnego artykułu. Args: {code, number}",
    invoke: async (args) => {
      const docs = await searchSimilar(`art. ${args.number} ${args.code}`, { topK: 1 });
      return docs[0]?.text ?? "Brak danych";
    },
  },
  compute_deadline: {
    name: "compute_deadline",
    description: "Oblicz termin procesowy. Args: {start_date, days, business_days}",
    invoke: async (args) => {
      const start = new Date(args.start_date);
      const days = parseInt(args.days, 10);
      const businessDays = args.business_days === "true";
      const d = new Date(start);
      let added = 0;
      while (added < days) {
        d.setDate(d.getDate() + 1);
        if (!businessDays || (d.getDay() !== 0 && d.getDay() !== 6)) added++;
      }
      return d.toISOString().slice(0, 10);
    },
  },
};

export async function runLegalAgent(question: string, maxIterations = 4): Promise<AgentResult> {
  const route = selectModel({ taskType: "legal_reasoning", qualityHint: "premium" });
  const toolDocs = Object.values(ToolRegistry)
    .map((t) => `- ${t.name}: ${t.description}`)
    .join("\n");
  const messages: LlmMessage[] = [
    {
      role: "system",
      content:
        "Jesteś agentem prawniczym. Możesz wywoływać narzędzia, formatując odpowiedź jako:\n" +
        'CALL: {"tool":"nazwa","args":{...}}\n' +
        "Gdy masz odpowiedź końcową, napisz:\nFINAL: <odpowiedź>\n\n" +
        "Dostępne narzędzia:\n" + toolDocs,
    },
    { role: "user", content: question },
  ];
  const toolCalls: AgentResult["tool_calls"] = [];
  let totalCost = 0;
  for (let i = 0; i < maxIterations; i++) {
    const res = await callWithFallback(route.primary, route.fallbacks, messages, { temperature: 0, max_tokens: 1500 });
    totalCost += res.cost_grosze;
    const out = res.text.trim();
    if (out.startsWith("FINAL:")) {
      return { final_answer: out.slice(6).trim(), tool_calls: toolCalls, iterations: i + 1, cost_grosze: totalCost };
    }
    const callMatch = out.match(/CALL:\s*(\{[\s\S]*\})/);
    if (callMatch) {
      try {
        const parsed = JSON.parse(callMatch[1]);
        const tool = ToolRegistry[parsed.tool];
        if (!tool) {
          messages.push({ role: "assistant", content: out });
          messages.push({ role: "user", content: `Tool ${parsed.tool} nie istnieje.` });
          continue;
        }
        const result = await tool.invoke(parsed.args ?? {});
        toolCalls.push({ name: parsed.tool, args: parsed.args ?? {}, result });
        messages.push({ role: "assistant", content: out });
        messages.push({ role: "user", content: `Wynik ${parsed.tool}:\n${result}` });
      } catch {
        messages.push({ role: "user", content: "Niepoprawny JSON w CALL. Spróbuj ponownie." });
      }
    } else {
      return { final_answer: out, tool_calls: toolCalls, iterations: i + 1, cost_grosze: totalCost };
    }
  }
  return {
    final_answer: "Przekroczono limit iteracji agenta.",
    tool_calls: toolCalls,
    iterations: maxIterations,
    cost_grosze: totalCost,
  };
}
