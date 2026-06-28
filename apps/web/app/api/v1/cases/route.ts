/**
 * Wave 7 / T003-103 — Public API v1: GET + POST /api/v1/cases
 *
 * Public API for 3rd-party SDK integrations. Auth via bearer token
 * (api_keys table) or session cookie. Returns pagination + filters.
 *
 * GET query params:
 *   ?status=open|closed|archived&module=sprzeciw-epu&limit=50&cursor=<uuid>
 *
 * POST body:
 *   { title, module, debt_amount_grosze?, creditor_name? }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ListQuery = z.object({
  status: z.enum(["open", "closed", "archived", "all"]).optional().default("open"),
  module: z.string().trim().max(40).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  cursor: z.string().uuid().optional(),
});

const CreateBody = z.object({
  title: z.string().trim().min(2).max(200),
  module: z.string().trim().min(2).max(40),
  debt_amount_grosze: z.number().int().min(0).max(1_000_000_00).optional(),
  creditor_name: z.string().trim().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * Resolve userId from session cookie OR from `Authorization: Bearer <api_key>`.
 */
async function resolveUserId(req: NextRequest): Promise<{ userId: string | null; via: "session" | "api_key" | "none" }> {
  const sb = await createSupabaseServerClient();
  const { data: { user } } = await sb.auth.getUser();
  if (user) return { userId: user.id, via: "session" };

  const auth = req.headers.get("authorization") ?? "";
  if (auth.toLowerCase().startsWith("bearer ")) {
    const token = auth.slice(7).trim();
    if (token) {
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
        if (data?.user_id && !data.revoked_at) {
          return { userId: data.user_id, via: "api_key" };
        }
      } catch {
        // api_keys table missing in dev — skip
      }
    }
  }
  return { userId: null, via: "none" };
}

export async function GET(req: NextRequest) {
  const { userId } = await resolveUserId(req);
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

  const sb = await createSupabaseServerClient();
  // Loose-typed builder — Database type does not include `module` / `creditor_name` columns
  // on the `cases` table yet, so we cast through a permissive shape.
  type LooseBuilder = {
    eq: (col: string, val: unknown) => LooseBuilder;
    order: (col: string, opts: { ascending: boolean }) => LooseBuilder;
    limit: (n: number) => LooseBuilder;
    lt: (col: string, val: unknown) => LooseBuilder;
    then: <T>(cb: (v: { data: Array<{ id: string }> | null; error: { message: string } | null }) => T) => Promise<T>;
  };
  const sbLoose = sb as unknown as {
    from: (t: string) => { select: (c: string) => LooseBuilder };
  };
  let query: LooseBuilder = sbLoose
    .from("cases")
    .select("id, title, module, status, debt_amount_grosze, creditor_name, created_at, updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(parsed.data.limit);

  if (parsed.data.status !== "all") {
    query = query.eq("status", parsed.data.status);
  }
  if (parsed.data.module) {
    query = query.eq("module", parsed.data.module);
  }
  if (parsed.data.cursor) {
    query = query.lt("id", parsed.data.cursor);
  }

  const { data, error } = (await (query as unknown as Promise<{ data: Array<{ id: string }> | null; error: { message: string } | null }>));
  if (error) {
    return NextResponse.json(
      { error: "fetch_failed", details: error.message },
      { status: 500 },
    );
  }

  const nextCursor = (data && data.length === parsed.data.limit) ? data[data.length - 1]?.id : null;
  return NextResponse.json(
    {
      data: data ?? [],
      pagination: { limit: parsed.data.limit, cursor: nextCursor },
    },
    { status: 200 },
  );
}

export async function POST(req: NextRequest) {
  const { userId } = await resolveUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = CreateBody.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }

  const sb = await createSupabaseServerClient();
  const now = new Date().toISOString();
  const row = {
    user_id: userId,
    title: parsed.data.title,
    module: parsed.data.module,
    status: "open" as const,
    debt_amount_grosze: parsed.data.debt_amount_grosze ?? null,
    creditor_name: parsed.data.creditor_name ?? null,
    metadata: parsed.data.metadata ?? null,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await sb
    .from("cases")
    .insert(row as never)
    .select("id, title, module, status, created_at")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "create_failed", details: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json(data ?? { ok: true }, { status: 201 });
}
