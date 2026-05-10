/**
 * GET /api/i18n/translations?locale=cs — zwraca dictionary translations dla SPA.
 * Cache 1h CDN — translations rzadko się zmieniają.
 */
import { NextResponse } from "next/server";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { t } from "@/lib/i18n/translations";

export const dynamic = "force-dynamic";

const ALL_KEYS = [
  "nav.home", "nav.pricing", "nav.modules", "nav.how_it_works",
  "nav.knowledge_base", "nav.login", "nav.signup", "nav.dashboard", "nav.logout",
  "cta.start_free", "cta.generate_letter", "cta.see_pricing", "cta.contact_us",
  "wizard.next", "wizard.previous", "wizard.skip", "wizard.save_exit", "wizard.continue",
  "checkout.subtotal", "checkout.vat", "checkout.total", "checkout.pay", "checkout.applying_coupon",
  "common.loading", "common.error", "common.retry", "common.cancel",
  "common.save", "common.delete", "common.edit", "common.continue",
  "errors.network", "errors.validation", "errors.payment", "errors.session_expired",
  "footer.copyright", "footer.terms", "footer.privacy", "footer.contact",
  "hero.title", "hero.subtitle",
  "auth.email", "auth.password", "auth.confirm_password", "auth.forgot_password",
] as const;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale") ?? DEFAULT_LOCALE;
  const locale = (SUPPORTED_LOCALES.includes(localeParam as Locale)
    ? localeParam
    : DEFAULT_LOCALE) as Locale;

  const dict: Record<string, string> = {};
  for (const key of ALL_KEYS) {
    dict[key] = t(key as any, locale);
  }

  return new NextResponse(JSON.stringify({ locale, translations: dict }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
