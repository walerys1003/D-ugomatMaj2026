/**
 * Co-pilot mode for legal professionals — zad. 344
 *
 * When a verified lawyer/radca prawny is logged in (role=lawyer on tenant),
 * they get an enhanced UI:
 *  - Multiple documents open in tabs
 *  - Side-by-side AI suggestions vs. manual edits
 *  - Bulk operations (close 10 cases, generate 5 docs from template)
 *  - Time tracking
 *  - Markup tools (highlight, annotate, redact)
 *  - "Komentarz dla klienta" mode (draft for review)
 *
 * This module exports the state model + actions. UI lives in components/copilot/.
 */

export interface CopilotSession {
  user_id: string;
  tenant_id: string;
  /** Currently open document tabs. */
  open_documents: Array<{ document_id: string; case_id: string; title: string; dirty: boolean }>;
  /** Active document by id. */
  active_document_id?: string;
  /** Time tracking */
  current_timer?: { document_id: string; started_at: string };
  total_minutes_today: number;
  /** Bulk-selected case ids (for batch ops) */
  selected_case_ids: string[];
}

export interface BulkOperation {
  op: "close_cases" | "generate_documents" | "send_reminders" | "export_pdf";
  case_ids: string[];
  params?: Record<string, unknown>;
}

export type CopilotPermission =
  | "view_all_tenant_cases"
  | "draft_documents"
  | "comment_documents"
  | "approve_documents"
  | "send_documents"
  | "manage_deadlines"
  | "bulk_operations"
  | "time_tracking";

const ROLE_PERMISSIONS: Record<string, CopilotPermission[]> = {
  lawyer: [
    "view_all_tenant_cases",
    "draft_documents",
    "comment_documents",
    "approve_documents",
    "manage_deadlines",
    "time_tracking",
  ],
  paralegal: ["view_all_tenant_cases", "draft_documents", "comment_documents", "manage_deadlines"],
  partner: [
    "view_all_tenant_cases",
    "draft_documents",
    "comment_documents",
    "approve_documents",
    "send_documents",
    "manage_deadlines",
    "bulk_operations",
    "time_tracking",
  ],
};

export function getCopilotPermissions(role: string): CopilotPermission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function hasCopilotPermission(role: string, perm: CopilotPermission): boolean {
  return getCopilotPermissions(role).includes(perm);
}

/**
 * Validate a bulk op for given role.
 */
export function validateBulkOp(role: string, op: BulkOperation): { ok: true } | { ok: false; error: string } {
  if (!hasCopilotPermission(role, "bulk_operations")) return { ok: false, error: "insufficient_permission" };
  if (!Array.isArray(op.case_ids) || op.case_ids.length === 0) return { ok: false, error: "no_cases_selected" };
  if (op.case_ids.length > 50) return { ok: false, error: "too_many_cases" };
  if (op.op === "send_documents" && !hasCopilotPermission(role, "send_documents")) {
    return { ok: false, error: "cannot_send" };
  }
  return { ok: true };
}

/**
 * Calculate billable time for a co-pilot session.
 */
export function billableMinutesForToday(session: CopilotSession): number {
  let total = session.total_minutes_today;
  if (session.current_timer) {
    const elapsed = Math.floor((Date.now() - new Date(session.current_timer.started_at).getTime()) / 60_000);
    total += elapsed;
  }
  return total;
}
