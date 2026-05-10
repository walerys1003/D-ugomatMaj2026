/**
 * Tier 19 — Error classifier + user-facing message mapper.
 *
 * Klasyfikuje błędy (network, auth, validation, server, ai_quota, rate_limit,
 * not_found, permission) i mapuje na przyjazne komunikaty PL/EN dla
 * komponentu ErrorBoundary + toast.
 *
 * Cechy:
 *  - sygnały: HTTP status, kod aplikacyjny, message regex
 *  - decyzja retryable / fatal
 *  - sugestia akcji (retry / login / contact_support / upgrade_plan)
 *  - integracja z observability (recordSecurityEvent / sentry)
 */

export type ErrorClass =
  | "network"
  | "timeout"
  | "auth"
  | "permission"
  | "validation"
  | "not_found"
  | "rate_limit"
  | "ai_quota"
  | "server"
  | "unknown";

export type ErrorAction =
  | "retry"
  | "login"
  | "upgrade_plan"
  | "contact_support"
  | "fix_input"
  | "go_back"
  | "none";

export interface ClassifiedError {
  class: ErrorClass;
  retryable: boolean;
  action: ErrorAction;
  message: { pl: string; en: string };
  cause: string;
  httpStatus?: number;
}

export interface RawErrorInput {
  err: unknown;
  httpStatus?: number;
  appCode?: string;
}

export function classifyError(input: RawErrorInput): ClassifiedError {
  const msg = extractMessage(input.err);
  const status = input.httpStatus ?? statusFromError(input.err);
  const code = input.appCode ?? "";
  const lower = msg.toLowerCase();

  if (code === "ai_quota_exceeded" || /ai_quota|insufficient_credits/.test(lower)) {
    return build("ai_quota", false, "upgrade_plan", {
      pl: "Wyczerpano dzienny limit AI. Zwiększ plan lub poczekaj do jutra.",
      en: "Daily AI quota exceeded. Upgrade your plan or wait until tomorrow.",
    }, "ai_quota", status);
  }

  if (status === 401 || /unauthor|not.*logged/.test(lower)) {
    return build("auth", false, "login", {
      pl: "Sesja wygasła. Zaloguj się ponownie.",
      en: "Your session expired. Please sign in again.",
    }, "unauthorized", status);
  }

  if (status === 403 || /forbidden|permission/.test(lower)) {
    return build("permission", false, "contact_support", {
      pl: "Brak uprawnień do wykonania tej operacji.",
      en: "You do not have permission to perform this action.",
    }, "forbidden", status);
  }

  if (status === 404 || /not.*found/.test(lower)) {
    return build("not_found", false, "go_back", {
      pl: "Nie znaleziono zasobu, którego szukasz.",
      en: "The resource you are looking for was not found.",
    }, "not_found", status);
  }

  if (status === 429 || /rate.?limit|too many requests/.test(lower)) {
    return build("rate_limit", true, "retry", {
      pl: "Za dużo żądań w krótkim czasie. Spróbuj ponownie za chwilę.",
      en: "Too many requests. Please try again in a moment.",
    }, "rate_limit", status);
  }

  if (status === 422 || code === "validation_error" || /validation|invalid.*input/.test(lower)) {
    return build("validation", false, "fix_input", {
      pl: "Dane są nieprawidłowe — popraw zaznaczone pola.",
      en: "The data is invalid — please correct the highlighted fields.",
    }, "validation", status);
  }

  if (/timeout|timed out|abort/.test(lower)) {
    return build("timeout", true, "retry", {
      pl: "Serwer nie odpowiedział w wyznaczonym czasie. Spróbuj ponownie.",
      en: "The server did not respond in time. Please try again.",
    }, "timeout", status);
  }

  if (/network|fetch failed|ECONN|ENOTFOUND|offline/i.test(msg)) {
    return build("network", true, "retry", {
      pl: "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.",
      en: "Could not reach the server. Check your connection and try again.",
    }, "network", status);
  }

  if (status && status >= 500) {
    return build("server", true, "retry", {
      pl: "Wystąpił błąd po stronie serwera. Spróbujemy ponownie.",
      en: "A server-side error occurred. We'll retry shortly.",
    }, "server", status);
  }

  return build("unknown", false, "contact_support", {
    pl: "Coś poszło nie tak. Jeśli problem się powtarza, skontaktuj się z nami.",
    en: "Something went wrong. If the problem persists, please contact support.",
  }, msg || "unknown", status);
}

function build(
  cls: ErrorClass,
  retryable: boolean,
  action: ErrorAction,
  message: { pl: string; en: string },
  cause: string,
  httpStatus?: number,
): ClassifiedError {
  return { class: cls, retryable, action, message, cause, httpStatus };
}

function extractMessage(err: unknown): string {
  if (!err) return "";
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

function statusFromError(err: unknown): number | undefined {
  if (err && typeof err === "object") {
    const e = err as Record<string, unknown>;
    if (typeof e.status === "number") return e.status;
    if (typeof e.statusCode === "number") return e.statusCode;
    const resp = e.response as Record<string, unknown> | undefined;
    if (resp && typeof resp.status === "number") return resp.status;
  }
  return undefined;
}

/**
 * Exponential backoff dla retryable errors.
 * baseMs=400, factor=2, max=10s, jitter ±20%.
 */
export function nextBackoffMs(attempt: number, baseMs = 400, maxMs = 10_000): number {
  const raw = Math.min(maxMs, baseMs * Math.pow(2, attempt));
  const jitter = raw * 0.2 * (Math.random() * 2 - 1);
  return Math.max(100, Math.round(raw + jitter));
}
