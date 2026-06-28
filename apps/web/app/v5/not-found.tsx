/**
 * V5-INFRA · 404 not-found (Wave 5 · AGENT B5)
 * ----------------------------------------------------------------
 * Globalny not-found dla /v5/** routes.
 */
import type { Metadata } from "next";
import {
  V5Container,
  V5Section,
  V5Surface,
  V5Eyebrow,
  V5Headline,
  V5Body,
  V5Button,
  V5Pill,
  V5Hairline,
} from "@/components/v5/primitives";
import { V5Footer, V5Header } from "@/components/v5/landing/header";

export const metadata: Metadata = {
  title: "404 · Nie znaleziono strony · Mandatomat V5",
  description: "Strona, której szukasz nie istnieje. Może została przeniesiona.",
  robots: { index: false, follow: false },
};

export default function V5NotFound() {
  return (
    <div className="bg-[hsl(var(--v5-infra-25))] overflow-x-hidden min-h-screen">
      <V5Header />
      <main className="min-w-0">
        <V5Section density="normal">
          <V5Container width="content">
            <V5Surface variant="raised" className="p-10 sm:p-14">
              <div className="flex flex-col items-center text-center">
                <V5Pill tone="warn" className="mb-6">
                  404 · NOT FOUND
                </V5Pill>
                <div className="font-mono text-[5rem] sm:text-[6rem] font-semibold tracking-tight text-[hsl(var(--v5-violet-700))] leading-none mb-4">
                  404
                </div>
                <V5Eyebrow className="mb-4">nie znaleziono · strona</V5Eyebrow>
                <V5Headline level="h1" className="mb-5">
                  Tej strony nie ma w naszym systemie.
                </V5Headline>
                <V5Body size="lg" className="mb-8 max-w-[58ch]">
                  Możliwe, że została przeniesiona, albo masz link z błędem.
                  Sprawdź adres w przeglądarce — lub skorzystaj z linków
                  poniżej.
                </V5Body>
                <V5Hairline className="my-2 w-32" />

                <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mt-4 mb-3">
                  popularne ścieżki
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
                  <V5Button variant="primary" size="lg" asChild>
                    <a href="/v5">Strona główna</a>
                  </V5Button>
                  <V5Button variant="secondary" size="lg" asChild>
                    <a href="/v5/cennik">Cennik</a>
                  </V5Button>
                  <V5Button variant="secondary" size="lg" asChild>
                    <a href="/v5/faq">FAQ</a>
                  </V5Button>
                  <V5Button variant="terminal" size="lg" asChild>
                    <a href="/v5/kontakt">Kontakt</a>
                  </V5Button>
                </div>
              </div>
            </V5Surface>
          </V5Container>
        </V5Section>
      </main>
      <V5Footer />
    </div>
  );
}
