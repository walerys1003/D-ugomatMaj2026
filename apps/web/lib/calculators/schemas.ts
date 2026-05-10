/**
 * Zod schemas dla wejść kalkulatorów — używane w API i formularzach.
 * Mirrored validation: ten sam schemat działa na froncie (React Hook Form)
 * i backendzie (route handlers).
 */
import { z } from "zod";

const groszeSchema = z.coerce
  .number({ invalid_type_error: "Wpisz kwotę liczbą" })
  .int("Kwota w groszach musi być liczbą całkowitą")
  .min(0, "Kwota nie może być ujemna")
  .max(1_000_000_000, "Kwota wygląda na zbyt wysoką");

const isoDateOptional = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Niepoprawna data (YYYY-MM-DD)")
  .optional();

export const wynagrodzenieInputSchema = z.object({
  nettoGrosze: groszeSchema,
  kategoria: z.enum([
    "alimentacyjne",
    "niealimentacyjne",
    "zaliczki_pieniezne",
    "kary_pieniezne",
    "kilka_tytulow",
  ]),
  etat: z.coerce.number().min(0.05).max(1).optional(),
  date: isoDateOptional,
});

export const emeryturaInputSchema = z.object({
  bruttoGrosze: groszeSchema,
  kategoria: z.enum([
    "alimentacyjne",
    "niealimentacyjne",
    "nienależne",
    "dps",
  ]),
  date: isoDateOptional,
});

export const rachunekInputSchema = z.object({
  saldoGrosze: groszeSchema,
  wplywyMiesieczneGrosze: groszeSchema,
  swiadczeniaWylaczoneGrosze: groszeSchema.optional(),
  juzWykorzystanaGrosze: groszeSchema.optional(),
  date: isoDateOptional,
});

export type WynagrodzenieInputDTO = z.infer<typeof wynagrodzenieInputSchema>;
export type EmeryturaInputDTO = z.infer<typeof emeryturaInputSchema>;
export type RachunekInputDTO = z.infer<typeof rachunekInputSchema>;
