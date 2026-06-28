import { permanentRedirect } from "next/navigation";

/**
 * /panel/dashboard-v2 — ARCHIVE w Tarcza v2.
 *
 * Pulpit kanoniczny: /panel (app/(panel)/panel/page.tsx).
 * Dashboard-v2 był eksperymentem z Tier 53/54. Po audicie i redesignu
 * pulpitu (Tarcza v2) jego unikalne elementy (stat tiles, AI recos, urgency
 * timeline) zostały zintegrowane w canonical /panel.
 *
 * Plik nie został usunięty (zachowanie historii git), ale trasa jest
 * niedostępna dla użytkowników — wchodzą na pulpit.
 */
export default function DashboardV2ArchivePage(): never {
  permanentRedirect("/panel");
}
