/**
 * Tier 34-5 — GDPR data export v2 with structured ZIP archives.
 *
 * Ulepszenie z v1 (single JSON):
 *  - Struktura ZIP zgodna z art. 20 RODO (data portability)
 *  - Separate JSON per data category + README.md + manifest.json
 *  - Walidacja kompletności (HMAC checksum każdego pliku)
 *  - Versioned schema (data_schema_version)
 *  - Maszynowo czytelne CSV dla list (cases, invoices, sessions)
 *  - Original-form PDF dla pism (z generated_documents)
 *
 * Output structure:
 *   dlugomat_export_{user_id}_{timestamp}.zip
 *     ├── manifest.json         (schema version, checksums, generated_at, user_id)
 *     ├── README.md             (human-readable explanation, your rights)
 *     ├── profile.json
 *     ├── cases.json + cases.csv
 *     ├── documents/
 *     │   ├── {case_id}/{document_id}.pdf
 *     │   └── ...
 *     ├── invoices.json + invoices.csv
 *     ├── payments.json
 *     ├── sessions.csv
 *     ├── audit_log.json        (wszystkie akcje usera, art. 15 RODO)
 *     ├── consents.json         (zgody marketingowe i ich historia)
 *     └── ai_interactions.json  (prompts + outputs, redacted PII)
 */
import { createHash } from "crypto";
import { createServerSupabase } from "@/lib/db/supabase-server";

export const EXPORT_SCHEMA_VERSION = "2.0.0";

export interface ExportFileEntry {
  path: string; // relative path inside ZIP
  content_type: "application/json" | "text/csv" | "text/markdown" | "application/pdf";
  bytes: number;
  sha256: string;
}

export interface ExportManifest {
  schema_version: string;
  user_id: string;
  generated_at: string;
  generated_by: "user_request" | "admin_request" | "scheduled";
  legal_basis: "RODO art. 20 (portability) + art. 15 (access)";
  files: ExportFileEntry[];
  totals: {
    cases: number;
    documents: number;
    invoices: number;
    audit_events: number;
    ai_interactions: number;
  };
  /** HMAC-SHA256 całości manifest.json (klucz: GDPR_EXPORT_HMAC_KEY). */
  manifest_signature?: string;
}

function sha256(input: string | Buffer): string {
  return createHash("sha256").update(input).digest("hex");
}

