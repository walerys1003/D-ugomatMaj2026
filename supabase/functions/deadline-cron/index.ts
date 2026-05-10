/**
 * Supabase Edge Function — deadline-cron.
 *
 * Uruchamiana co godzinę przez Supabase Cron (pg_cron + pg_net) z ustawieniem:
 *
 *   select cron.schedule(
 *     'deadline-cron-hourly',
 *     '0 * * * *',
 *     $$
 *       select net.http_post(
 *         url := 'https://<project-ref>.functions.supabase.co/deadline-cron',
 *         headers := jsonb_build_object(
 *           'Content-Type', 'application/json',
 *           'Authorization', 'Bearer ' || current_setting('app.cron_secret')
 *         )
 *       ) as request_id;
 *     $$
 *   );
 *
 * Co robi:
 *   1. Pobiera wszystkie deadline'y `is_completed=false AND deadline_date >= today`.
 *   2. Dla każdego liczy `daysLeft` (UTC) i decyduje, które okno (D7/D3/D1/D0)
 *      powinno zostać wysłane TERAZ (na podstawie aktualnej godziny UTC).
 *   3. Skipuje deadline'y, dla których odpowiednia kolumna `notif_*_sent = true`.
 *   4. Pobiera dane usera (email, phone, marketing_opt_in) z `profiles`.
 *   5. POST na `/api/notifications/dispatch` (web app) z headerem `X-Cron-Secret`.
 *   6. Po sukcesie ustawia odpowiednie `notif_*_sent = true` w deadlines.
 *
 * Bezpieczeństwo:
 *   - Funkcja używa `SUPABASE_SERVICE_ROLE_KEY` do odczytu deadlines/profiles
 *     (bypass RLS). NIGDY nie przekazujemy klucza dalej.
 *   - Komunikacja z web app: `CRON_SECRET` (ten sam, co web app sprawdza
 *     w `X-Cron-Secret` headerze).
 *
 * Wymagane sekrety (Supabase Functions secrets):
 *   - SUPABASE_URL                — auto-provided by platform
 *   - SUPABASE_SERVICE_ROLE_KEY   — auto-provided by platform
 *   - WEB_APP_URL                 — np. https://dlugomat.pl
 *   - CRON_SECRET                 — bearer token shared with web app
 *
 * Uruchomienie ręczne (test):
 *   curl -X POST https://<project>.functions.supabase.co/deadline-cron \
 *     -H "Authorization: Bearer <CRON_SECRET>"
 */

// Deno runtime — używamy std lib przez import URL.
// @ts-expect-error: Deno-specific import resolved at runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

// -----------------------------------------------------------------------------
// Types (mirror lib/notifications + lib/db/types)
// -----------------------------------------------------------------------------
type DeadlineKind =
  | "sprzeciw_14dni"
  | "skarga_komornicza_7dni"
  | "skarga_uodo_30dni"
  | "reklamacja_30dni"
  | "odpowiedz_cesja_14dni"
  | "wniosek_raty"
  | "wniosek_upadlosc"
  | "custom";

type DeadlineWindow = "d7" | "d3" | "d1" | "d0_morning";

interface DeadlineRow {
  id: string;
  case_id: string;
  user_id: string;
  kind: DeadlineKind;
  description: string;
  start_date: string;
  deadline_date: string;
  notif_d7_sent: boolean;
  notif_d3_sent: boolean;
  notif_d1_sent: boolean;
  notif_d0_morning_sent: boolean;
  is_completed: boolean;
  cases?: { title: string; user_id: string } | null;
}

interface ProfileRow {
  id: string;
  email: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
}

// -----------------------------------------------------------------------------
// Helpers (mirror lib/notifications/deadline-windows.ts)
// -----------------------------------------------------------------------------
const KIND_LABEL: Record<DeadlineKind, string> = {
  sprzeciw_14dni: "termin na sprzeciw od nakazu zapłaty (14 dni)",
  skarga_komornicza_7dni: "termin na skargę na czynności komornika (7 dni)",
  skarga_uodo_30dni: "termin na skargę do UODO (30 dni)",
  reklamacja_30dni: "termin reklamacji (30 dni)",
  odpowiedz_cesja_14dni: "termin na odpowiedź na wezwanie funduszu (14 dni)",
  wniosek_raty: "termin na wniosek o raty",
  wniosek_upadlosc: "termin na wniosek o upadłość",
  custom: "termin procesowy",
};

