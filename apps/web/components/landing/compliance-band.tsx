import { Lock, Database, FileCheck2, MapPin, KeyRound } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";

/**
 * ComplianceBand — redukcja obiekcji bezpieczeństwa (redesign 03 §9, fix LP-3).
 *
 * Rozdzielona od TrustBar (która miesza press + KPI + compliance). Tu wyłącznie
 * twarde sygnały zaufania mapujące się na realne mechanizmy backendu
 * (docs/redesign/01 §8): pgcrypto, RLS FORCE, RODO export/delete, hosting UE, MFA.
 *
 * Tokeny kanoniczne wyłącznie. Tło navy (tone=navy) — jeden „mocny" akcent
 * sekcyjny budujący powagę instytucjonalną.
 */

interface ComplianceItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  copy: string;
}

const ITEMS: ComplianceItem[] = [
  {
    icon: Lock,
    title: "Szyfrowanie danych wrażliwych",
    copy: "Pola wrażliwe szyfrowane w bazie (pgcrypto).",
  },
  {
    icon: Database,
    title: "Izolacja per-użytkownik",
    copy: "Postgres Row-Level Security FORCE — Twoje dane widzisz tylko Ty.",
  },
  {
    icon: FileCheck2,
    title: "Zgodność z RODO",
    copy: "Eksport i usunięcie danych na żądanie, w każdej chwili.",
  },
  {
    icon: MapPin,
    title: "Hosting w Unii Europejskiej",
    copy: "Infrastruktura w UE — bez transferu danych poza EOG.",
  },
  {
    icon: KeyRound,
    title: "MFA i klucze passkey",
    copy: "Dwuskładnikowe logowanie i WebAuthn dla Twojego konta.",
  },
];

export function ComplianceBand() {
  return (
    <Section tone="navy" density="regular" aria-labelledby="compliance-heading">
      <div className="mb-10 flex flex-col gap-3">
        <Eyebrow tone="neutral" withDot className="text-dlugomat-200">
          Bezpieczeństwo i zgodność
        </Eyebrow>
        <Heading level={2} id="compliance-heading" className="max-w-[26ch] text-white">
          Twoje dane są bezpieczniejsze niż w szufladzie.
        </Heading>
        <Text size="lg" className="max-w-[54ch] text-dlugomat-200">
          Budujemy jak instytucja finansowa — bo bronimy Cię w sprawach, w
          których stawką są Twoje pieniądze i spokój.
        </Text>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          return (
            <li
              key={it.title}
              className="flex flex-col gap-2.5 rounded-lg border border-dlugomat-700/60 bg-dlugomat-850/50 p-4"
            >
              <span className="flex size-9 items-center justify-center rounded-md bg-dlugomat-700/50 text-dlugomat-100">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-[14px] font-semibold leading-snug text-white">{it.title}</h3>
              <p className="text-[13px] leading-relaxed text-dlugomat-200">{it.copy}</p>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
