/**
 * Wave 7 / T003-102 — POST /api/auth/register
 *
 * Server-side registration wrapper called by `rejestracja/wizard-client.tsx`.
 * Wykonuje Supabase `auth.signUp` z server-side klientem, ustawia
 * email confirmation flow, opcjonalnie tworzy profil + zapisuje
 * marketing opt-in.
 *
 * Body schema:
 *   { email, password, first_name?, last_name?, phone?,
 *     marketing_opt_in?, terms_accepted, source? }
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const Schema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  password: z.string().min(8).max(160),
  first_name: z.string().trim().min(1).max(80).optional(),
  last_name: z.string().trim().min(1).max(80).optional(),
  phone: z.string().trim().max(40).optional(),
  marketing_opt_in: z.boolean().optional().default(false),
  terms_accepted: z.literal(true, {
    errorMap: () => ({ message: "Musisz zaakceptować regulamin." }),
  }),
  source: z.string().trim().max(64).optional(),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_failed", issues: parsed.error.issues.slice(0, 8) },
      { status: 400 },
    );
  }
  const data = parsed.data;

  const sb = await createServerSupabase();
  const origin = new URL(req.url).origin;

  // Supabase signUp from server side. The user will receive a
  // confirmation email (if email confirm is required in Supabase
  // project settings).
  const { data: signUpData, error: signUpError } = await sb.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/panel`,
      data: {
        first_name: data.first_name ?? null,
        last_name: data.last_name ?? null,
        phone: data.phone ?? null,
        marketing_opt_in: data.marketing_opt_in,
        source: data.source ?? "wizard",
      },
    },
  });

  if (signUpError) {
    // Map common Supabase errors to friendly Polish messages.
    const msg = signUpError.message.toLowerCase();
    let friendly = "Nie udało się założyć konta.";
    let status = 400;
    if (msg.includes("already") || msg.includes("registered")) {
      friendly = "Konto z tym adresem email już istnieje.";
      status = 409;
    } else if (msg.includes("password")) {
      friendly = "Hasło nie spełnia wymagań bezpieczeństwa.";
    } else if (msg.includes("rate") || msg.includes("limit")) {
      friendly = "Zbyt wiele prób. Spróbuj ponownie za chwilę.";
      status = 429;
    }
    return NextResponse.json(
      { error: friendly, code: signUpError.code ?? "signup_failed" },
      { status },
    );
  }

  const userId = signUpData.user?.id;
  const requiresVerification = !signUpData.session;

  // Best-effort: persist profile metadata. Tolerate missing/locked profile table.
  if (userId && (data.first_name || data.last_name || data.phone)) {
    try {
      await sb
        .from("profiles")
        .update({
          first_name: data.first_name ?? null,
          last_name: data.last_name ?? null,
          phone: data.phone ?? null,
        } as never)
        .eq("id", userId);
    } catch {
      // ignore — onboarding can fill profile later
    }
  }

  return NextResponse.json(
    {
      ok: true,
      requiresVerification,
      userId,
      message: requiresVerification
        ? "Wysłaliśmy link weryfikacyjny na podany adres email."
        : "Konto utworzone.",
    },
    { status: 201 },
  );
}
