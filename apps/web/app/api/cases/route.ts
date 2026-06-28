/**
 * /api/cases — REST endpoints for cases.
 *
 *   GET  /api/cases       — lista spraw current user (RLS auto-filter)
 *   POST /api/cases       — utworzenie nowej sprawy { type, title? }
 *
 * RLS (FORCE) gwarantuje, że SELECT/INSERT widzą tylko user.id = auth.uid(),
 * dodatkowo robimy explicit auth check, by zwrócić 401 zamiast pustej listy
 * gdy klient stracił sesję.
 *
 * Edge-runtime ready: używa cookie-aware Supabase client + token bucket.
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
} from "@/lib/security/rate-limit";
import {
  createCase,
  listCasesForCurrentUser,
} from "@/lib/cases/case-repository";
import { caseTypeMeta } from "@/lib/cases/case-types";
import type { CaseType } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// -----------------------------------------------------------------------------
// GET /api/cases
// -----------------------------------------------------------------------------
export async function GET(req: NextRequest): Promise<NextResponse> {
  const supabase = createSupabaseServerClient();
  const { data: u, error: authErr } = await supabase.auth.getUser();
  if (authErr || !u.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const rl = rateLimit(`api:cases:list:${u.user.id}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  // Anti-burst per IP
  const ipLimit = rateLimit(
    `api:cases:list:ip:${clientIdFromHeaders(req.headers)}`,
    RATE_LIMIT_PROFILES.api,
  );
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "rate_limit_ip" }, { status: 429 });
  }

  try {
    const cases = await listCasesForCurrentUser();
    return NextResponse.json(
      {
        items: cases.map((c) => ({
          id: c.id,
          type: c.type,
          title: c.title,
          status: c.status,
          sygnatura: c.sygnatura,
          sad: c.sad,
          created_at: c.created_at,
          updated_at: c.updated_at,
        })),
        total: cases.length,
      },
      {
        headers: {
          "cache-control": "private, no-store",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "internal", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

// -----------------------------------------------------------------------------
// POST /api/cases — body: { type, title?, initialMetadata? }
// -----------------------------------------------------------------------------
const caseTypeSchema = z.enum([
  "sprzeciw_epu",
  "komornik_zwolnienie_konta",
  "komornik_zwolnienie_swiadczen",
  "komornik_skarga",
  "komornik_ograniczenie",
  "komornik_umorzenie",
  "komornik_raty",
  "potracenia_wniosek_pracodawca",
  "potracenia_wniosek_komornik",
  "bik_reklamacja_bank",
  "bik_reklamacja_bik",
  "bik_skarga_uodo",
  "cesja_odpowiedz",
  "ugoda_raty",
  "ugoda_umorzenie",
  "ugoda_propozycja",
  "upadlosc_wniosek",
]);

const postBodySchema = z.object({
  type: caseTypeSchema,
  title: z.string().trim().min(2).max(200).optional(),
  initialMetadata: z.record(z.unknown()).optional(),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Kolejność: najpierw AUTH, potem walidacja body. Nieuwierzytelniony request
  // dostaje 401 zanim ujawnimy szczegóły walidacji (issues z Zod) — spójnie z GET
  // oraz z /api/ai/ocr i resztą chronionych endpointów.
  const supabase = createSupabaseServerClient();
  const { data: u, error: authErr } = await supabase.auth.getUser();
  if (authErr || !u.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = postBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  // Mocniejszy rate-limit dla POST (zapobiega zalewaniu DB śmieciowymi szkicami)
  const rl = rateLimit(`api:cases:create:${u.user.id}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  // Sprawdź status modułu — nie pozwalamy tworzyć spraw `planned` (D1 jako
  // wyjątek może być włączony w innym tier'ze, ale sterowanie jest w meta).
  const meta = caseTypeMeta[parsed.data.type as CaseType];
  if (!meta) {
    return NextResponse.json({ error: "invalid_case_type" }, { status: 400 });
  }
  if (meta.status === "planned") {
    return NextResponse.json(
      { error: "module_unavailable", message: "Moduł nie jest jeszcze dostępny." },
      { status: 409 },
    );
  }

  try {
    const created = await createCase({
      type: parsed.data.type as CaseType,
      title: parsed.data.title,
      initialMetadata: parsed.data.initialMetadata,
    });

    return NextResponse.json(
      {
        id: created.id,
        type: created.type,
        title: created.title,
        status: created.status,
        created_at: created.created_at,
      },
      {
        status: 201,
        headers: {
          location: `/api/cases/${created.id}`,
          "cache-control": "no-store",
        },
      },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "internal", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}
