/**
 * GET /api/i18n/manifest?locale=pl — zwraca PWA manifest dla danego locale.
 * Alternatywnie /manifest.webmanifest renderowane przez ten endpoint.
 */
import { NextResponse } from "next/server";
import { buildManifest } from "@/lib/pwa/manifest";
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const localeParam = url.searchParams.get("locale") ?? DEFAULT_LOCALE;
  const locale = (SUPPORTED_LOCALES.includes(localeParam as Locale)
    ? localeParam
    : DEFAULT_LOCALE) as Locale;
  const manifest = buildManifest(locale);
  return new NextResponse(JSON.stringify(manifest, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
