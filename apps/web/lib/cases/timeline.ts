/**
 * Document/case timeline module — zad. 330
 *
 * Generates a chronological timeline of events for a case:
 * pozew → odpowiedź → rozprawa → wyrok → klauzula → komornik → zażalenie → ...
 *
 * Events come from multiple sources:
 *  - case_events table (manual + system)
 *  - documents table (created_at, type)
 *  - ai_runs (generation events)
 *  - notifications (sent letters)
 *  - deadlines (due / completed)
 */

import { getSupabaseAdmin } from "@/lib/db/supabase-admin";
import { logger } from "@/lib/observability/logger";

export type TimelineEventKind =
  | "case_created"
  | "document_received" // pozew, nakaz, wezwanie
  | "document_generated" // sprzeciw, odpowiedź, wniosek
  | "document_sent" // wysłano (poczta/ePUAP/e-Doręczenia)
  | "deadline_set"
  | "deadline_due"
  | "deadline_missed"
  | "hearing_scheduled" // rozprawa
  | "hearing_held"
  | "ruling_received" // wyrok / postanowienie
  | "appeal_filed" // apelacja / zażalenie
  | "enforcement_started" // klauzula → komornik
  | "settlement_reached"
  | "case_closed"
  | "ai_generation"
  | "user_note";

export type TimelineEventSeverity = "info" | "success" | "warning" | "error" | "critical";

export interface TimelineEvent {
  id: string;
  case_id: string;
  kind: TimelineEventKind;
  occurred_at: string; // ISO
  title: string;
  description?: string;
  severity: TimelineEventSeverity;
  source: "system" | "user" | "ai" | "ocr" | "notification";
  link?: { type: "document" | "deadline" | "ai_run" | "notification"; id: string };
  metadata?: Record<string, unknown>;
}

const KIND_TO_SEVERITY: Record<TimelineEventKind, TimelineEventSeverity> = {
  case_created: "info",
  document_received: "warning",
  document_generated: "info",
  document_sent: "success",
  deadline_set: "info",
  deadline_due: "warning",
  deadline_missed: "critical",
  hearing_scheduled: "warning",
  hearing_held: "info",
  ruling_received: "warning",
  appeal_filed: "info",
  enforcement_started: "error",
  settlement_reached: "success",
  case_closed: "success",
  ai_generation: "info",
  user_note: "info",
};

export interface BuildTimelineOptions {
  case_id: string;
  user_id: string;
  /** include deadlines (default true) */
  include_deadlines?: boolean;
  /** include AI runs (default false — usually too noisy) */
  include_ai_runs?: boolean;
  /** include notifications/letters (default true) */
  include_notifications?: boolean;
  /** sort: "asc" (oldest first) or "desc" (newest first). Default "desc". */
  order?: "asc" | "desc";
}