function daysUntilUtc(deadlineYmd: string, now: Date): number {
  const deadline = new Date(`${deadlineYmd}T00:00:00Z`);
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  return Math.round((deadline.getTime() - today.getTime()) / 86_400_000);
}

function windowToSend(daysLeft: number, hourUtc: number): DeadlineWindow | null {
  if (daysLeft === 0 && hourUtc >= 5 && hourUtc < 10) return "d0_morning";
  if (daysLeft === 1) return "d1";
  if (daysLeft === 3) return "d3";
  if (daysLeft === 7) return "d7";
  return null;
}

function windowFlagSet(d: DeadlineRow, w: DeadlineWindow): boolean {
  switch (w) {
    case "d7": return d.notif_d7_sent;
    case "d3": return d.notif_d3_sent;
    case "d1": return d.notif_d1_sent;
    case "d0_morning": return d.notif_d0_morning_sent;
  }
}

function windowFlagColumn(w: DeadlineWindow): string {
  switch (w) {
    case "d7": return "notif_d7_sent";
    case "d3": return "notif_d3_sent";
    case "d1": return "notif_d1_sent";
    case "d0_morning": return "notif_d0_morning_sent";
  }
}

const EMAIL_TEMPLATE_FOR_WINDOW: Record<DeadlineWindow, string> = {
  d7: "deadline_d7_warning",
  d3: "deadline_d3_warning",
  d1: "deadline_d1_warning",
  d0_morning: "deadline_d0_morning",
};

const SMS_TEMPLATE_FOR_WINDOW: Partial<Record<DeadlineWindow, string>> = {
  d3: "deadline_d3_warning",
  d1: "deadline_d1_warning",
  d0_morning: "deadline_d0_morning",
};

// -----------------------------------------------------------------------------
// Auth: weryfikacja `Authorization: Bearer <CRON_SECRET>`
// -----------------------------------------------------------------------------
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

