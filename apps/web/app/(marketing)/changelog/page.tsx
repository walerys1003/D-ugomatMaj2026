import type { Metadata } from "next";
import * as React from "react";

import { BreadcrumbJsonLd } from "@/lib/seo/json-ld";

/**
 * Tier 5 zad. 245 — Public changelog page.
 *
 * Statyczna lista wydań (server-rendered, build-time). Używamy ręcznie
 * utrzymywanej listy zamiast generacji z git, żeby:
 *   - kontrolować ton komunikatu (user-facing, nie commit msg),
 *   - grupować zmiany w warstwy (feature / fix / security),
 *   - filtrować changesy nieistotne dla użytkownika.
 *
 * Update protocol: edytuj `RELEASES` przy każdej istotnej zmianie
 * funkcjonalnej (nie pure-tech).
 */
export const metadata: Metadata = {
  title: "Changelog · Co nowego w Długomacie",
  description:
    "Lista zmian, ulepszeń i poprawek bezpieczeństwa w Długomacie. Aktualizowana przy każdym wydaniu.",
  alternates: { canonical: "/changelog" },
  openGraph: {
    title: "Changelog · Długomat",
    description: "Co nowego, co naprawione, co ulepszone.",
    url: "/changelog",
    type: "article",
  },
};

type ChangeKind = "feature" | "improvement" | "fix" | "security";

interface ReleaseEntry {
  version: string; // semver-like
  date: string; // ISO yyyy-mm-dd
  highlights: string[]; // krótkie hasła do nagłówka
  changes: Array<{ kind: ChangeKind; text: string }>;
}

