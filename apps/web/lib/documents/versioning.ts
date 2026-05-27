import "server-only";

/**
 * Tier 7 zad. 320 — Document versioning helpers.
 *
 * Każda generacja, edycja manualna lub rewizja AI tworzy nową wersję
 * w `document_versions` (migracja 20260512100000). Pozwala na:
 *   - listę wersji per case
 *   - restore poprzedniej wersji
 *   - diff między wersjami (do zad. 319 split-view)
 *
 * Zasady:
 *   - version_no jest sekwencyjny per case_id (UNIQUE)
 *   - parent_id wskazuje wersję, z której wyszła rewizja
 *   - source enum: 'generation' | 'manual_edit' | 'ai_revision' | 'restore'
 */

import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { logger } from "@/lib/observability/logger";

export type DocumentVersionSource =
  | "generation"
  | "manual_edit"
  | "ai_revision"
  | "restore";

export interface DocumentVersion {
  id: string;
  case_id: string;
  document_id: string | null;
  version_no: number;
  parent_id: string | null;
  source: DocumentVersionSource;
  content_md: string;
  diff_summary: string | null;
  ai_run_id: string | null;
  created_by: string | null;
  created_at: string;
}

/**
 * Zapisuje nową wersję dokumentu. Numer wersji jest auto-increment per case.
 */
export async function saveDocumentVersion(params: {
  caseId: string;
  documentId?: string | null;
  source: DocumentVersionSource;
  contentMd: string;
  parentId?: string | null;
  diffSummary?: string | null;
  aiRunId?: string | null;
  createdBy?: string | null;
}): Promise<DocumentVersion | null> {
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  // Get latest version_no for case
  const { data: latest } = await sb
    .from("document_versions")
    .select("version_no")
    .eq("case_id", params.caseId)
    .order("version_no", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersion = (latest?.version_no ?? 0) + 1;

  const { data, error } = await sb
    .from("document_versions")
    .insert({
      case_id: params.caseId,
      document_id: params.documentId ?? null,
      version_no: nextVersion,
      parent_id: params.parentId ?? null,
      source: params.source,
      content_md: params.contentMd,
      diff_summary: params.diffSummary ?? null,
      ai_run_id: params.aiRunId ?? null,
      created_by: params.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error) {
    logger.warn("doc_version.save_failed", {
      caseId: params.caseId,
      error: error.message,
    });
    return null;
  }

  return data as DocumentVersion;
}

export async function listDocumentVersions(caseId: string): Promise<DocumentVersion[]> {
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("document_versions")
    .select("*")
    .eq("case_id", caseId)
    .order("version_no", { ascending: false });

  if (error) {
    logger.warn("doc_version.list_failed", {
      caseId,
      error: error.message,
    });
    return [];
  }

  return (data ?? []) as DocumentVersion[];
}

export async function getDocumentVersion(
  versionId: string,
): Promise<DocumentVersion | null> {
  const supabase = createSupabaseServerClient();
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const { data, error } = await sb
    .from("document_versions")
    .select("*")
    .eq("id", versionId)
    .maybeSingle();

  if (error) {
    logger.warn("doc_version.get_failed", { versionId, error: error.message });
    return null;
  }

  return data as DocumentVersion | null;
}

/**
 * Restore — kopiuje treść starszej wersji do nowej (source='restore').
 * Nie usuwa nowszych wersji (audit trail zachowany).
 */
export async function restoreDocumentVersion(params: {
  caseId: string;
  sourceVersionId: string;
  createdBy?: string;
}): Promise<DocumentVersion | null> {
  const src = await getDocumentVersion(params.sourceVersionId);
  if (!src || src.case_id !== params.caseId) {
    logger.warn("doc_version.restore_invalid_source", {
      caseId: params.caseId,
      sourceVersionId: params.sourceVersionId,
    });
    return null;
  }

  return saveDocumentVersion({
    caseId: params.caseId,
    documentId: src.document_id,
    source: "restore",
    contentMd: src.content_md,
    parentId: src.id,
    diffSummary: `Restored from version ${src.version_no}`,
    createdBy: params.createdBy,
  });
}

// ----- Diff (Tier 7 zad. 319 — split-view support) -----

export interface DiffParagraph {
  type: "added" | "removed" | "unchanged" | "modified";
  text: string;
  oldText?: string;
}

/**
 * Naive paragraph-level diff. Wystarczające dla split-view z accept/reject
 * per akapit. Dla word-level diffs należałoby użyć diff-match-patch
 * lub jsdiff (lazy import w dedykowanym endpointcie).
 */
export function diffParagraphs(oldMd: string, newMd: string): DiffParagraph[] {
  const oldP = oldMd.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  const newP = newMd.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);

  const result: DiffParagraph[] = [];
  const oldSet = new Set(oldP);
  const newSet = new Set(newP);

  // Najpierw — paragrafy zachowane in-place (proste matching)
  let i = 0;
  let j = 0;
  while (i < oldP.length || j < newP.length) {
    const o = oldP[i];
    const n = newP[j];

    if (o === undefined) {
      result.push({ type: "added", text: n });
      j++;
      continue;
    }
    if (n === undefined) {
      result.push({ type: "removed", text: o });
      i++;
      continue;
    }
    if (o === n) {
      result.push({ type: "unchanged", text: o });
      i++;
      j++;
      continue;
    }

    // Próba lookahead — czy old[i] występuje dalej w new?
    const futureNewIdx = newP.indexOf(o, j);
    const futureOldIdx = oldP.indexOf(n, i);

    if (futureNewIdx !== -1 && (futureOldIdx === -1 || futureNewIdx - j < futureOldIdx - i)) {
      // n jest "added" przed wspólnym fragmentem
      result.push({ type: "added", text: n });
      j++;
    } else if (futureOldIdx !== -1) {
      result.push({ type: "removed", text: o });
      i++;
    } else {
      // Nie ma zgodności w przyszłości → traktuj jako modified
      result.push({ type: "modified", text: n, oldText: o });
      i++;
      j++;
    }
  }

  return result;
}

/**
 * Krótki tekstowy summary diff — dla `diff_summary` w document_versions.
 */
export function summarizeDiff(diff: DiffParagraph[]): string {
  const added = diff.filter((d) => d.type === "added").length;
  const removed = diff.filter((d) => d.type === "removed").length;
  const modified = diff.filter((d) => d.type === "modified").length;
  const parts: string[] = [];
  if (added > 0) parts.push(`+${added} akapitów`);
  if (removed > 0) parts.push(`-${removed} akapitów`);
  if (modified > 0) parts.push(`${modified} zmodyfikowanych`);
  return parts.length > 0 ? parts.join(", ") : "brak zmian";
}
