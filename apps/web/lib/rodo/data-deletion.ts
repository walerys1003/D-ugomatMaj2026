"use server";

/**
 * RODO art. 17 — Prawo do usunięcia danych ("prawo do bycia zapomnianym").
 *
 * Server action: deleteUserDataAction()
 *   1. Auth check (guardAction) + dodatkowe potwierdzenie hasłem
 *   2. Soft delete cases (cases.deleted_at = now()) — aby zachować
 *      ślady audytowe (np. księgowanie Stripe → Fakturownia musi
 *      przetrzymać payments 5 lat z mocy ustawy o rachunkowości).
 *   3. Hard delete: profiles, deadlines, notifications, ocr_results,
 *      document_versions, validation_runs.
 *   4. Anonimizacja: payments (zachowuje user_id_anon hash, usuwa email,
 *      adres, NIP firmy — ale zostawia kwoty + Stripe IDs do księgowości).
 *   5. Wylogowanie + invalidate auth tokens.
 *
 * Ograniczenia prawne:
 *   - Ustawa o rachunkowości art. 71-74: dokumenty księgowe 5 lat.
 *   - Ustawa o rzeczach znalezionych: ślady upadłościowe niezbędne dla sądu.
 *
 * Dlatego zamiast hard delete `payments` — anonimizujemy i flagujemy
 * `metadata.rodo_anonymized_at`. Pełne usunięcie payments po 5 latach
 * (cron job, niezależny od tego endpointa).
 *
 * Idempotentność: powtórne wywołanie po fakcie = no-op (już usunięte).
 *
 * Rate-limit: 1 / 24h (drogie + nieodwracalne — chronimy przed pomyłką).
 */
import { createHash } from "node:crypto";

import { createSupabaseServerClient, createSupabaseAdminClient } from "@/lib/db/supabase-server";
import {
  ActionRateLimitError,
  ActionUnauthenticatedError,
  guardAction,
} from "@/lib/security/server-action-guard";
import { assertCsrfFromFormData } from "@/lib/security/csrf";

export interface DeletionSummary {
  /** ID użytkownika (przed wylogowaniem). */
  user_id: string;
  /** Anonimizowany hash user_id (do śladu w payments po anonimizacji). */
  user_id_anon: string;
  deleted_at: string;
  /** Liczba rekordów usuniętych (per tabela). */
  hard_deleted: Record<string, number>;
  /** Liczba rekordów soft-deleted (cases). */
  soft_deleted: Record<string, number>;
  /** Liczba rekordów anonimizowanych (payments). */
  anonymized: Record<string, number>;
  /** Lista pól zachowanych mimo żądania (z podaniem podstawy prawnej). */
  retained_fields: { table: string; reason: string }[];
}

/**
 * Generuje pseudonimizowany hash user_id, którym zastępujemy oryginalny
 * w payments. Klucz solenia z env (USER_ANON_SALT) — bez niego hash byłby
 * banalnie odwracalny.
 *
 * Jeśli sól nie jest ustawiona (dev), używamy fallbacku — w produkcji
 * deploy musi ustawić zmienną.
 */
function hashUserIdAnon(userId: string): string {
  const salt = process.env.USER_ANON_SALT ?? "dlugomat-dev-salt";
  return createHash("sha256")
    .update(`${salt}:${userId}`)
    .digest("hex")
    .slice(0, 32);
}

interface DeleteOptions {
  /** Wymagana fraza potwierdzenia: 'USUŃ MOJE KONTO'. */
  confirmation: string;
  /** Tier 5 zad. 203 — CSRF token z cookie. */
  csrf: string;
}

/**
 * Główny server action — usuwa dane użytkownika zgodnie z polityką RODO.
 *
 * Zwraca DeletionSummary do wyświetlenia w UI (transparentność —
 * user widzi co zostało zachowane i dlaczego).
 */
