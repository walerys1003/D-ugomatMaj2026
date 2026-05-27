import { permanentRedirect } from "next/navigation";

/**
 * /panel/moje-pisma/archiwum — DEPRECATED.
 *
 * Archiwum jest teraz filtrem na canonical liście /panel/dokumenty.
 * Patrz Etap 3b dedup. Filter `?archiwum=1` jest obsługiwany w /panel/dokumenty/page.tsx.
 */
export default function MojeArchiwumDeprecatedPage(): never {
  permanentRedirect("/panel/dokumenty?archiwum=1");
}
