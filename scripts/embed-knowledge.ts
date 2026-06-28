#!/usr/bin/env tsx
/**
 * Tier 3 / zad. 8 — Backfill embeddings dla `legal_knowledge`.
 *
 * Czyta wszystkie wiersze z `legal_knowledge` gdzie `embedding IS NULL`,
 * generuje embedding z (title + "\n\n" + content) przez `embedText()`
 * (APIPod / OpenAI / fallback deterministyczny) i zapisuje do bazy.
 *
 * Uruchomienie:
 *   pnpm tsx scripts/embed-knowledge.ts
 *   # lub
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *     APIPOD_API_KEY=... APIPOD_BASE_URL=... \
 *     pnpm tsx scripts/embed-knowledge.ts
 *
 * Po pierwszym pełnym backfillu uruchom w psql (jednorazowo):
 *   create index idx_legal_knowledge_embedding
 *     on public.legal_knowledge
 *     using ivfflat (embedding vector_cosine_ops) with (lists = 100);
 *
 * Idempotent — można uruchamiać wielokrotnie. Pomija wiersze, które już
 * mają embedding.
 */
import { createClient } from "@supabase/supabase-js";
import { embedText } from "../apps/web/lib/ai/embeddings";

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error(
    "Wymagane env: SUPABASE_URL (lub NEXT_PUBLIC_SUPABASE_URL) + SUPABASE_SERVICE_ROLE_KEY",
  );
  process.exit(1);
}

const BATCH_SIZE = 25;
const SLEEP_MS = 250; // ratelimit guard between batches

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let totalProcessed = 0;
  let totalFailed = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data, error } = await supabase
      .from("legal_knowledge")
      .select("id, title, content")
      .is("embedding", null)
      .order("created_at", { ascending: true })
      .limit(BATCH_SIZE);

    if (error) {
      console.error("Query error:", error.message);
      process.exit(2);
    }
    if (!data || data.length === 0) break;

    console.log(`Batch: ${data.length} rows...`);

    for (const row of data as Array<{ id: string; title: string; content: string }>) {
      try {
        const text = `${row.title}\n\n${row.content}`.slice(0, 8000);
        const vec = await embedText(text);
        // Zapis: pgvector akceptuje literalny string `[0.1,0.2,...]`.
        const literal = `[${vec.join(",")}]`;
        const { error: updErr } = await supabase
          .from("legal_knowledge")
          .update({ embedding: literal })
          .eq("id", row.id);
        if (updErr) {
          console.error(` ✗ ${row.id} — update failed: ${updErr.message}`);
          totalFailed += 1;
        } else {
          totalProcessed += 1;
          process.stdout.write(".");
        }
      } catch (e) {
        console.error(
          `\n ✗ ${row.id} — embed failed: ${e instanceof Error ? e.message : e}`,
        );
        totalFailed += 1;
      }
    }
    process.stdout.write("\n");
    await sleep(SLEEP_MS);
  }

  console.log(
    `\nDone — embedded: ${totalProcessed}, failed: ${totalFailed}.`,
  );
  if (totalProcessed > 0) {
    console.log(
      "Tip: utwórz indeks IVFFlat:\n" +
        "  create index idx_legal_knowledge_embedding\n" +
        "    on public.legal_knowledge\n" +
        "    using ivfflat (embedding vector_cosine_ops) with (lists = 100);",
    );
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(99);
});
