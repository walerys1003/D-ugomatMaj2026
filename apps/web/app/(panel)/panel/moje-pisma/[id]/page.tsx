import { permanentRedirect } from "next/navigation";

/**
 * /panel/moje-pisma/[id] — DEPRECATED. Redirect 308 do /panel/dokumenty/[id].
 *
 * Mapowanie 1:1 — to samo pismo było (i jest) keyed po UUID w bazie.
 * Patrz: Etap 3b dedup audit oraz docs/AUDIT_FULL_2026-05.md §6.
 */
export default function MojePismoDeprecatedPage({ params }: { params: { id: string } }): never {
  permanentRedirect(`/panel/dokumenty/${params.id}`);
}
