/**
 * POST /api/ai/generate — generacja pisma z SSE streaming.
 *
 * Endpoint dla UX "pismo na żywo" (Tier 4): klient otwiera fetch'a z
 * `Accept: text/event-stream`, dostaje strumień zdarzeń:
 *
 *   event: meta    — meta info (modelId, ragSource, promptHash)
 *   event: delta   — fragment markdown (text)
 *   event: validation — wynik walidatora (Haiku 4.5)
 *   event: done    — final summary (tokens, cost, durationMs, finalRole)
 *   event: error   — błąd (msg, code)
 *
 * Body request:
 *   { caseId: string }
 *
 * Auth + RLS:
 *   - Auth check przez Supabase user JWT (cookies)
 *   - Pobranie sprawy + RLS: user widzi tylko swoje (auth.uid() = user_id)
 *   - Rate-limit: documentGenerate (5 / min na user) — drogie wywołania AI
 *
 * Fallback:
 *   - Gdy AI niedostępne (`AiUnavailableError`) — zwracamy SSE event 'error'
 *     ze status_code='ai_unavailable'. Klient powinien fallbackować do
 *     /api/cases/<id>/generate-static (Tier 2 template) lub pokazać CTA.
 */
import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimitDistributed,
} from "@/lib/security/rate-limit";
import {
  runGenerationPipeline,
  AiUnavailableError,
} from "@/lib/ai/generation-pipeline";
import type { CaseRow } from "@/lib/db/types";
import {
  parseIdempotencyHeader,
  reserveIdempotency,
  completeIdempotency,
  abortIdempotency,
} from "@/lib/observability/idempotency";
import { logger, withLogContext, generateCorrelationId } from "@/lib/observability/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Budujemy zmienne wejściowe dla pipeline'u z surowych pól sprawy +
// answers z wizard_state.
function buildGenerationVariables(c: CaseRow): Record<string, unknown> {
  const wizardAnswers =
    c.wizard_state && typeof c.wizard_state === "object" && "answers" in c.wizard_state
      ? (c.wizard_state as { answers?: Record<string, unknown> }).answers ?? {}
      : {};
  return {
    case_id: c.id,
    case_type: c.type,
    case_title: c.title,
    sygnatura: c.sygnatura ?? "",
    sad: c.sad ?? "",
    data_nakazu: c.data_nakazu ?? "",
    data_doreczenia: c.data_doreczenia ?? "",
    powod_nazwa: c.powod_nazwa ?? "",
    powod_adres: c.powod_adres ?? "",
    pozwany_nazwa: c.pozwany_nazwa ?? "",
    pozwany_adres: c.pozwany_adres ?? "",
    kwota_glowna: c.kwota_glowna ?? 0,
    kwota_odsetki: c.kwota_odsetki ?? 0,
    kwota_koszty: c.kwota_koszty ?? 0,
    kwota_razem: c.kwota_razem ?? 0,
    ...wizardAnswers,
  };
}

interface GenerateBody {
  caseId?: string;
}

