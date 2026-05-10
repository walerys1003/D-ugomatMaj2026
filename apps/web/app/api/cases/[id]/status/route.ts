/**
 * PATCH /api/cases/[id]/status — zmiana statusu sprawy.
 *
 * Body:
 *   { status: 'draft' | 'analysis' | 'generated' | 'paid' | 'downloaded' | 'completed' | 'archived' }
 *
 * Auth + RLS:
 *   - Wymaga zalogowanego usera.
 *   - RLS automatycznie filtruje UPDATE po user_id = auth.uid().
 *   - Dodatkowy ownership check (defense-in-depth) przed zwróceniem 200.
 *
 * Walidacja przejść:
 *   - Pewne tranzycje są zabronione (np. archived → draft, completed → analysis),
 *     by uniknąć "cofania" stanu i utraty audytu.
 *   - Caller dostaje 409 z hintem o niedozwolonej tranzycji.
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
  patchCase,
  logCaseEvent,
  getCaseById,
} from "@/lib/cases/case-repository";
import {
  revalidateCase,
} from "@/lib/cache/revalidation";
import type { CaseStatus } from "@/lib/db/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_VALUES = [
  "draft",
  "analysis",
  "generated",
  "paid",
  "downloaded",
  "completed",
  "archived",
] as const;

const bodySchema = z.object({
  status: z.enum(STATUS_VALUES) satisfies z.ZodType<CaseStatus>,
});

/**
 * Dozwolone tranzycje statusów (whitelist).
 *
 * Reguły:
 *  - draft → analysis | archived
 *  - analysis → draft | generated | archived
 *  - generated → paid | archived
 *  - paid → downloaded | completed | archived
 *  - downloaded → completed | archived
 *  - completed → archived
 *  - archived → (terminal, brak ruchu)
 */
const ALLOWED_TRANSITIONS: Record<CaseStatus, ReadonlyArray<CaseStatus>> = {
  draft:       ["analysis", "archived"],
  analysis:    ["draft", "generated", "archived"],
  generated:   ["paid", "archived"],
  paid:        ["downloaded", "completed", "archived"],
  downloaded:  ["completed", "archived"],
  completed:   ["archived"],
  archived:    [],
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const caseId = params.id;
  if (!caseId || !/^[0-9a-f-]{36}$/i.test(caseId)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();
  const { data: u, error: authErr } = await supabase.auth.getUser();
  if (authErr || !u.user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }
  const userId = u.user.id;

  const rl = rateLimit(`api:cases:patch:${userId}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetMs / 1000)) } },
    );
  }

  // IP belt-and-suspenders
  const ipLimit = rateLimit(
    `api:cases:patch:ip:${clientIdFromHeaders(req.headers)}`,
    RATE_LIMIT_PROFILES.api,
  );
  if (!ipLimit.allowed) {
    return NextResponse.json({ error: "rate_limit_ip" }, { status: 429 });
  }

  // Ownership + load current status
  const current = await getCaseById(caseId);
  if (!current) {
    return NextResponse.json({ error: "case_not_found" }, { status: 404 });
  }
  if (current.user_id !== userId) {
    // Nigdy się nie zdarzy dzięki RLS — ale logujemy.
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const next = parsed.data.status as CaseStatus;
  const allowed = ALLOWED_TRANSITIONS[current.status];
  if (current.status === next) {
    return NextResponse.json(
      { id: current.id, status: current.status, noop: true },
      { status: 200 },
    );
  }
  if (!allowed.includes(next)) {
    return NextResponse.json(
      {
        error: "invalid_transition",
        from: current.status,
        to: next,
        allowed,
      },
      { status: 409 },
    );
  }

  try {
    const updated = await patchCase({ id: caseId, status: next });
    await logCaseEvent(caseId, "case_status_changed", {
      from: current.status,
      to: next,
      source: "api",
    });
    revalidateCase(caseId, userId);

    return NextResponse.json(
      {
        id: updated.id,
        status: updated.status,
        updated_at: updated.updated_at,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: "internal", message: e instanceof Error ? e.message : String(e) },
      { status: 500 },
    );
  }
}

// Pozostałe metody — 405
export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    { error: "method_not_allowed" },
    { status: 405, headers: { allow: "PATCH" } },
  );
}
