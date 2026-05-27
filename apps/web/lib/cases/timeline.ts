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
  // W10-3: loose-cast wrapper — generated Database type is stale for
  // columns added after migration tier 25 (case_type, title on
  // evidence_uploads, etc.). Cast through a permissive `any`-shape so
  // chained queries type-check.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const events: TimelineEvent[] = [];

  // 1. case row → case_created
  try {
    const { data: caseRow } = await sb
      .from("cases")
      .select("id, user_id, case_type, created_at, updated_at, status, title")
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
      description: caseRow.title ?? caseRow.case_type,
      severity: "info",
      source: "user",
      metadata: { case_type: caseRow.case_type, status: caseRow.status },
    });

    if (caseRow.status === "closed") {
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

  // 2. documents → received / generated / sent
  try {
    const { data: docs } = await sb
      .from("documents")
      .select("id, case_id, kind, source, created_at, sent_at, title")
      .eq("case_id", case_id)
      .order("created_at", { ascending: true });

    for (const d of docs ?? []) {
      const kind: TimelineEventKind =
        d.source === "received" || d.source === "ocr"
          ? "document_received"
          : "document_generated";
      events.push({
        id: `doc-${d.id}`,
        case_id,
        kind,
        occurred_at: d.created_at,
        title: kind === "document_received" ? `Otrzymano: ${d.title ?? d.kind}` : `Wygenerowano: ${d.title ?? d.kind}`,
        description: d.kind,
        severity: KIND_TO_SEVERITY[kind],
        source: kind === "document_received" ? "ocr" : "ai",
        link: { type: "document", id: d.id },
      });
      if (d.sent_at) {
        events.push({
          id: `doc-sent-${d.id}`,
          case_id,
          kind: "document_sent",
          occurred_at: d.sent_at,
          title: `Wysłano: ${d.title ?? d.kind}`,
          severity: "success",
          source: "user",
          link: { type: "document", id: d.id },
        });
      }
    }
  } catch (err) {
    logger.warn("timeline.docs_load_failed", { case_id, error: (err as Error).message });
  }

  // 3. deadlines
  if (include_deadlines) {
    try {
      const { data: deadlines } = await sb
        .from("deadlines")
        .select("id, case_id, kind, due_at, completed_at, missed, created_at, title")
        .eq("case_id", case_id);
      const now = Date.now();
      for (const dl of deadlines ?? []) {
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
        } else if (dl.missed || (dl.due_at && new Date(dl.due_at).getTime() < now)) {
          events.push({
            id: `dl-missed-${dl.id}`,
            case_id,
            kind: "deadline_missed",
            occurred_at: dl.due_at ?? dl.created_at,
            title: `Termin przekroczony: ${dl.title ?? dl.kind}`,
            severity: "critical",
            source: "system",
            link: { type: "deadline", id: dl.id },
          });
        } else if (dl.due_at) {
          events.push({
            id: `dl-due-${dl.id}`,
            case_id,
            kind: "deadline_due",
            occurred_at: dl.due_at,
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
      const { data: notifs } = await sb
        .from("notifications")
        .select("id, case_id, channel, kind, sent_at, status, title")
        .eq("case_id", case_id);
      for (const n of notifs ?? []) {
        if (!n.sent_at) continue;
        events.push({
          id: `notif-${n.id}`,
          case_id,
          kind: "document_sent",
          occurred_at: n.sent_at,
          title: `Powiadomienie ${n.channel}: ${n.title ?? n.kind}`,
          severity: n.status === "delivered" ? "success" : "info",
          source: "notification",
          link: { type: "notification", id: n.id },
        });
      }
    } catch (err) {
      // optional table
    }
  }

  // 5. ai_runs (optional)
  if (include_ai_runs) {
    try {
      const { data: runs } = await sb
        .from("ai_runs")
        .select("id, case_id, kind, created_at, status, total_cost_pln")
        .eq("case_id", case_id)
        .order("created_at", { ascending: true })
        .limit(50);
      for (const r of runs ?? []) {
        events.push({
          id: `ai-${r.id}`,
          case_id,
          kind: "ai_generation",
          occurred_at: r.created_at,
          title: `AI: ${r.kind}`,
          description: r.status,
          severity: "info",
          source: "ai",
          link: { type: "ai_run", id: r.id },
          metadata: { cost_pln: r.total_cost_pln },
        });
      }
    } catch {
      // optional
    }
  }

  // 6. case_events (free-form, may include hearing/ruling/appeal)
  try {
    const { data: caseEvents } = await sb
      .from("case_events")
      .select("id, case_id, kind, occurred_at, title, description, metadata")
      .eq("case_id", case_id)
      .order("occurred_at", { ascending: true });
    for (const ev of caseEvents ?? []) {
      const k = (ev.kind as TimelineEventKind) ?? "user_note";
      events.push({
        id: `ce-${ev.id}`,
        case_id,
        kind: k,
        occurred_at: ev.occurred_at,
        title: ev.title ?? k,
        description: ev.description ?? undefined,
        severity: KIND_TO_SEVERITY[k] ?? "info",
        source: "user",
        metadata: (ev.metadata ?? undefined) as Record<string, unknown> | undefined,
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