export async function POST(req: NextRequest): Promise<Response> {
  // ---------------------------------------------------------------------
  // 1) Parse + validate body
  // ---------------------------------------------------------------------
  let body: GenerateBody = {};
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const caseId = typeof body.caseId === "string" ? body.caseId : "";
  if (!caseId || !/^[0-9a-f-]{36}$/i.test(caseId)) {
    return NextResponse.json({ error: "invalid_case_id" }, { status: 400 });
  }

  // ---------------------------------------------------------------------
  // 2) Auth check
  // ---------------------------------------------------------------------
  const supabase = createSupabaseServerClient();
  const { data: u, error: authErr } = await supabase.auth.getUser();
  if (authErr || !u.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = u.user.id;

  // ---------------------------------------------------------------------
  // 2.5) Tier 6 zad. 260 — Chaos engineering flag.
  // Gdy DLUGOMAT_AI_DEGRADE=true (lub probabilistycznie z _RATE),
  // losowo zwraca 503, by przetestować UX degradacji na produkcji.
  // ---------------------------------------------------------------------
  const chaosOn = process.env.DLUGOMAT_AI_DEGRADE === "true";
  const chaosRate = Number(process.env.DLUGOMAT_AI_DEGRADE_RATE ?? "0");
  if (chaosOn && Math.random() < (Number.isFinite(chaosRate) ? chaosRate : 1)) {
    return NextResponse.json(
      { error: "ai_unavailable_chaos", message: "Chaos engineering: forced degradation" },
      { status: 503, headers: { "Retry-After": "10" } },
    );
  }

  // ---------------------------------------------------------------------
  // 3) Rate-limit per user (drogie wywołania AI)
  // ---------------------------------------------------------------------
  // Audyt #2 — rozproszony rate-limit (Upstash Redis). Gdy brak konfiguracji
  // Redis, funkcja degraduje do limitu in-memory (zachowanie jak dotąd),
  // ale w środowisku wieloinstancyjnym limit jest egzekwowany globalnie.
  const rl = await rateLimitDistributed(
    `ai:generate:user:${userId}`,
    RATE_LIMIT_PROFILES.documentGenerate,
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded", retry_after_ms: rl.resetMs },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) },
      },
    );
  }
  // Drugi limit po IP (anty-spam jednego user_id z wielu kont)
  const ipLimit = await rateLimitDistributed(
    `ai:generate:ip:${clientIdFromHeaders(req.headers)}`,
    RATE_LIMIT_PROFILES.api,
  );
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: "rate_limit_ip" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(ipLimit.resetMs / 1000)) } },
    );
  }

  // ---------------------------------------------------------------------
  // 3.5) Tier 6 zad. 255 — Idempotency-Key support
  // Klient może wysłać nagłówek `Idempotency-Key` (UUID/ULID).
  // Pierwsze wywołanie rezerwuje klucz; kolejne z tym samym kluczem
  // zwracają cached result (24h TTL).
  // ---------------------------------------------------------------------
  const idemKey = parseIdempotencyHeader(req.headers.get("idempotency-key"));
  const correlationId = req.headers.get("x-request-id") ?? generateCorrelationId();
  const idemScope = `ai.generate:${userId}`;
  if (idemKey) {
    try {
      const lookup = await reserveIdempotency<{ document_id?: string; cached: true }>({
        scope: idemScope,
        key: idemKey,
        user_id: userId,
      });
      if (lookup.hit && lookup.status === "completed" && lookup.result) {
        logger.info("ai.generate.idempotency_hit", { caseId, idemKey });
        return NextResponse.json(lookup.result, {
          status: lookup.http_status ?? 200,
          headers: { "X-Idempotent-Replay": "true", "X-Correlation-Id": correlationId },
        });
      }
      if (lookup.hit && lookup.status === "in_progress") {
        return NextResponse.json(
          { error: "idempotency_in_progress", message: "Duplicate request in progress." },
          { status: 409, headers: { "Retry-After": "5" } },
        );
      }
    } catch (e) {
      logger.warn("ai.generate.idempotency_reserve_failed", {
        caseId,
        error: e instanceof Error ? e.message : String(e),
      });
      // Nie blokuj generacji jeśli idempotency cache nie działa.
    }
  }

  // ---------------------------------------------------------------------
  // 4) Load case (RLS: user widzi tylko swoje)
  // ---------------------------------------------------------------------
  const { data: caseRow, error: caseErr } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (caseErr || !caseRow) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }
  // Defense-in-depth — RLS już to zrobiło, ale waliduje nawet gdyby ktoś
  // wkradł się przez service-role
  if (caseRow.user_id !== userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  // ---------------------------------------------------------------------
  // 5) Stream
  // ---------------------------------------------------------------------
  const encoder = new TextEncoder();
  const variables = buildGenerationVariables(caseRow as CaseRow);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const writeEvent = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      // Heartbeat co 15s — chroni przed zamknięciem przez proxy
      const hb = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat ${Date.now()}\n\n`));
        } catch {
          /* stream closed */
        }
      }, 15_000);

      try {
        writeEvent("status", { phase: "starting", caseId });

        // Tier 3 zad. 108/109/110 — pipeline z budget guardrail (userId+caseId).
        // Pipeline jest blokujący (Sonnet → Haiku → optional Opus), ale w środku
        // przepuszczamy markdown przez "soft-stream" — dzielimy go na linijki
        // i emitujemy event 'delta' co każdy zakończony akapit, by UX miał
        // realistyczną animację bez konieczności prawdziwego SSE z backendu.
        // Prawdziwy per-token SSE jest dostępny w `completeStreaming()` w
        // apipod-client.ts — Tier 4 podepnie go tu po dopracowaniu UX
        // (obecnie 6-fragmentowy soft-stream jest deterministyczny i tańszy
        // — nie wymaga drugiego wywołania backendu).
        const result = await runGenerationPipeline({
          caseType: caseRow.type,
          variables,
          userId,
          caseId,
        });

        writeEvent("meta", {
          modelId: result.modelId,
          ragSource: result.ragSource,
          promptHash: result.promptHash,
          finalRole: result.finalRole,
        });

        // Soft-stream — emituje delty co akapit (po podwójnym \n) z mikrostopem
        // 35 ms, by UI mogło je animować w terminal-style typewriter.
        const md = result.markdown;
        const paragraphs = md.split(/\n\n+/);
        for (const para of paragraphs) {
          if (para.trim().length === 0) continue;
          writeEvent("delta", { text: para + "\n\n" });
          // mikrostop nie blokuje pipeline'u (await tu jest tylko dla UX)
          await new Promise((r) => setTimeout(r, 35));
        }

        if (result.validation) {
          writeEvent("validation", {
            pass: result.validation.pass,
            score: result.validation.score,
            issues: result.validation.issues,
          });
        }

        writeEvent("done", {
          tokensInput: result.tokensInput,
          tokensOutput: result.tokensOutput,
          costUsd: result.costUsd,
          durationMs: result.durationMs,
          finalRole: result.finalRole,
        });

        // Audyt #3 — DOMKNIĘCIE idempotency. Bez tego rezerwacja zostawała
        // na zawsze "in_progress" → każdy retry z tym samym kluczem dostawał
        // 409 przez 24h. Zapisujemy completed z metadanymi (PII-safe — bez
        // pełnej treści pisma; klient i tak dostał ją przez SSE).
        if (idemKey) {
          try {
            await completeIdempotency(
              { scope: idemScope, key: idemKey, user_id: userId },
              {
                cached: true,
                modelId: result.modelId,
                finalRole: result.finalRole,
                tokensInput: result.tokensInput,
                tokensOutput: result.tokensOutput,
                costUsd: result.costUsd,
              },
              200,
            );
          } catch (e) {
            logger.warn("ai.generate.idempotency_complete_failed", {
              caseId,
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }
      } catch (err) {
        const isAiOff = err instanceof AiUnavailableError;
        const message =
          err instanceof Error ? err.message : String(err);
        writeEvent("error", {
          code: isAiOff ? "ai_unavailable" : "internal",
          message,
        });

        // Audyt #3 — przy błędzie ZWALNIAMY rezerwację (delete), aby klient
        // mógł ponowić to samo żądanie z tym samym Idempotency-Key.
        if (idemKey) {
          try {
            await abortIdempotency({ scope: idemScope, key: idemKey, user_id: userId });
          } catch {
            /* best-effort — TTL i tak posprząta */
          }
        }
      } finally {
        clearInterval(hb);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      }
    },
    cancel() {
      // klient zamknął stream — nic do robienia poza GC
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "connection": "keep-alive",
      "x-accel-buffering": "no", // wyłącz nginx buffering
    },
  });
}

export async function GET(): Promise<Response> {
  return NextResponse.json(
    { error: "method_not_allowed", hint: "Użyj POST z JSON body { caseId }." },
    { status: 405, headers: { allow: "POST" } },
  );
}
