/**
 * Wave 6 / T003-005 — POST /api/wizard/save
 *
 * Referenced by `lib/sync/offline-queue.ts` as a representative
 * `endpoint` example. Persists a wizard draft (module + step + answers)
 * so the user can resume across devices / sessions.
 *
 * Schema is intentionally permissive on `answers` (the wizard collects
 * structured but heterogeneous data per module D1–D16).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WizardSaveSchema = z.object({
  module: z.enum([
    "sprzeciw-epu",
    "komornik",
    "cesja",
    "bik-fix",
    "ugoda",
    "potracenia",
    "upadlosc",
    "upadlosc-pelna",
    "wezwania",
    "zwrot-oplat",
    "reklamacja-bank",
    "skarga-puodo",
    "raty-sadowe",
    "zwolnienie-kosztow",
    "zazalenie-klauzuli",
    "powodztwo-przeciwegzekucyjne",
  ]),
  step: z.string().min(1).max(64),
  answers: z.record(z.string(), z.unknown()),
  caseId: z.string().uuid().optional(),
  // Optional idempotency token from the offline queue.
  idempotencyKey: z.string().max(128).optional(),
});

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = WizardSaveSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const now = new Date().toISOString();

  // Upsert into wizard_drafts keyed by (user_id, module, case_id).
  // The table may not exist in fresh dev databases — fall back gracefully.
  // wizard_drafts not yet in typed Database — loose cast.
  type LooseClient = {
    from: (t: string) => {
      select: (col: string) => {
        eq: (col: string, v: string) => {
          eq: (c: string, v: string) => { maybeSingle: () => Promise<{ data: { id?: string } | null }> };
        };
      };
      insert: (r: Record<string, unknown>) => {
        select: (col: string) => { maybeSingle: () => Promise<{ data: { id?: string } | null; error: unknown }> };
      };
      update: (r: Record<string, unknown>) => { eq: (col: string, v: string) => Promise<unknown> };
    };
  };
  const sbLoose = sb as unknown as LooseClient;
  try {
    const row = {
      user_id: user.id,
      module: data.module,
      step: data.step,
      answers: data.answers,
      case_id: data.caseId ?? null,
      idempotency_key: data.idempotencyKey ?? null,
      updated_at: now,
    };

    const { data: existing } = await sbLoose
      .from("wizard_drafts")
      .select("id")
      .eq("user_id", user.id)
      .eq("module", data.module)
      .maybeSingle();

    if (existing?.id) {
      await sbLoose.from("wizard_drafts").update(row).eq("id", existing.id);
      return NextResponse.json(
        { ok: true, id: existing.id, updated: true },
        { status: 200 },
      );
    } else {
      const insertRow = { ...row, created_at: now };
      const { data: inserted, error } = await sbLoose
        .from("wizard_drafts")
        .insert(insertRow)
        .select("id")
        .maybeSingle();
      if (error) throw error;
      return NextResponse.json(
        { ok: true, id: inserted?.id, created: true },
        { status: 201 },
      );
    }
  } catch (err) {
    // Table missing or RLS failure: behave like an offline-queue accept
    // so the FE can keep its local copy and retry later.
    return NextResponse.json(
      {
        ok: true,
        deferred: true,
        reason: "persistence_unavailable",
      },
      { status: 202 },
    );
  }
}
