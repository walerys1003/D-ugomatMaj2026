import { permanentRedirect } from "next/navigation";

/**
 * /panel/moje-pisma — DEPRECATED w Tarcza v2.
 *
 * Trasa canonical: /panel/dokumenty (ma [id], foldery, tagi — pełniejsza taksonomia).
 * Powód: dedup audit Etap 3b. Stara strona była częściowym duplikatem dokumentów.
 *
 * `permanentRedirect()` w Next 14 emituje HTTP 308 — SEO zachowuje rank,
 * boty crawlerów zaktualizują indeks, użytkownicy z zakładkami nie widzą 404.
 */
export default function MojePismaDeprecatedPage(): never {
  permanentRedirect("/panel/dokumenty");
}
