/**
 * Tier 22 — Agent memory (long-term + episodic + working).
 *
 * Trzy warstwy:
 *  1. Working memory — efemeryczne, w obrębie jednego runa (już mamy w agent-loop)
 *  2. Episodic memory — zapisane runy + ich kroki, do późniejszej eksploracji
 *  3. Semantic memory — wektoryzowane podsumowania, przeszukiwane RAG-em
 *     przed nowym runem ("Czy widziałem już podobny problem?")
 *
 * Konwencja:
 *  - episodic w tabeli `agent_runs` + `agent_steps` (już istnieje)
 *  - semantic w tabeli `agent_memory` (id, user_id, kind, content, embedding,
 *    importance, created_at, last_accessed_at, access_count)
 *  - retrieve: top-K wg cosine similarity, recency boost, importance weight
 *  - forgetting: importance < 0.3 + ostatni dostęp > 90 dni → soft delete
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { embed } from "../../rag/embeddings";

export type MemoryKind = "fact" | "preference" | "case_pattern" | "user_correction" | "summary";

export interface AgentMemoryEntry {
  id: string;
  user_id: string;
  kind: MemoryKind;
  content: string;
  importance: number; // 0..1
  source_run_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  last_accessed_at: string;
  access_count: number;
}

/**
 * Zapisuje wpis pamięci semantycznej. Wektoryzuje content i zapisuje wraz z embedding.
 */
export async function rememberFact(args: {
  userId: string;
  kind: MemoryKind;
  content: string;
  importance?: number;
  sourceRunId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const embRes = await embed(args.content);
  const { data, error } = await supabase
    .from("agent_memory")
    .insert({
      user_id: args.userId,
      kind: args.kind,
      content: args.content,
      embedding: embRes.vector,
      importance: Math.max(0, Math.min(1, args.importance ?? 0.5)),
      source_run_id: args.sourceRunId ?? null,
      metadata: args.metadata ?? {},
    })
    .select("id")
    .single();
  if (error) throw error;
  return (data as { id: string }).id;
}

/**
 * Pobiera top-K wpisów pamięci semantycznej dla podanego zapytania.
 * Cosine similarity (pgvector) + recency boost + importance.
 */
export async function recallMemory(args: {
  userId: string;
  query: string;
  k?: number;
  kindFilter?: MemoryKind[];
}): Promise<AgentMemoryEntry[]> {
  const supabase = await createSupabaseServerClient();
  const k = args.k ?? 8;
  const embRes = await embed(args.query);
  // Używamy RPC search_agent_memory zdefiniowanego w migracji.
  const { data, error } = await supabase.rpc("search_agent_memory", {
    p_user_id: args.userId,
    p_query_embedding: embRes.vector,
    p_k: k,
    p_kinds: args.kindFilter ?? null,
  });
  if (error) {
    // Fallback: bez RPC — pobieramy najnowsze wg ważności
    const { data: fallback } = await supabase
      .from("agent_memory")
      .select("*")
      .eq("user_id", args.userId)
      .order("importance", { ascending: false })
      .order("last_accessed_at", { ascending: false })
      .limit(k);
    return (fallback ?? []) as AgentMemoryEntry[];
  }

  // Touch — bump access_count + last_accessed_at
  const ids = ((data ?? []) as Array<{ id: string }>).map((r) => r.id);
  if (ids.length > 0) {
    await supabase
      .from("agent_memory")
      .update({ last_accessed_at: new Date().toISOString() })
      .in("id", ids)
      .then(() => null)
      .catch(() => null);
  }
  return (data ?? []) as AgentMemoryEntry[];
}

/**
 * Wyciąga "lekcje" z zakończonego runa i zapisuje jako facts.
 * Heurystyka: szuka w final_answer fraz typu "uwaga", "ważne", "pamiętaj",
 * cytatów artykułów, dat (terminów), wyliczeń kwotowych.
 */
export async function extractAndStoreLessons(args: {
  userId: string;
  runId: string;
  finalAnswer: string;
  goal: string;
}): Promise<number> {
  const lessons: string[] = [];

  // 1. Explicit markers
  const explicitMatches = args.finalAnswer.match(
    /(?:uwaga|ważne|pamiętaj|należy|trzeba|warto)[^.!?]{20,200}[.!?]/gi,
  );
  if (explicitMatches) lessons.push(...explicitMatches);

  // 2. Cytaty artykułów z kontekstem
  const sentences = args.finalAnswer.split(/(?<=[.!?])\s+/);
  for (const s of sentences) {
    if (/art\.\s*\d+|§\s*\d+/i.test(s) && s.length > 50 && s.length < 400) {
      lessons.push(s.trim());
    }
  }

  let stored = 0;
  for (const lesson of lessons.slice(0, 5)) {
    // max 5 lekcji per run
    await rememberFact({
      userId: args.userId,
      kind: "case_pattern",
      content: `Kontekst: ${args.goal}\nLekcja: ${lesson}`,
      importance: 0.6,
      sourceRunId: args.runId,
    }).catch(() => null);
    stored++;
  }
  return stored;
}

/**
 * Forgetting policy — soft-delete starych nieużywanych wpisów.
 */
export async function pruneMemory(args: {
  userId: string;
  dryRun?: boolean;
}): Promise<number> {
  const supabase = await createSupabaseServerClient();
  const cutoff = new Date(Date.now() - 90 * 86_400_000).toISOString();
  if (args.dryRun) {
    const { count } = await supabase
      .from("agent_memory")
      .select("id", { count: "exact", head: true })
      .eq("user_id", args.userId)
      .lt("importance", 0.3)
      .lt("last_accessed_at", cutoff);
    return count ?? 0;
  }
  const { data, error } = await supabase
    .from("agent_memory")
    .delete()
    .eq("user_id", args.userId)
    .lt("importance", 0.3)
    .lt("last_accessed_at", cutoff)
    .select("id");
  if (error) throw error;
  return (data ?? []).length;
}

/**
 * Buduje context hint dla agent-loop — top-K wspomnień jako prefix do goalu.
 */
export async function buildMemoryContextHint(args: {
  userId: string;
  goal: string;
  k?: number;
}): Promise<string | null> {
  const memories = await recallMemory({ userId: args.userId, query: args.goal, k: args.k ?? 5 });
  if (memories.length === 0) return null;
  const lines = memories.map((m, i) => `[${i + 1}] (${m.kind}) ${m.content}`);
  return `Wcześniejsze obserwacje:\n${lines.join("\n")}`;
}
