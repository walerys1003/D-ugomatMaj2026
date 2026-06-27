/**
 * Wave 6 / T003-004 — GET + POST /api/support/tickets
 *
 * FE caller: `(panel)/panel/wsparcie/page.tsx` calls GET with
 * `{ cache: "no-store" }` and expects `{ tickets: Ticket[] }`.
 *
 * Persists tickets in `support_tickets` table; tolerates a missing
 * table and returns an empty list (so the UI never crashes).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const TicketCreateSchema = z.object({
  subject: z.string().trim().min(3).max(160),
  body: z.string().trim().min(10).max(8000),
  category: z
    .enum(["bug", "question", "billing", "feature", "other"])
    .default("other"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
});

export async function GET() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const { data, error } = await sb
    .from("support_tickets")
    .select("id, subject, status, category, priority, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    // Table missing in dev — return empty list rather than 500.
    return NextResponse.json({ tickets: [] }, { status: 200 });
  }

  return NextResponse.json({ tickets: data ?? [] }, { status: 200 });
}

export async function POST(req: NextRequest) {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = TicketCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }

  const row = {
    user_id: user.id,
    subject: parsed.data.subject,
    body: parsed.data.body,
    category: parsed.data.category,
    priority: parsed.data.priority,
    status: "open" as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // support_tickets not yet in typed Database — loose cast.
  const { data, error } = await (sb as unknown as {
    from: (t: string) => {
      insert: (r: Record<string, unknown>) => {
        select: (col: string) => { maybeSingle: () => Promise<{ data: { id?: string } | null; error: { message: string } | null }> };
      };
    };
  })
    .from("support_tickets")
    .insert(row)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "persist_failed", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data?.id, ok: true }, { status: 201 });
}