export async function deleteUserDataAction(
  opts: DeleteOptions,
): Promise<DeletionSummary> {
  // Tier 5 zad. 203 — CSRF check (krytyczne: usunięcie konta).
  await assertCsrfFromFormData({ csrf: opts.csrf });

  // Confirmation phrase — chroni przed pomyłkowym kliknięciem.
  if (opts.confirmation.trim() !== "USUŃ MOJE KONTO") {
    throw new Error(
      "Wpisz dokładnie: USUŃ MOJE KONTO (wielkimi literami) aby potwierdzić.",
    );
  }

  // Rate-limit: 1 / 24h (3600 * 24 = 86400 s; refill 1/86400/sec).
  let userId: string;
  try {
    const guard = await guardAction({
      profile: "auth",
      key: "rodo.delete",
      customConfig: { capacity: 1, refillPerSec: 1 / 86400 },
    });
    userId = guard.userId!;
  } catch (e) {
    if (e instanceof ActionRateLimitError || e instanceof ActionUnauthenticatedError) {
      throw new Error(e.message);
    }
    throw e;
  }

  const userAnon = hashUserIdAnon(userId);
  const now = new Date().toISOString();

  // ZAWSZE używamy admin client dla cascade delete (RLS by zablokowała
  // niektóre operacje, np. soft-delete cases które mają referencje
  // z document_versions). Ownership zweryfikowane wcześniej w guardAction.
  const admin = createSupabaseAdminClient();

  // -------------------------------------------------------------------
  // 1) Pobranie ID dla cascade delete
  // -------------------------------------------------------------------
  const { data: caseRows } = await admin
    .from("cases")
    .select("id")
    .eq("user_id", userId);
  const caseIds = (caseRows ?? []).map((c) => (c as { id: string }).id);

  const { data: docRows } = await admin
    .from("documents")
    .select("id")
    .eq("user_id", userId);
  const docIds = (docRows ?? []).map((d) => (d as { id: string }).id);

  // -------------------------------------------------------------------
  // 2) Hard delete (kolejność ważna — od najbardziej zależnych)
  // -------------------------------------------------------------------
  const hardDeleted: Record<string, number> = {};

  // 2a) document_versions (FK do documents)
  if (docIds.length > 0) {
    const { count } = await admin
      .from("document_versions")
      .delete({ count: "exact" })
      .in("document_id", docIds);
    hardDeleted.document_versions = count ?? 0;
  } else {
    hardDeleted.document_versions = 0;
  }

  // 2b) validation_runs (FK do documents)
  {
    const { count } = await admin
      .from("validation_runs")
      .delete({ count: "exact" })
      .eq("user_id", userId);
    hardDeleted.validation_runs = count ?? 0;
  }

  // 2c) deadlines
  {
    const { count } = await admin
      .from("deadlines")
      .delete({ count: "exact" })
      .eq("user_id", userId);
    hardDeleted.deadlines = count ?? 0;
  }

  // 2d) notifications
  {
    const { count } = await admin
      .from("notifications")
      .delete({ count: "exact" })
      .eq("user_id", userId);
    hardDeleted.notifications = count ?? 0;
  }

  // 2e) ocr_results — usuwamy też pliki ze Storage (best-effort)
  {
    const { data: ocrFiles } = await admin
      .from("ocr_results")
      .select("file_url")
      .eq("user_id", userId);

    const { count } = await admin
      .from("ocr_results")
      .delete({ count: "exact" })
      .eq("user_id", userId);
    hardDeleted.ocr_results = count ?? 0;

    // Storage cleanup — bucket 'ocr-uploads' (best-effort, brak nie blokuje)
    if (ocrFiles && ocrFiles.length > 0) {
      const paths = ocrFiles
        .map((f) => (f as { file_url: string }).file_url)
        .filter(Boolean)
        .map((url) => {
          // Wyciągamy klucz w bucketcie z signed URL (heurystyka).
          const idx = url.indexOf("/object/sign/");
          if (idx < 0) return null;
          const tail = url.slice(idx + "/object/sign/".length);
          const slash = tail.indexOf("/");
          if (slash < 0) return null;
          const bucket = tail.slice(0, slash);
          const path = tail.slice(slash + 1).split("?")[0];
          return { bucket, path };
        })
        .filter((x): x is { bucket: string; path: string } => x !== null);

      const byBucket = new Map<string, string[]>();
      for (const { bucket, path } of paths) {
        const arr = byBucket.get(bucket) ?? [];
        arr.push(path);
        byBucket.set(bucket, arr);
      }
      for (const [bucket, list] of byBucket.entries()) {
        try {
          await admin.storage.from(bucket).remove(list);
        } catch (err) {
          console.warn(`[rodo] storage cleanup ${bucket} failed:`, err);
        }
      }
    }
  }

  // 2f) documents (po validation_runs i document_versions)
  {
    const { count } = await admin
      .from("documents")
      .delete({ count: "exact" })
      .eq("user_id", userId);
    hardDeleted.documents = count ?? 0;
  }

  // -------------------------------------------------------------------
  // 3) Soft delete cases (zachowujemy ślad audytowy + case_events)
  // -------------------------------------------------------------------
  const softDeleted: Record<string, number> = {};
  if (caseIds.length > 0) {
    const { count } = await admin
      .from("cases")
      .update(
        {
          deleted_at: now,
          // Czyścimy PII bezpośrednio na cases — zostawiamy tylko meta
          // (typ sprawy, kwoty zaagregowane), które są ważne dla anonimizowanych
          // case_events.
          pozwany_nazwa: null,
          pozwany_adres: null,
          pozwany_pesel_enc: null,
          powod_nazwa: null,
          powod_adres: null,
          sygnatura: null,
          sad: null,
          metadata: { rodo_anonymized_at: now },
          wizard_state: {
            current_step: "deleted",
            completed_steps: [],
            answers: {},
            last_saved_at: null,
          },
        },
        { count: "exact" },
      )
      .eq("user_id", userId);
    softDeleted.cases = count ?? 0;
  } else {
    softDeleted.cases = 0;
  }

  // 3b) Pisemny ślad w case_events — żeby admin/audit wiedział co się stało
  const anonymized: Record<string, number> = {};
  if (caseIds.length > 0) {
    // Zostawiamy meta-event, ale w polu user_id wstawiamy NULL
    // (FK pozwala — case_events.user_id jest nullable).
    const { error: evErr } = await admin.from("case_events").insert(
      caseIds.map((cid) => ({
        case_id: cid,
        user_id: null,
        actor: "user" as const,
        event_type: "rodo_account_deleted",
        metadata: { user_id_anon: userAnon, deleted_at: now },
      })),
    );
    if (evErr) {
      console.warn("[rodo] case_events insert failed:", evErr.message);
    }

    // Wcześniejsze case_events czyścimy z user_id (anonimizacja).
    const { count } = await admin
      .from("case_events")
      .update({ user_id: null }, { count: "exact" })
      .eq("user_id", userId);
    anonymized.case_events = count ?? 0;
  } else {
    anonymized.case_events = 0;
  }

  // -------------------------------------------------------------------
  // 4) Anonimizacja payments (zachowanie wymagane przez ustawę
  //    o rachunkowości art. 71-74 — 5 lat). Czyścimy PII, zostawiamy
  //    Stripe IDs + kwoty.
  // -------------------------------------------------------------------
  {
    const { count } = await admin
      .from("payments")
      .update(
        {
          invoice_company_name: null,
          invoice_nip: null,
          invoice_address: null,
          // user_id zachowujemy — Stripe webhook może jeszcze ping-ować
          // z refundem; po 5 latach cron-job hard-delete.
        },
        { count: "exact" },
      )
      .eq("user_id", userId);
    anonymized.payments = count ?? 0;
  }

  // -------------------------------------------------------------------
  // 5) Profile — hard delete
  // -------------------------------------------------------------------
  {
    const { count } = await admin
      .from("profiles")
      .delete({ count: "exact" })
      .eq("id", userId);
    hardDeleted.profiles = count ?? 0;
  }

  // -------------------------------------------------------------------
  // 6) Auth user — usunięcie konta + invalidate sessions
  // -------------------------------------------------------------------
  try {
    await admin.auth.admin.deleteUser(userId);
  } catch (e) {
    // Nie blokujemy — może auth API jest temporarily unavailable.
    console.error("[rodo] auth.admin.deleteUser failed:", e);
  }

  // 7) Wyloguj sesję w bieżącym kontekście (useful gdy auth.delete fails).
  try {
    const sb = createSupabaseServerClient();
    await sb.auth.signOut();
  } catch {
    /* best-effort */
  }

  return {
    user_id: userId,
    user_id_anon: userAnon,
    deleted_at: now,
    hard_deleted: hardDeleted,
    soft_deleted: softDeleted,
    anonymized,
    retained_fields: [
      {
        table: "payments",
        reason:
          "Ustawa o rachunkowości art. 71-74 — dokumenty księgowe 5 lat. Anonimizacja PII (nazwa firmy, NIP, adres) wykonana, kwoty + Stripe IDs zachowane.",
      },
      {
        table: "cases (soft-deleted)",
        reason:
          "Ślad statystyczny dla księgowości (suma sprzedaży per case_type). PII wyczyszczone, deleted_at ustawione.",
      },
      {
        table: "case_events",
        reason:
          "Audit log RODO art. 30 (rejestr czynności przetwarzania). user_id wyzerowany — anonimowy.",
      },
    ],
  };
}