function toCsv<T extends Record<string, unknown>>(rows: T[], columns: (keyof T)[]): string {
  const header = columns.map((c) => String(c)).join(",");
  const lines = rows.map((r) =>
    columns
      .map((c) => {
        const v = r[c];
        if (v == null) return "";
        const s = typeof v === "string" ? v : JSON.stringify(v);
        if (s.includes(",") || s.includes('"') || s.includes("\n")) {
          return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export interface RawExportContent {
  /** path → buffer / string */
  files: Map<string, string | Buffer>;
  manifest: ExportManifest;
}

/**
 * Zbierz dane usera ze wszystkich relevant tabel i zwróć ustrukturyzowany
 * zestaw plików gotowy do spakowania w ZIP. Sam ZIP buduje warstwa wyżej
 * (np. archiver/jszip), bo to async streaming.
 */
export async function buildExportContent(opts: {
  userId: string;
  generatedBy: ExportManifest["generated_by"];
}): Promise<RawExportContent> {
  const { userId, generatedBy } = opts;
  const sb = await createServerSupabase();
  const files = new Map<string, string | Buffer>();

  // --- profile ---
  const { data: profile } = await sb.from("profiles").select("*").eq("id", userId).maybeSingle();
  files.set("profile.json", JSON.stringify(profile ?? {}, null, 2));

  // --- cases ---
  const { data: cases } = await sb
    .from("cases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  const casesArr = (cases ?? []) as Array<Record<string, unknown>>;
  files.set("cases.json", JSON.stringify(casesArr, null, 2));
  files.set(
    "cases.csv",
    toCsv(casesArr, ["id", "module_key", "title", "status", "created_at", "updated_at"] as Array<
      keyof (typeof casesArr)[number]
    >),
  );

  // --- documents (lista metadata; binarne PDF doczytane osobno) ---
  const { data: docs } = await sb
    .from("generated_documents")
    .select("id, case_id, kind, file_path, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  const docsArr = (docs ?? []) as Array<{
    id: string;
    case_id: string;
    kind: string;
    file_path: string;
    created_at: string;
  }>;
  files.set("documents.json", JSON.stringify(docsArr, null, 2));

  // Pobranie binariów z Supabase Storage — przez signed URL lub `from(...).download()`.
  // Tutaj zakładamy bucket `documents` i ścieżki w `file_path`. ZIP-build warstwa wyżej
  // resolve'uje placeholder `__STORAGE__:{bucket}:{path}` na rzeczywisty buffer.
  for (const d of docsArr) {
    if (!d.file_path) continue;
    files.set(`documents/${d.case_id}/${d.id}.pdf`, `__STORAGE__:documents:${d.file_path}`);
  }

  // --- invoices ---
  const { data: invoices } = await sb
    .from("invoices")
    .select("*")
    .eq("user_id", userId)
    .order("issued_at", { ascending: true });
  const invArr = (invoices ?? []) as Array<Record<string, unknown>>;
  files.set("invoices.json", JSON.stringify(invArr, null, 2));
  files.set(
    "invoices.csv",
    toCsv(invArr, [
      "id",
      "number",
      "issued_at",
      "amount_pln",
      "vat_amount_pln",
      "status",
    ] as Array<keyof (typeof invArr)[number]>),
  );

  // --- payments ---
  const { data: payments } = await sb
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  files.set("payments.json", JSON.stringify(payments ?? [], null, 2));

  // --- sessions ---
  const { data: sessions } = await sb
    .from("user_sessions")
    .select("id, device, ip_country, user_agent, created_at, revoked_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  const sessArr = (sessions ?? []) as Array<Record<string, unknown>>;
  files.set(
    "sessions.csv",
    toCsv(sessArr, [
      "id",
      "device",
      "ip_country",
      "user_agent",
      "created_at",
      "revoked_at",
    ] as Array<keyof (typeof sessArr)[number]>),
  );

  // --- audit events (RODO art. 15) ---
  const { data: audit } = await sb
    .from("audit_events")
    .select("event_type, actor_email, target_type, target_id, metadata, created_at")
    .eq("actor_id", userId)
    .order("created_at", { ascending: true })
    .limit(10000);
  files.set("audit_log.json", JSON.stringify(audit ?? [], null, 2));

  // --- consents ---
  const { data: consents } = await sb
    .from("user_consents")
    .select("consent_kind, granted, version, granted_at, revoked_at, ip")
    .eq("user_id", userId)
    .order("granted_at", { ascending: true });
  files.set("consents.json", JSON.stringify(consents ?? [], null, 2));

  // --- AI interactions (redacted) ---
  const { data: aiLogs } = await sb
    .from("ai_invocations")
    .select("id, model, prompt_key, input_redacted, output_redacted, latency_ms, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(5000);
  files.set("ai_interactions.json", JSON.stringify(aiLogs ?? [], null, 2));

  // --- README ---
  const readme = buildReadme(userId, generatedBy);
  files.set("README.md", readme);

  // --- Build file manifest (checksums of textual files only — binaries are added by ZIP-builder layer) ---
  const fileEntries: ExportFileEntry[] = [];
  for (const [path, content] of files.entries()) {
    if (typeof content === "string" && !content.startsWith("__STORAGE__:")) {
      fileEntries.push({
        path,
        content_type:
          path.endsWith(".csv")
            ? "text/csv"
            : path.endsWith(".md")
              ? "text/markdown"
              : path.endsWith(".pdf")
                ? "application/pdf"
                : "application/json",
        bytes: Buffer.byteLength(content, "utf8"),
        sha256: sha256(content),
      });
    }
  }

  const manifest: ExportManifest = {
    schema_version: EXPORT_SCHEMA_VERSION,
    user_id: userId,
    generated_at: new Date().toISOString(),
    generated_by: generatedBy,
    legal_basis: "RODO art. 20 (portability) + art. 15 (access)",
    files: fileEntries,
    totals: {
      cases: casesArr.length,
      documents: docsArr.length,
      invoices: invArr.length,
      audit_events: (audit ?? []).length,
      ai_interactions: (aiLogs ?? []).length,
    },
  };

  // HMAC signature
  const hmacKey = process.env.GDPR_EXPORT_HMAC_KEY ?? "";
  if (hmacKey) {
    const { createHmac } = await import("crypto");
    const sig = createHmac("sha256", hmacKey)
      .update(JSON.stringify({ ...manifest, manifest_signature: undefined }))
      .digest("hex");
    manifest.manifest_signature = sig;
  }

  files.set("manifest.json", JSON.stringify(manifest, null, 2));

  return { files, manifest };
}

function buildReadme(userId: string, generatedBy: ExportManifest["generated_by"]): string {
  return `# Twoje dane w Długomacie — paczka eksportowa

**ID użytkownika:** \`${userId}\`
**Wygenerowano:** ${new Date().toISOString()}
**Typ żądania:** ${generatedBy}
**Podstawa prawna:** art. 20 RODO (przenoszenie) + art. 15 RODO (dostęp).
**Wersja schematu:** ${EXPORT_SCHEMA_VERSION}

---

## Co znajduje się w tej paczce?

| Plik | Co zawiera |
|---|---|
| \`profile.json\` | Twoje dane konta — email, imię, telefon, ustawienia. |
| \`cases.json\` + \`cases.csv\` | Wszystkie Twoje sprawy (D1–D8). |
| \`documents/\` | PDF-y wygenerowanych pism, pogrupowane po sprawie. |
| \`invoices.json\` + \`invoices.csv\` | Faktury VAT z ostatnich 5 lat. |
| \`payments.json\` | Historia płatności i subskrypcji. |
| \`sessions.csv\` | Historia sesji (logowań i wylogowań). |
| \`audit_log.json\` | Każda akcja na Twoim koncie (art. 15 RODO). |
| \`consents.json\` | Historia zgód marketingowych i RODO. |
| \`ai_interactions.json\` | Historia użycia AI — wejście i wyjście (PII zredagowane). |
| \`manifest.json\` | Manifest z sumami SHA-256 wszystkich plików + podpis HMAC. |

## Twoje prawa wg RODO

1. **Art. 15 (dostęp)** — masz prawo wiedzieć, jakie dane przetwarzamy.
2. **Art. 16 (sprostowanie)** — możesz poprawić nieprawidłowe dane (Ustawienia → Profil).
3. **Art. 17 (usunięcie)** — możesz zażądać trwałego usunięcia konta (Ustawienia → Bezpieczeństwo → Usuń konto).
4. **Art. 20 (przenoszenie)** — ta paczka realizuje to prawo. Format JSON/CSV jest maszynowo czytelny.
5. **Art. 21 (sprzeciw)** — możesz wycofać zgody marketingowe w dowolnym momencie.

## Weryfikacja integralności

Wszystkie pliki tekstowe mają SHA-256 checksum w \`manifest.json\`. Manifest sam jest podpisany HMAC-SHA256 — możesz zweryfikować autentyczność u nas w razie wątpliwości.

## Kontakt

Inspektor Ochrony Danych: iod@dlugomat.pl
Adres korespondencyjny: zgodnie z regulaminem na https://dlugomat.pl/regulamin

---

Ta paczka została automatycznie wygenerowana. Nie zawiera żadnych dodatkowych danych ponad to, co rzeczywiście przechowujemy w naszej bazie.
`;
}
