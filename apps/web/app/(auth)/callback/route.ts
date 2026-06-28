import { NextResponse, type NextRequest } from "next/server";
import {
  createSupabaseServerClient,
  createSupabaseAdminClient,
} from "@/lib/db/supabase-server";
import { enrollUserInOnboarding } from "@/lib/notifications/onboarding-scheduler";
import {
  clearReferralCookie,
  readReferralCookie,
} from "@/lib/referrals/referral-actions";

/**
 * OAuth / magic-link / email-confirm callback. Supabase redirects here
 * with a `code` query param after the user clicks the link in their inbox.
 *
 *   /auth/callback?code=xxxxx&next=/panel/sprawy/abc
 *
 * We exchange the code for a session, then push the user to `next`
 * (validated as same-origin) or `/panel` if no/invalid `next`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  // Same-origin redirect target only — never honour external `next`.
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/panel";

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=missing_code`);
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const reason = encodeURIComponent(error.message ?? "exchange_failed");
    return NextResponse.redirect(`${origin}/sign-in?error=${reason}`);
  }

  // Onboarding enrollment (zad. 243) — best-effort, never blokuje login.
  // Idempotent: enrollUserInOnboarding pomija sloty które już istnieją.
  try {
    const user = data?.user;
    if (user?.id && user.email) {
      const fullName =
        (user.user_metadata?.full_name as string | undefined) ?? null;
      await enrollUserInOnboarding({
        userId: user.id,
        email: user.email,
        fullName,
      });
    }
  } catch (e) {
    // Nie crashuj login — onboarding nie jest critical-path.
    console.warn("[auth/callback] onboarding enrollment failed", e);
  }

  // Referral attribution (zad. 246) — jeśli cookie 'dlugomat-ref' jest obecne
  // i `profiles.referred_by_code` jeszcze nie ustawione (pierwsze logowanie),
  // wpisujemy kod do profilu. Best-effort, nigdy nie blokuje login.
  try {
    const user = data?.user;
    const refCode = readReferralCookie();
    if (user?.id && refCode) {
      const admin = createSupabaseAdminClient();
      // Anty-self-referral: jeśli ten user JEST właścicielem kodu, ignoruj.
      const { data: codeOwner } = await admin
        .from("referral_codes")
        .select("user_id")
        .eq("code", refCode)
        .eq("is_active", true)
        .maybeSingle();

      if (codeOwner && codeOwner.user_id !== user.id) {
        // Update tylko jeśli nie ustawione (nie nadpisuj — pierwszy referrer wygrywa).
        await admin
          .from("profiles")
          .update({ referred_by_code: refCode })
          .eq("id", user.id)
          .is("referred_by_code", null);
      }
      // Wyczyść cookie — niezależnie od wyniku update'u (nie chcemy
      // przy każdym kolejnym loginie wracać do tej logiki).
      clearReferralCookie();
    }
  } catch (e) {
    console.warn("[auth/callback] referral attribution failed", e);
  }

  return NextResponse.redirect(`${origin}${safeNext}`);
}
