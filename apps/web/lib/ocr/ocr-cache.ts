import "server-only";

/**
 * OCR cache — dedup powtórnego OCR-owania tego samego pliku.
 *
 * Strategia:
 *   - Klucz: SHA-256 zawartości pliku (file_hash)
 *   - Wartość: ocr_results.id z poprzedniego runu
 *   - TTL: 24h (po tym czasie OCR jest powtarzany — np. parser uległ poprawie)
 *
 * Implementacja: bezpośrednio w `ocr_results` po `file_url + file_size_bytes`,
 * z dodatkowym zapytaniem po `extracted_data->>'file_hash'`. Tier 5 może
 * zoptymalizować przez Redis / Upstash.
 */
import { createSupabaseAdminClient } from "@/lib/db/supabase-server";
import type { OcrResultRow } from "@/lib/db/types";

const TTL_HOURS = 24;

export async function findCachedOcrByHash(
  userId: string,
  fileHash: string,
): Promise<OcrResultRow | null> {
  const supabase = createSupabaseAdminClient();
  const cutoff = new Date(Date.now() - TTL_HOURS * 3_600_000).toISOString();

  const { data, error } = await supabase
    .from("ocr_results")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "completed")
    .gte("created_at", cutoff)
    .filter("extracted_data->>file_hash", "eq", fileHash)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as OcrResultRow;
}
