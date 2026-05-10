/**
 * Tier 6 zad. 266 — GraphQL-like field selection for REST endpoints.
 *
 * Pozwala klientowi wybrać tylko interesujące go pola przez query param:
 *   GET /api/cases?fields=id,title,status,kwota_razem
 *
 * Cel:
 *   - Zmniejszenie payload (50% mniej bajtów dla list views)
 *   - Mniej computation server-side (np. nie liczyć kwota_pozostalo)
 *   - Wygodne dla integracji B2B / mobile clients
 *
 * Bezpieczeństwo:
 *   - Allow-list pól per resource (zapobiega leakowi password_hash itp.)
 *   - Max 20 pól (zapobiega DoS)
 *   - Validation regex `[a-z_]{1,40}` (whitelist znaków)
 *
 * Format: comma-separated, dot dla nested ("user.email").
 */

export interface FieldSelectionConfig {
  resource: string;
  allowed: readonly string[];
  defaults?: readonly string[];
  required?: readonly string[];
}

const FIELD_REGEX = /^[a-z][a-z0-9_]{0,39}(\.[a-z][a-z0-9_]{0,39})?$/;
const MAX_FIELDS = 20;

export class InvalidFieldsError extends Error {
  constructor(public readonly invalid: string[]) {
    super(`Invalid or disallowed fields: ${invalid.join(", ")}`);
    this.name = "InvalidFieldsError";
  }
}

/**
 * Parse `?fields=...` and return Supabase-compatible `select()` string.
 * Returns "*" if no fields param OR includes ALL allowed fields.
 *
 * @throws InvalidFieldsError gdy klient prosi o disallowed field.
 */
export function parseFieldSelection(
  fieldsParam: string | null,
  config: FieldSelectionConfig,
): string {
  if (!fieldsParam || fieldsParam.trim() === "") {
    return config.defaults ? config.defaults.join(",") : "*";
  }

  const requested = fieldsParam
    .split(",")
    .map((f) => f.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, MAX_FIELDS);

  // Walidacja regex'em
  const malformed = requested.filter((f) => !FIELD_REGEX.test(f));
  if (malformed.length > 0) {
    throw new InvalidFieldsError(malformed);
  }

  // Allow-list check
  const allowedSet = new Set(config.allowed);
  const disallowed = requested.filter((f) => !allowedSet.has(f));
  if (disallowed.length > 0) {
    throw new InvalidFieldsError(disallowed);
  }

  // Dodaj required fields (np. id zawsze)
  const required = config.required ?? [];
  const finalSet = new Set([...required, ...requested]);

  return Array.from(finalSet).join(",");
}

// ----- Predefined configs dla głównych resource'ów -----

export const CASES_FIELDS: FieldSelectionConfig = {
  resource: "cases",
  required: ["id"],
  defaults: [
    "id",
    "title",
    "type",
    "status",
    "created_at",
    "updated_at",
    "kwota_razem",
  ],
  allowed: [
    "id",
    "user_id",
    "type",
    "title",
    "status",
    "sygnatura",
    "sad",
    "data_nakazu",
    "data_doreczenia",
    "powod_nazwa",
    "powod_adres",
    "pozwany_nazwa",
    "pozwany_adres",
    "kwota_glowna",
    "kwota_odsetki",
    "kwota_koszty",
    "kwota_razem",
    "kwota_pozostalo",
    "wizard_state",
    "created_at",
    "updated_at",
    "deleted_at",
  ],
};

export const AI_RUNS_FIELDS: FieldSelectionConfig = {
  resource: "ai_generation_runs",
  required: ["id"],
  defaults: ["id", "case_id", "status", "model_id", "cost_pln", "created_at"],
  allowed: [
    "id",
    "case_id",
    "user_id",
    "status",
    "model_id",
    "prompt_hash",
    "input_tokens",
    "output_tokens",
    "cost_pln",
    "duration_ms",
    "rag_source",
    "validator_role",
    "created_at",
    "completed_at",
  ],
};

export const NOTIFICATIONS_FIELDS: FieldSelectionConfig = {
  resource: "notifications",
  required: ["id"],
  defaults: ["id", "channel", "status", "scheduled_for", "attempts"],
  allowed: [
    "id",
    "user_id",
    "case_id",
    "channel",
    "template_key",
    "status",
    "scheduled_for",
    "sent_at",
    "attempts",
    "last_error",
    "created_at",
  ],
};
