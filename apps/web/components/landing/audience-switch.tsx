import Link from "next/link";
import { User, Building2, Scale, Landmark, ArrowRight } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Eyebrow, Heading, Text } from "@/components/ui/typography";
import { cn } from "@/lib/utils";

/**
 * AudienceSwitch — segmentacja odbiorcy nad foldem (redesign 03 §4, fix LP-2).
 *
 * Cztery sytuacje → cztery ścieżki. Routuje B2C i B2B do właściwych landingów
 * (lp/*, dla-*) zanim użytkownik zacznie scrollować. B2B ma najwyższy ARPU,
 * więc nie może ginąć w jednym generycznym CTA.
 *
 * Wyłącznie tokeny kanoniczne (02 §8). Ikony lucide. Zero emoji.
 */

interface Audience {
  icon: React.ComponentType<{ className?: string }>;
  headline: string;
  copy: string;
  href: string;
  cta: string;
}

const AUDIENCES: Audience[] = [
  {
    icon: User,
    headline: "Dostałem nakaz lub pismo od komornika",
    copy: "Sprzeciw, skarga komornicza, korekta BIK — gotowe pismo w 12 minut.",
    href: "/lp/dluznik-prywatny",
    cta: "Dla osób prywatnych",
  },
  {
    icon: Building2,
    headline: "Moja firma ma zaległości i wezwania",
    copy: "Ugody, restrukturyzacja, automaty na powtarzalne sprawy płatnicze.",
    href: "/dla-firm",
    cta: "Dla firm",
  },
  {
    icon: Scale,
    headline: "Obsługuję sprawy dłużników w kancelarii",
    copy: "Generator pism, baza orzecznicza, zespół i białe etykiety.",
    href: "/dla-kancelarii",
    cta: "Dla kancelarii",
  },
  {
    icon: Landmark,
    headline: "Zarządzam portfelem należności",
    copy: "Masowe operacje, integracje i API dla działów windykacji.",
    href: "/dla-windykacji",
    cta: "Dla windykacji",
  },
];

export function AudienceSwitch() {
  return (
    <Section tone="muted" density="regular" aria-labelledby="audience-heading">
      <div className="mb-10 flex flex-col gap-3">
        <Eyebrow tone="brand" withDot>
          Dla kogo jest Długomat
        </Eyebrow>
        <Heading level={2} id="audience-heading" className="max-w-[20ch]">
          Cztery sytuacje. Jedna tarcza.
        </Heading>
        <Text size="lg" tone="muted" className="max-w-[52ch]">
          Wybierz swoją sytuację — pokażemy Ci dokładnie te narzędzia, których
          potrzebujesz.
        </Text>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map((a) => {
          const Icon = a.icon;
          return (
            <Link
              key={a.href}
              href={a.href}
              className={cn(
                "group flex flex-col gap-3 rounded-lg border border-ink-200 bg-card p-5 shadow-sm transition",
                "hover:-translate-y-0.5 hover:border-dlugomat-300 hover:shadow-md",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              )}
            >
              <span className="flex size-10 items-center justify-center rounded-md bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-700/20 dark:text-dlugomat-300">
                <Icon className="size-5" aria-hidden />
              </span>
              <h3 className="text-[15px] font-semibold leading-snug text-ink-900 dark:text-white">
                {a.headline}
              </h3>
              <Text size="sm" tone="muted" className="flex-1">
                {a.copy}
              </Text>
              <span className="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-dlugomat-700 dark:text-dlugomat-300">
                {a.cta}
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </span>
            </Link>
          );
        })}
      </div>
    </Section>
  );
}
