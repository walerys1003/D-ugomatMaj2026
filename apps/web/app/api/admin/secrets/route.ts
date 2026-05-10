/**
 * Tier 23 — Secret vault admin API.
 *
 * GET    /api/admin/secrets?org=…&key=…  → list or single (reveal=true → plaintext)
 * POST   /api/admin/secrets              → upsert secret
 * DELETE /api/admin/secrets?key=…&org=…  → delete
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  setSecret,
  getSecret,
  deleteSecret,
  listSecrets,
} from "@/lib/security/secret-vault";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function getAdmin(): Promise<{ ok: boolean; userId?: string }> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false };
  const role = (user.app_metadata as Record<string, unknown> | undefined)?.role;
  return { ok: role === "admin", userId: user.id };
}

export async function GET(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok || !admin.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const org = url.searchParams.get("org");
  const key = url.searchParams.get("key");
  const reveal = url.searchParams.get("reveal") === "true";

  if (key) {
    if (!reveal) {
      return NextResponse.json({ error: "reveal_query_required" }, { status: 400 });
    }
    const value = await getSecret({
      organizationId: org,
      key,
      actorId: admin.userId,
    });
    if (value === null) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ key, value });
  }

  const secrets = await listSecrets({ organizationId: org });
  return NextResponse.json({ secrets });
}

export async function POST(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok || !admin.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const body = (await req.json().catch(() => null)) as
    | {
        key?: string;
        value?: string;
        organizationId?: string | null;
        description?: string;
        rotationDays?: number;
      }
    | null;
  if (!body?.key || typeof body.value !== "string") {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }
  const secret = await setSecret({
    organizationId: body.organizationId ?? null,
    key: body.key,
    value: body.value,
    description: body.description,
    rotationDays: body.rotationDays,
    actorId: admin.userId,
  });
  return NextResponse.json(
    {
      secret: {
        id: secret.id,
        key: secret.key,
        version: secret.version,
        rotation_due_at: secret.rotation_due_at,
      },
    },
    { status: 201 },
  );
}

export async function DELETE(req: Request) {
  const admin = await getAdmin();
  if (!admin.ok || !admin.userId) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const url = new URL(req.url);
  const org = url.searchParams.get("org");
  const key = url.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });
  await deleteSecret({
    organizationId: org,
    key,
    actorId: admin.userId,
  });
  return NextResponse.json({ ok: true });
}