const RELEASES: ReleaseEntry[] = [
  {
    version: "0.5.0",
    date: "2026-05-10",
    highlights: [
      "Pełny zestaw modułów D1–D8",
      "Zaszyfrowane dane wrażliwe (pgcrypto)",
      "Skanowanie plików (magic bytes + ClamAV)",
      "Program polecający",
    ],
    changes: [
      {
        kind: "feature",
        text: "D3 KomornikShield, D4 PotrąceniaStop, D6 CesjaCheck, D7 UgodoMat, D8 Upadłość-Lite — pełny zestaw modułów dla osób zadłużonych.",
      },
      {
        kind: "feature",
        text: "Program polecający — 15% prowizji od opłaconych spraw przyniesionych przez Twój kod.",
      },
      {
        kind: "feature",
        text: "5-mailowa sekwencja onboardingowa: powitanie, pierwsza sprawa, kalkulatory, baza wiedzy, powrót po 30 dniach.",
      },
      {
        kind: "feature",
        text: "Panel administracyjny: dashboard KPI z wykresami przychodów, lejek konwersji, monitor notyfikacji, status RAG.",
      },
      {
        kind: "feature",
        text: "Cookie banner z Google Consent Mode v2 (granularne kategorie: analityka / marketing / personalizacja).",
      },
      {
        kind: "security",
        text: "Szyfrowanie at-rest danych wrażliwych (PESEL, NIP, treść OCR) — pgcrypto + AES-256.",
      },
      {
        kind: "security",
        text: "Skanowanie plików: weryfikacja magic bytes (PDF/JPEG/PNG/WEBP/TIFF) + opcjonalny ClamAV INSTREAM.",
      },
      {
        kind: "security",
        text: "Ochrona CSRF dla formularzy panelu (double-submit cookie pattern, timing-safe compare).",
      },
      {
        kind: "improvement",
        text: "Baza wiedzy RAG rozszerzona o D3/D4/D6/D7/D8 — art. KPC, KC, KP, PB, ustawa o upadłości konsumenckiej.",
      },
      {
        kind: "improvement",
        text: "Powiadomienia o nieudanych płatnościach — osobny e-mail z linkiem do retry.",
      },
      {
        kind: "improvement",
        text: "Kody promocyjne — admin może tworzyć rabaty procentowe / kwotowe z limitem użyć.",
      },
    ],
  },
  {
    version: "0.4.0",
    date: "2026-05-09",
    highlights: ["Płatności Stripe", "Faktury (Fakturownia)", "RODO export"],
    changes: [
      {
        kind: "feature",
        text: "Integracja Stripe Checkout + automatyczne faktury VAT przez Fakturownia.",
      },
      {
        kind: "feature",
        text: "Eksport wszystkich Twoich danych (RODO) — pojedynczy plik ZIP w panelu Ustawienia → RODO.",
      },
      {
        kind: "feature",
        text: "Usunięcie konta z 30-dniowym okresem soft-delete (możliwość przywrócenia).",
      },
      {
        kind: "improvement",
        text: "OCR: cache po hashu pliku — drugi upload tego samego skanu jest natychmiastowy.",
      },
    ],
  },
  {
    version: "0.3.0",
    date: "2026-05-08",
    highlights: ["AI engine (Claude Sonnet 4.5)", "OCR + walidacja"],
    changes: [
      {
        kind: "feature",
        text: "D1 Skaner Nakazu — bezpłatne wczytanie nakazu zapłaty z analizą AI (sygnatura, kwota, sąd, terminy).",
      },
      {
        kind: "feature",
        text: "D2 Sprzeciw EPU — pełny generator pisma z walidacją Haiku (7-punktowa lista kontrolna).",
      },
      {
        kind: "feature",
        text: "D5 BIK Fix — wniosek o korektę wpisu w BIK + monitoring 30-dniowego terminu odpowiedzi banku.",
      },
      {
        kind: "improvement",
        text: "OCR fallback: Tesseract.js → AWS Textract gdy confidence <70%.",
      },
    ],
  },
  {
    version: "0.2.0",
    date: "2026-05-07",
    highlights: ["Wizard, terminy, panel"],
    changes: [
      {
        kind: "feature",
        text: "Wizard wielostepowy z auto-save (stan zachowany przy zamknięciu karty).",
      },
      {
        kind: "feature",
        text: "Silnik terminów: cron co 30 min, e-mail D-7/D-3/D-1/D0, SMS na D-1.",
      },
      {
        kind: "feature",
        text: "Panel użytkownika: lista spraw, oś czasu, podgląd dokumentu PDF.",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-05-06",
    highlights: ["MVP — landing, auth, design system"],
    changes: [
      {
        kind: "feature",
        text: "Landing page z modułami D1–D8, cennikiem, FAQ, RODO i regulaminem.",
      },
      {
        kind: "feature",
        text: "Logowanie magic-link (Supabase Auth) + e-mail/hasło.",
      },
      {
        kind: "feature",
        text: "Design system Tarcza: granat (autorytet), zieleń (kontrolowana nadzieja), żelazo (neutralny).",
      },
    ],
  },
];

const KIND_LABEL: Record<ChangeKind, { label: string; tone: string }> = {
  feature: { label: "Nowość", tone: "bg-emerald-100 text-emerald-800" },
  improvement: { label: "Ulepszenie", tone: "bg-dlugomat-100 text-dlugomat-800" },
  fix: { label: "Poprawka", tone: "bg-amber-100 text-amber-800" },
  security: { label: "Bezpieczeństwo", tone: "bg-rose-100 text-rose-800" },
};

function formatPlDate(iso: string): string {
  return new Date(iso + "T00:00:00").toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ChangelogPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <BreadcrumbJsonLd
        items={[
          { name: "Strona główna", url: "/" },
          { name: "Changelog", url: "/changelog" },
        ]}
      />

      <header className="space-y-3 pb-8 border-b border-iron-200">
        <h1 className="text-3xl font-semibold tracking-tight text-dlugomat-900 sm:text-4xl">
          Changelog
        </h1>
        <p className="text-iron-600">
          Co dodaliśmy, co poprawiliśmy. Aktualizowane przy każdym wydaniu.
        </p>
      </header>

      <div className="space-y-12 pt-8">
        {RELEASES.map((release) => (
          <article key={release.version} className="space-y-4">
            <header className="flex flex-wrap items-baseline gap-3">
              <h2 className="text-xl font-semibold text-dlugomat-900">
                v{release.version}
              </h2>
              <time
                dateTime={release.date}
                className="text-sm text-iron-500"
              >
                {formatPlDate(release.date)}
              </time>
            </header>

            {release.highlights.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {release.highlights.map((h) => (
                  <li
                    key={h}
                    className="rounded-full bg-dlugomat-50 px-3 py-1 text-xs font-medium text-dlugomat-800"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}

            <ul className="space-y-2.5">
              {release.changes.map((c, idx) => {
                const meta = KIND_LABEL[c.kind];
                return (
                  <li
                    key={`${release.version}-${idx}`}
                    className="flex gap-3 text-sm text-iron-700"
                  >
                    <span
                      className={`inline-flex h-fit shrink-0 items-center rounded-md px-2 py-0.5 text-xs font-medium ${meta.tone}`}
                    >
                      {meta.label}
                    </span>
                    <span className="leading-relaxed">{c.text}</span>
                  </li>
                );
              })}
            </ul>
          </article>
        ))}
      </div>

      <footer className="mt-16 rounded-lg border border-iron-200 bg-iron-50 p-6 text-sm text-iron-600">
        <p className="font-medium text-iron-700">
          Brakuje czegoś, co byłoby dla Ciebie ważne?
        </p>
        <p className="mt-1">
          Napisz do nas na{" "}
          <a
            href="mailto:kontakt@dlugomat.pl"
            className="font-medium text-dlugomat-700 underline-offset-2 hover:underline"
          >
            kontakt@dlugomat.pl
          </a>{" "}
          — czytamy każdą wiadomość i traktujemy zgłoszenia priorytetowo.
        </p>
      </footer>
    </div>
  );
}
