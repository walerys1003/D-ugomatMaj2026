/**
 * GET /api/cee/case-types?locale=cs — lista case_types dla CEE locale.
 */
import { NextResponse } from "next/server";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { listCaseTypesForLocale } from "@/lib/cee/registry";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale") ?? DEFAULT_LOCALE;
  const locale = (SUPPORTED_LOCALES.includes(localeParam as Locale)
    ? localeParam
    : DEFAULT_LOCALE) as Locale;
  const items = listCaseTypesForLocale(locale);
  return NextResponse.json({ locale, items });
}
