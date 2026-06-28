/**
 * POST /api/email/drip — cron endpoint do wysyłki due email steps.
 * Auth: Bearer token CRON_SECRET.
 */
import { NextResponse } from "next/server";
import { getDueEmails, logEmailSent } from "@/lib/email/drip-campaigns";
import { sendTransactional } from "@/lib/email/email-providers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET ?? ""}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const due = await getDueEmails(new Date(), 100);
  const results: Array<{ enrollment_id: string; step_id: string; status: string }> = [];

  for (const email of due) {
    // W produkcji: pobrać email usera z auth.users + render template HTML
    // Tutaj scaffold — wysyłamy uproszczony HTML
    const userEmail = (email.context.email as string) ?? "";
    if (!userEmail) {
      await logEmailSent(email.enrollmentId, email.stepId, "skipped", "no_email");
      results.push({ enrollment_id: email.enrollmentId, step_id: email.stepId, status: "skipped" });
      continue;
    }
    const send = await sendTransactional({
      to: userEmail,
      subject: email.subject,
      html: `<p>${email.subject}</p><p>Template: ${email.templateKey}</p>`,
      tags: { campaign: email.campaignKey, step: email.stepId },
    });
    await logEmailSent(
      email.enrollmentId,
      email.stepId,
      send.ok ? "sent" : "failed",
      send.error ?? send.messageId,
    );
    results.push({
      enrollment_id: email.enrollmentId,
      step_id: email.stepId,
      status: send.ok ? "sent" : "failed",
    });
  }

  return NextResponse.json({ processed: results.length, results });
}
