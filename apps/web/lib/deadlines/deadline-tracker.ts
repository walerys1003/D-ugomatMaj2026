/**
 * Tier 18 — Deadline tracker: persistence + reminder dispatcher hookup.
 *
 * Warstwa nad `deadline-engine.ts` — zapisuje terminy w DB, generuje
 * okna powiadomień (D7/D3/D1/D0) i wystawia je do kolejki `notifications`.
 *
 * Powiązania:
 *  - notifications/dispatch.ts — fan-out do email/SMS/push/whatsapp
 *  - cases/case-repository.ts — terminy są powiązane z case_id
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { computeDeadline, daysRemaining, urgencyLevel } from "./deadline-engine";
import type { DeadlineKind } from "./deadline-engine";

export interface DeadlineRecord {
  id: string;
  user_id: string;
  case_id: string | null;
  kind: DeadlineKind;
  title: string;
  start_date: string;
  end_date: string;
  effective_end_date: string;
  legal_basis: string | null;
  snoozed_until: string | null;
  completed_at: string | null;
  reminders_sent: string[]; // ["d7","d3","d1","d0"]
  created_at: string;
}

export interface CreateDeadlineInput {
  userId: string;
  caseId?: string | null;
  kind: DeadlineKind;
  title: string;
  startDate: Date | string;
  daysOverride?: number;
  modeOverride?: "calendar" | "business";
}

export async function createDeadline(input: CreateDeadlineInput): Promise<DeadlineRecord> {
  const sb = await createSupabaseServerClient();
  const computed = computeDeadline({
    kind: input.kind,
    startDate: input.startDate,
    daysOverride: input.daysOverride,
    modeOverride: input.modeOverride,
  });

  const row = {
    user_id: input.userId,
    case_id: input.caseId ?? null,
    kind: input.kind,
    title: input.title,
    start_date: computed.startDate.toISOString(),
    end_date: computed.rawEndDate.toISOString(),
    effective_end_date: computed.effectiveEndDate.toISOString(),
    legal_basis: computed.rule.legalBasis,
    snoozed_until: null,
    completed_at: null,
    reminders_sent: [] as string[],
  };

  const { data, error } = await sb
    .from("deadlines")
    .insert(row)
    .select("*")
    .single();
  if (error) throw error;
  return data as DeadlineRecord;
}

export async function listUserDeadlines(userId: string): Promise<DeadlineRecord[]> {
  const sb = await createSupabaseServerClient();
  const { data, error } = await sb
    .from("deadlines")
    .select("*")
    .eq("user_id", userId)
    .is("completed_at", null)
    .order("effective_end_date", { ascending: true });
  if (error) throw error;
  return (data ?? []) as DeadlineRecord[];
}

export async function snoozeDeadline(
  id: string,
  userId: string,
  until: Date,
): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("deadlines")
    .update({ snoozed_until: until.toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function completeDeadline(id: string, userId: string): Promise<void> {
  const sb = await createSupabaseServerClient();
  const { error } = await sb
    .from("deadlines")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);
  if (error) throw error;
}

/**
 * Skanuje wszystkie aktywne terminy i zwraca te, dla których okno D7/D3/D1/D0
 * przekroczyło "teraz" i nie zostało jeszcze wysłane.
 * Cron job (np. co 15 min) wywołuje fanoutDueReminders().
 */
export interface DueReminder {
  deadline: DeadlineRecord;
  window: "d7" | "d3" | "d1" | "d0";
  daysLeft: number;
  urgency: ReturnType<typeof urgencyLevel>;
}

export async function findDueReminders(now: Date = new Date()): Promise<DueReminder[]> {
  const sb = await createSupabaseServerClient();
  const horizon = new Date(now);
  horizon.setUTCDate(horizon.getUTCDate() + 8);
  const { data, error } = await sb
    .from("deadlines")
    .select("*")
    .is("completed_at", null)
    .lte("effective_end_date", horizon.toISOString());
  if (error) throw error;

  const due: DueReminder[] = [];
  for (const row of (data ?? []) as DeadlineRecord[]) {
    if (row.snoozed_until && new Date(row.snoozed_until) > now) continue;
    const eff = new Date(row.effective_end_date);
    const daysLeft = daysRemaining(eff, now);
    const sent = new Set(row.reminders_sent ?? []);
    const windowsToFire: DueReminder["window"][] = [];
    if (daysLeft <= 7 && !sent.has("d7")) windowsToFire.push("d7");
    if (daysLeft <= 3 && !sent.has("d3")) windowsToFire.push("d3");
    if (daysLeft <= 1 && !sent.has("d1")) windowsToFire.push("d1");
    if (daysLeft <= 0 && !sent.has("d0")) windowsToFire.push("d0");

    // Najbardziej naglące okno (ostatnie) idzie pierwsze.
    for (const w of windowsToFire) {
      due.push({
        deadline: row,
        window: w,
        daysLeft,
        urgency: urgencyLevel(daysLeft),
      });
    }
  }
  return due;
}

export async function markReminderSent(
  deadlineId: string,
  window: DueReminder["window"],
): Promise<void> {
  const sb = await createSupabaseServerClient();
  // Pobieramy aktualną listę i dopisujemy okno.
  const { data, error } = await sb
    .from("deadlines")
    .select("reminders_sent")
    .eq("id", deadlineId)
    .single();
  if (error) throw error;
  const sent = new Set<string>((data?.reminders_sent as string[]) ?? []);
  sent.add(window);
  const { error: updErr } = await sb
    .from("deadlines")
    .update({ reminders_sent: Array.from(sent) })
    .eq("id", deadlineId);
  if (updErr) throw updErr;
}
