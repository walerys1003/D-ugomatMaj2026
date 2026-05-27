/**
 * Wave 7 / T003-104 — Public API v1: GET /api/v1/documents
 *
 * Lista dokumentów użytkownika z paginacją. Filtruje po
 * case_id + status + module. Auth jak w /api/v1/cases (session OR bearer).
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ListQuery = z.object({
  case_id: z.string().uuid().optional(),
  status: z.enum(["draft", "generated", "signed", "filed", "all"]).optional().default("all"),
  module: z.string().trim().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
});

async function resolveUserId(req: NextRequest): Promise<string | null> {
  const sb = await createServerSupabase();
  const { data: { user } } = await sb.auth.getUser();
  if (user) return user.id;

  const auth = req.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (!token) return null;
    try {
      const { data } = await (sb as unknown as {
        from: (t: string) => {
          select: (c: string) => {
            eq: (col: string, v: string) => {
              maybeSingle: () => Promise<{ data: { user_id?: string; revoked_at?: string | null } | null }>;
            };
          };
        };
      })
        .from("api_keys")
        .select("user_id, revoked_at")
        .eq("token", token)
        .maybeSingle();
      if (data?.user_id && !data.revoked_at) return data.user_id;
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(req: NextRequest) {
  const userId = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const url = new URL(req.url);
  const parsed = ListQuery.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }

  const sb = await createServerSupabase();
  // Loose-typed builder — `documents` table missing `module` in generated Database type
  type LooseBuilder = {
    eq: (col: string, val: unknown) => LooseBuilder;
    order: (col: string, opts: { ascending: boolean }) => LooseBuilder;
    limit: (n: number) => LooseBuilder;
    lt: (col: string, val: unknown) => LooseBuilder;
  };
  const sbLoose = sb as unknown as {
    from: (t: string) => { select: (c: string) => LooseBuilder };
  };
  let q: LooseBuilder = sbLoose
    .from("documents")
    .select("id, case_id, title, module, status, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.case_id) q = q.eq("case_id", parsed.data.case_id);
  if (parsed.data.status !== "all") q = q.eq("status", parsed.data.status);
  if (parsed.data.module) q = q.eq("module", parsed.data.module);
  if (parsed.data.cursor) q = q.lt("id", parsed.data.cursor);

  const { data, error } = (await (q as unknown as Promise<{ data: Array<{ id: string }> | null; error: { message: string } | null }>));
  if (error) {
    return NextResponse.json(
      { error: "fetch_failed", details: error.message },
      { status: 500 },
    );
  }
  const nextCursor = (data && data.length === parsed.data.limit) ? data[data.length - 1]?.id : null;
  return NextResponse.json(
    { data: data ?? [], pagination: { limit: parsed.data.limit, cursor: nextCursor } },
    { status: 200 },
  );
}
