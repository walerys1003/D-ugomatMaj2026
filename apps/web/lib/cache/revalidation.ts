/**
 * Tier 5.3 — Revalidation helpers.
 *
 * Cienka warstwa nad `revalidateTag` / `revalidatePath` z Next.js, która:
 *  - centralizuje wszystkie wywołania (łatwiej audyt i grep),
 *  - bezpiecznie obsługuje wywołania w środowiskach gdzie Next runtime
 *    nie jest dostępny (np. testy jednostkowe),
 *  - integruje się z `cacheTags` z `./cache-tags.ts`.
 *
 * Wszystkie funkcje są synchroniczne i fire-and-forget — nigdy nie
 * blokują głównego flow server-action.
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { cacheTags } from "./cache-tags";

function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag);
  } catch {
    /* Next.js runtime niedostępny (test/CLI) — ignorujemy */
  }
}

function safeRevalidatePath(path: string, type?: "layout" | "page"): void {
  try {
    revalidatePath(path, type);
  } catch {
    /* j.w. */
  }
}

/* ─────────────────────────────────────────────────────────────────────
   Sprawy i dokumenty
   ───────────────────────────────────────────────────────────────────── */

export function revalidateCase(caseId: string, userId: string): void {
  safeRevalidateTag(cacheTags.case(caseId));
  safeRevalidateTag(cacheTags.cases(userId));
  safeRevalidatePath(`/panel/sprawa/${caseId}`);
  safeRevalidatePath("/panel", "page");
}

export function revalidateDocument(
  caseId: string,
  docId: string,
  userId: string,
): void {
  safeRevalidateTag(cacheTags.document(docId));
  safeRevalidateTag(cacheTags.documents(caseId));
  safeRevalidateTag(cacheTags.case(caseId));
  safeRevalidateTag(cacheTags.cases(userId));
  safeRevalidatePath(`/panel/sprawa/${caseId}`);
  safeRevalidatePath(`/panel/sprawa/${caseId}/dokument/${docId}`);
}

export function revalidateDeadlines(userId: string): void {
  safeRevalidateTag(cacheTags.deadlines(userId));
  safeRevalidatePath("/panel");
}

export function revalidatePayments(userId: string): void {
  safeRevalidateTag(cacheTags.payments(userId));
}

/* ─────────────────────────────────────────────────────────────────────
   Treści publiczne
   ───────────────────────────────────────────────────────────────────── */

export function revalidateLandingPages(): void {
  safeRevalidateTag(cacheTags.landing());
  safeRevalidateTag(cacheTags.pricing());
  safeRevalidatePath("/", "layout");
}

export function revalidateKnowledgeBase(): void {
  safeRevalidateTag(cacheTags.knowledgeBase());
  safeRevalidatePath("/baza-wiedzy", "layout");
}

export function revalidateKnowledgeArticle(slug: string): void {
  safeRevalidateTag(cacheTags.knowledgeArticle(slug));
  safeRevalidateTag(cacheTags.knowledgeBase());
  safeRevalidatePath(`/baza-wiedzy/${slug}`);
}