export async function buildCaseTimeline(opts: BuildTimelineOptions): Promise<TimelineEvent[]> {
  const {
    case_id,
    user_id,
    include_deadlines = true,
    include_ai_runs = false,
    include_notifications = true,
    order = "desc",
  } = opts;

  const supabase = getSupabaseAdmin();
  const events: TimelineEvent[] = [];

  // 1. case row → case_created
  // AUDYT #6 (iter32): wcześniejszy `as any` maskował, że tabela `cases` ma
  // kolumnę `type` (nie `case_type`). Zapytanie o `case_type` padało w runtime
  // → timeline ZAWSZE pusty. Naprawione na realny schemat.
  try {
    const { data: caseRow } = await supabase
      .from("cases")
      .select("id, user_id, type, created_at, updated_at, status, title")
      .eq("id", case_id)
      .eq("user_id", user_id)
      .maybeSingle();

    if (!caseRow) return [];

    events.push({
      id: `case-created-${caseRow.id}`,
      case_id: caseRow.id,
      kind: "case_created",
      occurred_at: caseRow.created_at,
      title: "Sprawa utworzona",
      description: caseRow.title ?? caseRow.type,
      severity: "info",
      source: "user",
      metadata: { case_type: caseRow.type, status: caseRow.status },
    });

    // AUDYT #6 (iter32): CaseStatus nie ma 'closed' — realne stany końcowe to
    // 'completed'/'archived'. `as any` maskował martwe porównanie.
    if (caseRow.status === "completed" || caseRow.status === "archived") {
      events.push({
        id: `case-closed-${caseRow.id}`,
        case_id: caseRow.id,
        kind: "case_closed",
        occurred_at: caseRow.updated_at ?? caseRow.created_at,
        title: "Sprawa zamknięta",
        severity: "success",
        source: "system",
      });
    }
  } catch (err) {
    logger.warn("timeline.case_load_failed", { case_id, error: (err as Error).message });
  }

  // 2. documents → generated
  // AUDYT #6 (iter32): realny schemat `documents` ma `type`/`status`, NIE
  // `kind`/`source`/`sent_at`/`title`. Wcześniejszy `as any` maskował, że te
  // kolumny nie istnieją (zapytanie padało). Dokumenty traktujemy jako
  // wygenerowane; „wysłano” wynika z powiadomień (sekcja 4).
  try {
    const { data: docs } = await supabase
      .from("documents")
      .select("id, case_id, type, status, created_at")
      .eq("case_id", case_id)
      .order("created_at", { ascending: true });

    for (const d of docs ?? []) {
      events.push({
        id: `doc-${d.id}`,
        case_id,
        kind: "document_generated",
        occurred_at: d.created_at,
        title: `Wygenerowano: ${d.type}`,
        description: d.status,
        severity: KIND_TO_SEVERITY["document_generated"],
        source: "ai",
        link: { type: "document", id: d.id },
      });
    }
  } catch (err) {
    logger.warn("timeline.docs_load_failed", { case_id, error: (err as Error).message });
  }

  // 3. deadlines
  if (include_deadlines) {
    try {
      // AUDYT #6 (iter32): realny schemat `deadlines` (Tier18, migracja
      // 20260627030000) ma `effective_end_date`, NIE `due_at`; nie ma kolumny
      // `missed` — „przekroczony” liczymy z daty. `as any` to maskował.
      const { data: deadlines } = await supabase
        .from("deadlines")
        .select("id, case_id, kind, effective_end_date, completed_at, created_at, title")
        .eq("case_id", case_id);
      const now = Date.now();
      for (const dl of deadlines ?? []) {
        const dueAt = dl.effective_end_date;
        events.push({
          id: `dl-set-${dl.id}`,
          case_id,
          kind: "deadline_set",
          occurred_at: dl.created_at,
          title: `Ustawiono termin: ${dl.title ?? dl.kind}`,
          severity: "info",
          source: "system",
          link: { type: "deadline", id: dl.id },
        });
        if (dl.completed_at) {
          // already represented as document_sent typically
        } else if (dueAt && new Date(dueAt).getTime() < now) {
          events.push({
            id: `dl-missed-${dl.id}`,
            case_id,
            kind: "deadline_missed",
            occurred_at: dueAt,
            title: `Termin przekroczony: ${dl.title ?? dl.kind}`,
            severity: "critical",
            source: "system",
            link: { type: "deadline", id: dl.id },
          });
        } else if (dueAt) {
          events.push({
            id: `dl-due-${dl.id}`,
            case_id,
            kind: "deadline_due",
            occurred_at: dueAt,
            title: `Termin: ${dl.title ?? dl.kind}`,
            severity: "warning",
            source: "system",
            link: { type: "deadline", id: dl.id },
          });
        }
      }
    } catch (err) {
      logger.warn("timeline.deadlines_load_failed", { case_id, error: (err as Error).message });
    }
  }

  // 4. notifications
  if (include_notifications) {
    try {
      // AUDYT #6 (iter32): realny schemat `notifications` ma `template` (nie
      // `kind`) i nie ma `title`. `as any` to maskował.
      const { data: notifs } = await supabase
        .from("notifications")
        .select("id, case_id, channel, template, sent_at, status")
        .eq("case_id", case_id);
      for (const n of notifs ?? []) {
        if (!n.sent_at) continue;
        events.push({
          id: `notif-${n.id}`,
          case_id,
          kind: "document_sent",
          occurred_at: n.sent_at,
          title: `Powiadomienie ${n.channel}: ${n.template}`,
          severity: n.status === "sent" ? "success" : "info",
          source: "notification",
          link: { type: "notification", id: n.id },
        });
      }
    } catch (err) {
      // optional table
    }
  }

  // 5. ai_runs — USUNIĘTE.
  // AUDYT #6 (iter32): REALNY BUG. Tabela `ai_runs` (ani `ai_generation_runs`)
  // NIE ISTNIEJE w migracjach — jedyny realny log AI to `ai_usage_log`, który NIE
  // ma kolumny `case_id`, więc nie da się wiązać zdarzeń z konkretną sprawą.
  // Poprzednio `as any` + try/catch maskowały wywrotkę (gałąź i tak zawsze
  // zwracała pustkę). Do przywrócenia po dodaniu tabeli z `case_id`.
  void include_ai_runs;

  // 6. case_events (free-form, may include hearing/ruling/appeal)
  // AUDYT #6 (iter32) + KOLIZJA: wygrywa wcześniejsza migracja case_events
  // (20260510130800: event_type/created_at/metadata). Późniejsza
  // (20260512200000: kind/occurred_at/title/description) jest pomijana przez
  // `if not exists`. Kod pytał o pominięty schemat → zawsze pustka/wywrotka.
  // Tytuł/opis bierzemy z `metadata`.
  try {
    const { data: caseEvents } = await supabase
      .from("case_events")
      .select("id, case_id, event_type, created_at, metadata")
      .eq("case_id", case_id)
      .order("created_at", { ascending: true });
    for (const ev of caseEvents ?? []) {
      const k = (ev.event_type as TimelineEventKind) ?? "user_note";
      const meta = (ev.metadata ?? {}) as Record<string, unknown>;
      events.push({
        id: `ce-${ev.id}`,
        case_id,
        kind: k,
        occurred_at: ev.created_at,
        title: (meta.title as string | undefined) ?? k,
        description: (meta.description as string | undefined) ?? undefined,
        severity: KIND_TO_SEVERITY[k] ?? "info",
        source: "user",
        metadata: meta,
      });
    }
  } catch {
    // optional table
  }

  // sort
  events.sort((a, b) => {
    const ta = new Date(a.occurred_at).getTime();
    const tb = new Date(b.occurred_at).getTime();
    return order === "asc" ? ta - tb : tb - ta;
  });

  return events;
}

/**
 * Group timeline events by phase (for visualization).
 */
export type TimelinePhase = "pre_litigation" | "litigation" | "judgment" | "appeal" | "enforcement" | "closed";

export function groupTimelineByPhase(events: TimelineEvent[]): Record<TimelinePhase, TimelineEvent[]> {
  const phases: Record<TimelinePhase, TimelineEvent[]> = {
    pre_litigation: [],
    litigation: [],
    judgment: [],
    appeal: [],
    enforcement: [],
    closed: [],
  };
  let current: TimelinePhase = "pre_litigation";
  // process oldest → newest
  const sorted = [...events].sort(
    (a, b) => new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime(),
  );
  for (const ev of sorted) {
    if (ev.kind === "document_received" && /pozew|nakaz/i.test(ev.title)) current = "litigation";
    if (ev.kind === "hearing_scheduled" || ev.kind === "hearing_held") current = "litigation";
    if (ev.kind === "ruling_received") current = "judgment";
    if (ev.kind === "appeal_filed") current = "appeal";
    if (ev.kind === "enforcement_started") current = "enforcement";
    if (ev.kind === "case_closed") current = "closed";
    phases[current].push(ev);
  }
  return phases;
}
