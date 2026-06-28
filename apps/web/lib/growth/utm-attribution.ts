/**
 * Długomat — Tier 8 — UTM attribution + first-touch / last-touch tracking.
 *
 * Cookie-based attribution:
 *  - `dlk_utm_first` (TTL 90d) — first-touch (kanonical Markowski)
 *  - `dlk_utm_last`  (TTL 90d) — last-touch (przed konwersją)
 *
 * Konwencja: oba cookie zawierają JSON z polami utm_source/utm_medium/
 * utm_campaign/utm_term/utm_content + landed_at (ISO).
 */

export interface UtmAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  landed_at: string;
  /** Slug affiliate (z ?ref=). */
  affiliate_slug: string | null;
  /** Kod referral (z ?r=). */
  referral_code: string | null;
}

export const UTM_FIRST_COOKIE = "dlk_utm_first";
export const UTM_LAST_COOKIE = "dlk_utm_last";
export const UTM_COOKIE_TTL_DAYS = 90;

export function parseUtmFromQuery(query: URLSearchParams): UtmAttribution {
  return {
    utm_source: query.get("utm_source"),
    utm_medium: query.get("utm_medium"),
    utm_campaign: query.get("utm_campaign"),
    utm_term: query.get("utm_term"),
    utm_content: query.get("utm_content"),
    landed_at: new Date().toISOString(),
    affiliate_slug: query.get("ref"),
    referral_code: query.get("r"),
  };
}

export function hasAnyUtm(attr: UtmAttribution): boolean {
  return (
    !!attr.utm_source ||
    !!attr.utm_medium ||
    !!attr.utm_campaign ||
    !!attr.affiliate_slug ||
    !!attr.referral_code
  );
}

/**
 * Bezpiecznie serializuje attribution do cookie value (JSON + base64url).
 */
export function serializeAttribution(attr: UtmAttribution): string {
  return Buffer.from(JSON.stringify(attr)).toString("base64url");
}

export function deserializeAttribution(value: string): UtmAttribution | null {
  try {
    const json = Buffer.from(value, "base64url").toString("utf-8");
    return JSON.parse(json) as UtmAttribution;
  } catch {
    return null;
  }
}
