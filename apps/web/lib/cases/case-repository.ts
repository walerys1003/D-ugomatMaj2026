/**
 * Case repository — server-only data access for `cases`, `documents`, `deadlines`.
 *
 * RLS jest włączone i wymuszone (FORCE), więc każde wywołanie z poziomu
 * cookie-aware Supabase clienta automatycznie filtruje po user_id = auth.uid().
 * Funkcje server-only nigdy nie używają service-role chyba że pomocnicze
 * (oznaczone `Admin*`).
 */
import "server-only";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import type {
  CaseInsert,
  CaseRow,
  CaseStatus,
  CaseType,
  DeadlineKind,
  DeadlineRow,
  WizardState,
} from "@/lib/db/types";
import { caseTypeMeta } from "./case-types";

// -----------------------------------------------------------------------------
// READ
// -----------------------------------------------------------------------------
export async function listCasesForCurrentUser(): Promise<CaseRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list cases: ${error.message}`);
  }
  return (data ?? []) as CaseRow[];
}

export async function getCaseById(id: string): Promise<CaseRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw new Error(`Failed to load case: ${error.message}`);
  }
  return (data as CaseRow) ?? null;
}

export async function listDeadlinesForCurrentUser(): Promise<DeadlineRow[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("deadlines")
    .select("*")
    .eq("is_completed", false)
    .order("deadline_date", { ascending: true });

  if (error) {
    throw new Error(`Failed to list deadlines: ${error.message}`);
  }
  return (data ?? []) as DeadlineRow[];
}

// -----------------------------------------------------------------------------
// WRITE — cases
// -----------------------------------------------------------------------------
export interface CreateCaseInput {
  type: CaseType;
  title?: string;
  initialMetadata?: Record<string, unknown>;
}

export async function createCase(input: CreateCaseInput): Promise<CaseRow> {
  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Not authenticated");
  }

  const initialWizardState: WizardState = {
    current_step: "start",
    completed_steps: [],
    answers: {},
    last_saved_at: null,
  };

  const insert: CaseInsert = {
    user_id: userResult.user.id,
    type: input.type,
    title: input.title ?? caseTypeMeta[input.type].title,
    metadata: (input.initialMetadata ?? {}) as CaseInsert["metadata"],
    wizard_state: initialWizardState,
    status: "draft",
  };

  const { data, error } = await supabase
    .from("cases")
    .insert(insert)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create case: ${error?.message ?? "unknown"}`);
  }
  return data as CaseRow;
}

export interface PatchCaseInput {
  id: string;
  status?: CaseStatus;
  title?: string;
  metadata?: Record<string, unknown>;
  wizardState?: WizardState;
}

export async function patchCase(input: PatchCaseInput): Promise<CaseRow> {
  const supabase = createSupabaseServerClient();
  const update: Partial<CaseInsert> = {};
  if (input.status !== undefined)       update.status       = input.status;
  if (input.title !== undefined)        update.title        = input.title;
  if (input.metadata !== undefined)     update.metadata     = input.metadata as CaseInsert["metadata"];
  if (input.wizardState !== undefined)  update.wizard_state = input.wizardState;

  const { data, error } = await supabase
    .from("cases")
    .update(update)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to update case: ${error?.message ?? "unknown"}`);
  }
  return data as CaseRow;
}

export async function softDeleteCase(id: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("cases")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(`Failed to delete case: ${error.message}`);
}

// -----------------------------------------------------------------------------
// WRITE — deadlines
// -----------------------------------------------------------------------------
export interface CreateDeadlineInput {
  caseId: string;
  kind: DeadlineKind;
  description: string;
  startDate: Date;
  days: number;
}

/**
 * Tworzy termin liczony od `startDate` + `days`.
 * Konwencja: deadline_date = startDate + (days - 1)? — używamy spec konwencji
 * "od dnia doręczenia w terminie X dni", czyli ostatni dzień to startDate + days.
 *
 * RLS pozwala tylko właścicielowi sprawy (przez join z cases.user_id).
 */
export async function createDeadline(input: CreateDeadlineInput): Promise<DeadlineRow> {
  const supabase = createSupabaseServerClient();
  const { data: userResult, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userResult.user) {
    throw new Error("Not authenticated");
  }

  const start = new Date(input.startDate);
  const deadline = new Date(start);
  deadline.setDate(deadline.getDate() + input.days);

  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("deadlines")
    .insert({
      case_id: input.caseId,
      user_id: userResult.user.id,
      kind: input.kind,
      description: input.description,
      start_date: fmt(start),
      deadline_date: fmt(deadline),
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(`Failed to create deadline: ${error?.message ?? "unknown"}`);
  }
  return data as DeadlineRow;
}

export async function markDeadlineCompleted(deadlineId: string): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("deadlines")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", deadlineId);
  if (error) throw new Error(`Failed to complete deadline: ${error.message}`);
}

// -----------------------------------------------------------------------------
// Audit log helpers
// -----------------------------------------------------------------------------
export async function logCaseEvent(
  caseId: string,
  eventType: string,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  const supabase = createSupabaseServerClient();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) return;

  await supabase.from("case_events").insert({
    case_id: caseId,
    user_id: userResult.user.id,
    event_type: eventType,
    actor: "user",
    metadata: metadata as never,
  });
}