// -----------------------------------------------------------------------------
// Main handler
// -----------------------------------------------------------------------------
// @ts-expect-error: Deno global
Deno.serve(async (req: Request) => {
  // 1) Auth
  // @ts-expect-error: Deno global
  const cronSecret = Deno.env.get("CRON_SECRET") ?? "";
  if (!cronSecret) {
    return jsonResponse({ error: "CRON_SECRET not configured" }, 500);
  }
  const authHeader = req.headers.get("authorization") ?? "";
  const provided = authHeader.replace(/^Bearer\s+/i, "");
  if (!provided || !timingSafeEqual(provided, cronSecret)) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  // 2) Setup Supabase admin client
  // @ts-expect-error: Deno global
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  // @ts-expect-error: Deno global
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  // @ts-expect-error: Deno global
  const webAppUrl = (Deno.env.get("WEB_APP_URL") ?? "https://dlugomat.pl").replace(/\/+$/, "");

  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Supabase env not configured" }, 500);
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const now = new Date();
  const hourUtc = now.getUTCHours();

  // 3) Pobierz aktywne deadline'y (zakres: do +8 dni — D7 to maksimum)
  const todayYmd = now.toISOString().slice(0, 10);
  const maxDate = new Date(now.getTime() + 8 * 86_400_000).toISOString().slice(0, 10);

  const { data: deadlines, error: dErr } = await supabase
    .from("deadlines")
    .select(
      "id, case_id, user_id, kind, description, start_date, deadline_date, notif_d7_sent, notif_d3_sent, notif_d1_sent, notif_d0_morning_sent, is_completed, cases:case_id(title, user_id)",
    )
    .eq("is_completed", false)
    .gte("deadline_date", todayYmd)
    .lte("deadline_date", maxDate)
    .limit(1000);

  if (dErr) {
    return jsonResponse({ error: "deadlines_query_failed", message: dErr.message }, 500);
  }

  const deadlineList = (deadlines ?? []) as DeadlineRow[];
  if (deadlineList.length === 0) {
    return jsonResponse({ ok: true, scanned: 0, sent: 0, skipped: 0, errors: [] });
  }

  // 4) Pobierz unikalnych user_id → profiles (jednym query)
  const userIds = Array.from(new Set(deadlineList.map((d) => d.user_id)));
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, phone, marketing_opt_in")
    .in("id", userIds);

  if (pErr) {
    return jsonResponse({ error: "profiles_query_failed", message: pErr.message }, 500);
  }
  const profileMap = new Map<string, ProfileRow>(
    (profiles ?? []).map((p: ProfileRow) => [p.id, p]),
  );

  // 5) Iteruj — dla każdego deadline'a wybierz okno + wyślij
  const results: Array<{ id: string; window: string; result: string; error?: string }> = [];
  let sentCount = 0;
  let skippedCount = 0;

  for (const d of deadlineList) {
    const daysLeft = daysUntilUtc(d.deadline_date, now);
    const window = windowToSend(daysLeft, hourUtc);
    if (!window) {
      skippedCount += 1;
      continue;
    }
    if (windowFlagSet(d, window)) {
      skippedCount += 1;
      continue;
    }

    const profile = profileMap.get(d.user_id);
    if (!profile) {
      results.push({ id: d.id, window, result: "skipped_no_profile" });
      skippedCount += 1;
      continue;
    }

    const caseTitle = d.cases?.title ?? "Twoja sprawa";
    const sharedVars: Record<string, string | number> = {
      deadline_date: d.deadline_date,
      case_title: caseTitle,
      case_id: d.case_id,
      kind_label: KIND_LABEL[d.kind] ?? "termin procesowy",
    };

    // Email — zawsze, jeśli email + okno przewiduje email
    if (profile.email) {
      const tpl = EMAIL_TEMPLATE_FOR_WINDOW[window];
      const r = await postDispatch(webAppUrl, cronSecret, {
        channel: "email",
        template: tpl,
        recipient: profile.email,
        userId: d.user_id,
        caseId: d.case_id,
        deadlineId: d.id,
        variables: sharedVars,
        dedupKey: `deadline:${d.id}:${window}:email`,
      });
      if (r.ok) sentCount += 1;
      results.push({ id: d.id, window, result: r.ok ? "sent_email" : "failed_email", error: r.error });
    }

    // SMS — tylko D3/D1/D0, tylko gdy phone + opt-in
    const smsTpl = SMS_TEMPLATE_FOR_WINDOW[window];
    if (smsTpl && profile.phone && profile.marketing_opt_in) {
      const r = await postDispatch(webAppUrl, cronSecret, {
        channel: "sms",
        template: smsTpl,
        recipient: profile.phone,
        userId: d.user_id,
        caseId: d.case_id,
        deadlineId: d.id,
        variables: sharedVars,
        dedupKey: `deadline:${d.id}:${window}:sms`,
      });
      if (r.ok) sentCount += 1;
      results.push({ id: d.id, window, result: r.ok ? "sent_sms" : "failed_sms", error: r.error });
    }

    // Mark window jako wysłane (set raz, niezależnie od email/sms — kolumna boolean)
    const flagCol = windowFlagColumn(window);
    await supabase
      .from("deadlines")
      .update({ [flagCol]: true })
      .eq("id", d.id);
  }

  return jsonResponse({
    ok: true,
    scanned: deadlineList.length,
    sent: sentCount,
    skipped: skippedCount,
    hour_utc: hourUtc,
    results: results.slice(0, 100), // safety cap dla logów
  });
});

// -----------------------------------------------------------------------------
// HTTP helpers
// -----------------------------------------------------------------------------
interface DispatchPayload {
  channel: "email" | "sms";
  template: string;
  recipient: string;
  userId: string;
  caseId: string;
  deadlineId: string;
  variables: Record<string, string | number>;
  dedupKey: string;
}

async function postDispatch(
  webAppUrl: string,
  cronSecret: string,
  payload: DispatchPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const resp = await fetch(`${webAppUrl}/api/notifications/dispatch`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-cron-secret": cronSecret,
      },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      return { ok: false, error: `HTTP ${resp.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
    },
  });
}
