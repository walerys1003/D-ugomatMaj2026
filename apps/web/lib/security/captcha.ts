import "server-only";

/**
 * Tier 6 zad. 281 — CAPTCHA verification (Cloudflare Turnstile / hCaptcha).
 *
 * Obsługa providerów:
 *   - Cloudflare Turnstile (preferowany — friction-less, free, EU-friendly)
 *   - hCaptcha (fallback, jeśli Turnstile niedostępne)
 *
 * Konfiguracja:
 *   - TURNSTILE_SECRET_KEY — server-side secret
 *   - NEXT_PUBLIC_TURNSTILE_SITE_KEY — client widget key (public)
 *   - HCAPTCHA_SECRET_KEY (fallback)
 *
 * Użycie:
 *   - /api/auth/signup: wymaga CAPTCHA po 3 nieudanych próbach z tego IP
 *   - /api/contact: wymaga zawsze
 *   - /api/ai/generate: tylko anon → soft-fail (challenge gdy bot-score wysokie)
 */
import { logger } from "@/lib/observability/logger";

export type CaptchaProvider = "turnstile" | "hcaptcha" | "none";

export interface CaptchaResult {
  success: boolean;
  provider: CaptchaProvider;
  score?: number;
  reason?: string;
  hostname?: string;
}

export function detectProvider(): CaptchaProvider {
  if (process.env.TURNSTILE_SECRET_KEY) return "turnstile";
  if (process.env.HCAPTCHA_SECRET_KEY) return "hcaptcha";
  return "none";
}

export function isCaptchaConfigured(): boolean {
  return detectProvider() !== "none";
}

const TURNSTILE_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const HCAPTCHA_URL = "https://hcaptcha.com/siteverify";

/**
 * Verify token against provider. Returns success=true if token is valid AND
 * (for Turnstile) action matches expected action.
 */
export async function verifyCaptcha(
  token: string,
  expectedAction?: string,
  remoteIp?: string,
): Promise<CaptchaResult> {
  const provider = detectProvider();
  if (provider === "none") {
    return { success: true, provider: "none", reason: "not_configured" };
  }

  if (!token || token.length < 10 || token.length > 4096) {
    return { success: false, provider, reason: "invalid_token_format" };
  }

  const body = new URLSearchParams();
  if (provider === "turnstile") {
    body.set("secret", process.env.TURNSTILE_SECRET_KEY!);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);
  } else {
    body.set("secret", process.env.HCAPTCHA_SECRET_KEY!);
    body.set("response", token);
    if (remoteIp) body.set("remoteip", remoteIp);
  }

  const url = provider === "turnstile" ? TURNSTILE_URL : HCAPTCHA_URL;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: body.toString(),
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    const json = (await resp.json()) as {
      success?: boolean;
      action?: string;
      hostname?: string;
      score?: number;
      "error-codes"?: string[];
    };

    if (!json.success) {
      logger.info("captcha.verify_failed", {
        provider,
        errors: json["error-codes"]?.slice(0, 5),
      });
      return {
        success: false,
        provider,
        reason: (json["error-codes"] ?? []).join(",") || "verify_failed",
      };
    }

    if (expectedAction && json.action && json.action !== expectedAction) {
      return {
        success: false,
        provider,
        reason: `action_mismatch:${json.action}`,
        score: json.score,
        hostname: json.hostname,
      };
    }

    return {
      success: true,
      provider,
      score: json.score,
      hostname: json.hostname,
    };
  } catch (err) {
    clearTimeout(timer);
    logger.warn("captcha.network_error", {
      provider,
      error: err instanceof Error ? err.message : String(err),
    });
    // Fail-open w awarii (lepsze UX niż fałszywe blokady).
    // Zamiana na fail-close: zmień return success=false.
    return {
      success: true,
      provider,
      reason: "network_error_fail_open",
    };
  }
}

/**
 * Tier 6 zad. 282 — Bot heuristics. Łączymy:
 *   - User-Agent allow-list known bots vs. unknown patterns
 *   - Headless browser markers (window.callPhantom, navigator.webdriver)
 *     ← te wykrywamy client-side; server widzi tylko UA
 *   - Sec-Ch-Ua, Accept-Language obecność
 *   - Rate of requests (token bucket → osobno)
 */
export interface BotScore {
  score: number; // 0..1 (0 = na pewno człowiek, 1 = na pewno bot)
  signals: string[];
}

const KNOWN_BOT_UA = [
  /bot/i,
  /spider/i,
  /crawler/i,
  /scrape/i,
  /headlesschrome/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /wget/i,
  /curl/i,
  /python-requests/i,
  /go-http-client/i,
  /okhttp/i,
];

const FRIENDLY_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /duckduckbot/i,
  /yandex/i,
  /baiduspider/i,
  /facebookexternalhit/i,
  /linkedinbot/i,
  /twitterbot/i,
  /slackbot/i,
];

export function scoreBot(headers: Headers): BotScore {
  const ua = headers.get("user-agent") ?? "";
  const acceptLang = headers.get("accept-language") ?? "";
  const accept = headers.get("accept") ?? "";
  const secChUa = headers.get("sec-ch-ua") ?? "";
  const signals: string[] = [];
  let score = 0;

  if (!ua) {
    signals.push("no_ua");
    score += 0.5;
  }
  if (ua.length < 30) {
    signals.push("ua_too_short");
    score += 0.2;
  }
  if (KNOWN_BOT_UA.some((rx) => rx.test(ua))) {
    if (FRIENDLY_BOTS.some((rx) => rx.test(ua))) {
      // SEO bot — pass through, ale flag
      signals.push("seo_bot");
      score += 0.0;
    } else {
      signals.push("bot_ua");
      score += 0.7;
    }
  }
  if (!acceptLang) {
    signals.push("no_accept_language");
    score += 0.15;
  }
  if (!accept || accept === "*/*") {
    signals.push("generic_accept");
    score += 0.1;
  }
  if (!secChUa && /chrome|edg/i.test(ua)) {
    // Chrome/Edge zazwyczaj wysyłają sec-ch-ua → brak = headless
    signals.push("missing_sec_ch_ua");
    score += 0.2;
  }

  return { score: Math.min(1, score), signals };
}
