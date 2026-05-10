/**
 * POST /api/notifications/dispatch — zadanie 86.
 *
 * Endpoint wewnętrzny używany przez:
 *   - Supabase Edge Function `deadline-cron` (per godzina)
 *   - Stripe webhook (po `payment_completed`)
 *   - RODO actions (po wygenerowaniu eksportu / usunięciu konta)
 *   - server actions (po wygenerowaniu pisma — `case_generated`)
 *
 * Auth — dwa modele:
 *   1) X-Cron-Secret header z wartością `CRON_SECRET` (CRON / webhooki)
 *   2) Zalogowany user — pozwalamy tylko na dispatch dla user_id == auth.uid()
 *      (tylko self-service, np. testowe wysyłanie własnych powiadomień).
 *
 * Body (JSON):
 *   {
 *     channel: 'email' | 'sms',
 *     template: <EmailTemplateKey | SmsTemplateKey>,
 *     recipient: string,
 *     userId: string,             // tylko dla CRON / webhook (z secret)
 *     caseId?: string,
 *     deadlineId?: string,
 *     variables: Record<string, string|number>,
 *     dedupKey?: string,
 *     scheduledFor?: ISO string
 *   }
 *
 * Response:
 *   200: { notificationId, status, providerMessageId, providerError }
 */
import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
} from "@/lib/security/rate-limit";
import { dispatchNotification } from "@/lib/notifications";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const EMAIL_TEMPLATES = [
  "deadline_d7_warning",
  "deadline_d3_warning",
  "deadline_d1_warning",
  "deadline_d0_morning",
  "case_generated",
  "payment_completed",
  "payment_failed",
  "rodo_export_ready",
  "rodo_account_deleted",
  "welcome",
  "onboarding_day1",
  "onboarding_day3",
  "onboarding_day7",
  "onboarding_day14",
  "onboarding_day30",
] as const;

const SMS_TEMPLATES = [
  "deadline_d3_warning",
  "deadline_d1_warning",
  "deadline_d0_morning",
] as const;

const bodySchema = z
  .object({
    channel: z.enum(["email", "sms"]),
    template: z.string().min(2).max(64),
    recipient: z.string().min(3).max(200),
    userId: z.string().uuid(),
    caseId: z.string().uuid().optional(),
    deadlineId: z.string().uuid().optional(),
    variables: z.record(z.union([z.string(), z.number()])).default({}),
    dedupKey: z.string().min(3).max(120).optional(),
    scheduledFor: z.string().datetime().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.channel === "email" && !EMAIL_TEMPLATES.includes(val.template as never)) {
      ctx.addIssue({
        code: "custom",
        path: ["template"],
        message: `Nieznany email template: ${val.template}`,
      });
    }
    if (val.channel === "sms" && !SMS_TEMPLATES.includes(val.template as never)) {
      ctx.addIssue({
        code: "custom",
        path: ["template"],
        message: `Nieznany SMS template: ${val.template}`,
      });
    }
  });

export async function POST(req: NextRequest): Promise<NextResponse> {
  // ---------------------------------------------------------------------
  // 1) Rate-limit per IP (anty-flood, niezależnie od auth-mode)
  // ---------------------------------------------------------------------
  const ip = clientIdFromHeaders(req.headers);
  const ipRl = rateLimit(`api:notif:dispatch:ip:${ip}`, RATE_LIMIT_PROFILES.webhook);
  if (!ipRl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_ip" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(ipRl.resetMs / 1000)) } },
    );
  }

  // ---------------------------------------------------------------------
  // 2) Auth — secret OR session
  // ---------------------------------------------------------------------
  const cronSecret = process.env.CRON_SECRET;
  const provided = req.headers.get("x-cron-secret");
  let isCron = false;
  let sessionUserId: string | null = null;

  if (cronSecret && provided && timingSafeEqual(provided, cronSecret)) {
    isCron = true;
  } else {
    const supabase = createSupabaseServerClient();
    const { data: u, error: authErr } = await supabase.auth.getUser();
    if (authErr || !u.user) {
      return NextResponse.json(
        { error: "unauthenticated", hint: "Wymagana sesja albo X-Cron-Secret." },
        { status: 401 },
      );
    }
    sessionUserId = u.user.id;
  }

  // ---------------------------------------------------------------------
  // 3) Parse + validate body
  // ---------------------------------------------------------------------
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation_error", issues: parsed.error.issues },
      { status: 400 },
    );
  }
  const body = parsed.data;

  // Self-service guard — bez secret userId musi pasować do session.
  if (!isCron && sessionUserId && body.userId !== sessionUserId) {
    return NextResponse.json(
      { error: "forbidden", message: "Możesz wysyłać tylko do własnego konta." },
      { status: 403 },
    );
  }

  // Per-user/IP rate limit
  const subject = isCron ? `cron:${ip}` : `user:${sessionUserId}`;
  const subjRl = rateLimit(`api:notif:dispatch:${subject}`, RATE_LIMIT_PROFILES.api);
  if (!subjRl.allowed) {
    return NextResponse.json(
      { error: "rate_limit_exceeded" },
      { status: 429, headers: { "Retry-After": String(Math.ceil(subjRl.resetMs / 1000)) } },
    );
  }

  // ---------------------------------------------------------------------
  // 4) Dispatch
  // ---------------------------------------------------------------------
  try {
    const result = await dispatchNotification(
      {
        channel: body.channel,
        template: body.template as never,
        recipient: body.recipient,
        userId: body.userId,
        caseId: body.caseId ?? null,
        deadlineId: body.deadlineId ?? null,
        variables: body.variables,
        scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : null,
      },
      { dedupKey: body.dedupKey },
    );

    return NextResponse.json(
      {
        notification_id: result.notificationId,
        status: result.status,
        provider_message_id: result.providerMessageId,
        provider_error: result.providerError,
      },
      {
        status: result.status === "failed" ? 502 : 200,
        headers: { "cache-control": "no-store" },
      },
    );
  } catch (e) {
    return NextResponse.json(
      {
        error: "internal",
        message: e instanceof Error ? e.message : String(e),
      },
      { status: 500 },
    );
  }
}

// Constant-time string compare — chroni przed timing attack na CRON_SECRET.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}
