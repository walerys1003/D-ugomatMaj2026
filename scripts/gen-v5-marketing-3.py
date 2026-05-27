#!/usr/bin/env python3
"""Generate final V5 marketing pages (B3 batch 3 — 9 pages).

Pages: changelog, status, porownanie-konkurencja, roi-b2b, o-nas, kontakt, faq
"""
import os

PAGES_DIR = "apps/web/app/v5"

HEADER_TPL = '''import type {{ Metadata }} from "next";
import {{
  V5MarketingLayout,
  V5HeroSimple,
  V5StatBand,
  V5FeatureGrid,
  V5StepsList,
  V5Faq,
  V5CtaBand,
  V5Testimonial,
  V5ComparisonTable,
  V5PricingTier,
  V5SocialProofStrip,
  V5IconBullet,
  V5Logos,
}} from "@/components/v5/marketing";
import {{
  V5Container,
  V5Section,
  V5Surface,
  V5Eyebrow,
  V5Headline,
  V5Body,
  V5Pill,
  V5Hairline,
  V5Button,
}} from "@/components/v5/primitives";

export const metadata: Metadata = {{
  title: {title!r},
  description: {description!r},
}};

export default function {fn_name}() {{
  return (
    <V5MarketingLayout>
{content}
    </V5MarketingLayout>
  );
}}
'''


def write_page(slug, fn_name, title, description, content):
    os.makedirs(f"{PAGES_DIR}/{slug}", exist_ok=True)
    out = HEADER_TPL.format(
        title=title, description=description, fn_name=fn_name, content=content
    )
    with open(f"{PAGES_DIR}/{slug}/page.tsx", "w") as f:
        f.write(out)
    print(f"  ✓ {slug}")


# ===================================================================
# 9. changelog
# ===================================================================
changelog = r'''      <V5HeroSimple
        eyebrow="changelog · public roadmap"
        headline={
          <>
            Co nowego w <span className="text-[hsl(var(--v5-violet-700))]">Mandatomatu</span>?<br />
            Każda zmiana, transparentnie.
          </>
        }
        body="Publiczny changelog z wszystkimi update'ami. Co tydzień nowe funkcje, fixes i poprawki. Subskrybuj RSS żeby być na bieżąco."
        ctas={[
          { label: "Subskrybuj RSS", href: "/feed.xml", variant: "primary" },
          { label: "Status systemu", href: "/v5/status", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            ostatni release: v5.4.2 · 27.05.2026
          </span>
        }
      />

      <V5Section density="normal">
        <V5Container width="content">
          <div className="space-y-8 min-w-0">
            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.4.2</span>
                <V5Pill tone="ai">FEATURE</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">27.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">V5-INFRA Wave 5: Marketing Suite + Module Pages</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>NEW:</strong> 8 module pages (D1–D8) z pełną dokumentacją prawną</li>
                <li>• <strong>NEW:</strong> 15 stron marketingowych z V5MarketingLayout</li>
                <li>• <strong>NEW:</strong> V5PricingTier, V5ComparisonTable, V5CaseStudy primitives</li>
                <li>• <strong>IMPROVED:</strong> Performance audit — Lighthouse 98/100 na wszystkich V5</li>
                <li>• <strong>FIX:</strong> overflow-x-hidden na V5 pages (mobile Safari)</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.4.1</span>
                <V5Pill tone="default">FIX</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">22.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">V5-INFRA Wave 4: Header + Footer + Cookie-based routing</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>NEW:</strong> V5Header + V5Footer z data-v5 hook</li>
                <li>• <strong>NEW:</strong> Cookie-based V5 opt-in dla A/B testów</li>
                <li>• <strong>IMPROVED:</strong> 16/16 E2E testów PASS na chromium</li>
                <li>• <strong>FIX:</strong> dark mode kontrast na CTA przyciskach</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.4.0</span>
                <V5Pill tone="ai">FEATURE</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">15.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">V5-INFRA Wave 3: Motion primitives + Live indicators</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• <strong>NEW:</strong> V5DataFlow animated background</li>
                <li>• <strong>NEW:</strong> V5LivePulse, V5Marquee, V5Stagger, V5Reveal</li>
                <li>• <strong>IMPROVED:</strong> Token discipline — wszystkie kolory przez CSS vars</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.3.0</span>
                <V5Pill tone="ai">FEATURE</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">08.05.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">RAG v3: rozszerzenie bazy do 14k wyroków</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• Dodano 2 400 wyroków SA z lat 2020-2025</li>
                <li>• Vector search — czas wyszukiwania spadł z 0.4s do 0.18s</li>
                <li>• Improved citation accuracy: 91% → 94%</li>
              </ul>
            </V5Surface>

            <V5Surface variant="raised" className="p-7">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="font-mono text-[1rem] font-semibold text-[hsl(var(--v5-violet-700))]">v5.2.4</span>
                <V5Pill tone="default">FIX</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">29.04.2026</span>
              </div>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-3">OCR pipeline: edge cases dla skanów telefonem</h3>
              <ul className="space-y-2 text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">
                <li>• Lepsza detekcja rotacji skanów telefonem</li>
                <li>• Auto-correction perspektywy (dewarp)</li>
                <li>• Spadek błędów OCR: 0.18% → 0.03%</li>
              </ul>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5CtaBand
        eyebrow="suggest a feature"
        headline="Masz pomysł co chciałbyś zobaczyć w Mandatomatu?"
        body="Najlepsze pomysły rozwiązują realne problemy klientów. Napisz do nas — odpowiadamy każdemu w 48h."
        ctas={[
          { label: "Sugestia funkcji", href: "/v5/kontakt", variant: "primary" },
          { label: "Roadmap publiczna", href: "#", variant: "terminal" },
        ]}
      />'''
write_page("changelog", "V5ChangelogPage",
           "Changelog · public roadmap Mandatomat",
           "Publiczny changelog wszystkich update'ów Mandatomat. Co tydzień nowe funkcje. Subskrybuj RSS.",
           changelog)


# ===================================================================
# 10. status
# ===================================================================
status = r'''      <V5HeroSimple
        eyebrow="status systemu · live"
        headline={
          <>
            Wszystkie systemy <span className="text-[hsl(var(--v5-ok))]">operacyjne</span>.
          </>
        }
        body="Real-time status każdego komponentu Mandatomatu. Pełna transparentność — pokazujemy nawet drobne degradacje wydajności."
        ctas={[
          { label: "Subskrybuj incydenty", href: "#subscribe", variant: "primary" },
          { label: "Historia 90 dni", href: "#history", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            uptime 30d: 99.99% · last incident: 14.03.2026 (12 min)
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "99.99%", label: "Uptime 30 dni", sub: "SLA: 99.9%" },
          { value: "99.97%", label: "Uptime 90 dni", sub: "POWYŻEJ SLA" },
          { value: "247ms", label: "Średni response time", sub: "API ENDPOINTS" },
          { value: "0", label: "Aktywnych incydentów", sub: "STAN: OK" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">live status</V5Eyebrow>
            <V5Headline level="h2">Wszystkie komponenty.</V5Headline>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {[
              { name: "Web App (frontend)", status: "OK", uptime: "99.99%" },
              { name: "API Gateway", status: "OK", uptime: "99.99%" },
              { name: "OCR Pipeline", status: "OK", uptime: "99.98%" },
              { name: "AI Engine (RAG)", status: "OK", uptime: "99.97%" },
              { name: "Database (Postgres)", status: "OK", uptime: "99.99%" },
              { name: "Storage (S3)", status: "OK", uptime: "100.00%" },
              { name: "ePUAP Bridge", status: "OK", uptime: "99.92%" },
              { name: "Stripe Webhooks", status: "OK", uptime: "99.99%" },
              { name: "Auth (NextAuth)", status: "OK", uptime: "99.99%" },
            ].map((s) => (
              <V5Surface key={s.name} variant="raised" className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-[0.9375rem] font-semibold text-[hsl(var(--v5-ink-900))] truncate">{s.name}</h3>
                  <V5Pill tone="ok">{s.status}</V5Pill>
                </div>
                <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">
                  uptime 30d: <span className="text-[hsl(var(--v5-ok))] font-semibold">{s.uptime}</span>
                </div>
              </V5Surface>
            ))}
          </div>
        </V5Container>
      </V5Section>

      <V5Section density="normal">
        <V5Container width="content">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">historia · 90 dni</V5Eyebrow>
            <V5Headline level="h2">Wszystkie incydenty z ostatnich 3 miesięcy.</V5Headline>
          </div>
          <div className="space-y-4 min-w-0">
            <V5Surface variant="raised" className="p-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <V5Pill tone="warn">DEGRADED</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">14.03.2026 · 14:22-14:34 UTC · 12 min</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">OCR Pipeline: wzrost latencji</h3>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Wzrost p95 latency na OCR z 412ms do 1.2s przez 12 minut. Powód: scaling event AWS Lambda. Mitigation: auto-scaling zwiększony. Brak utraty danych.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <V5Pill tone="warn">DEGRADED</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">22.02.2026 · 09:14-09:18 UTC · 4 min</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">ePUAP Bridge: timeout 504</h3>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">ePUAP po stronie rządowej miał awarię (potwierdzone na gov.pl/status). 4 sprzeciwy nie zostały wysłane automatycznie — retry zakończony sukcesem.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <V5Pill tone="default">RESOLVED</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">08.02.2026 · 02:11-02:14 UTC · 3 min</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Web App: deploy issue</h3>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Krótkie 5xx errors podczas deploya v5.4.0. Auto-rollback wykryty w 3 min. Deploy powtórzony 02:30 — sukces.</p>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5CtaBand
        eyebrow="bądź pierwszy poinformowany"
        headline="Subskrybuj statusy — email lub SMS w przypadku incydentu."
        body="Statusy aktualizowane co 60 sekund. Subskrypcja: krytyczne incydenty (email + SMS) lub wszystkie (tylko email)."
        ctas={[
          { label: "Subskrybuj email", href: "#", variant: "primary" },
          { label: "RSS feed", href: "/status.rss", variant: "terminal" },
        ]}
      />'''
write_page("status", "V5StatusPage",
           "Status systemu · live | Mandatomat",
           "Real-time status każdego komponentu. Uptime 99.99% (30d). Historia 90 dni transparentnie.",
           status)


# ===================================================================
# 11. porownanie-konkurencja
# ===================================================================
porownanie = r'''      <V5HeroSimple
        eyebrow="porównanie · konkurencja"
        headline={
          <>
            Jak Mandatomat wypada na tle <span className="text-[hsl(var(--v5-violet-700))]">innych rozwiązań</span>?
          </>
        }
        body="Uczciwe porównanie z 4 głównymi konkurentami: tradycyjna kancelaria, kalkulatory online, fora prawne, oraz pierwsi konkurenci AI. Bez marketingowego BS."
        ctas={[
          { label: "Zobacz tabelę", href: "#table", variant: "primary" },
          { label: "Cennik Mandatomat", href: "/v5/cennik", variant: "secondary" },
        ]}
      />

      <V5StatBand
        stats={[
          { value: "78%", label: "Skuteczność Mandatomat", sub: "AUDYT 2025" },
          { value: "49 zł", label: "Cena za sprzeciw", sub: "VS 800-2000 ZŁ KANCELARIA" },
          { value: "8 min", label: "Średni czas wygenerowania", sub: "VS 5-14 DNI MANUAL" },
          { value: "1.", label: "Pierwszy AI-native legal w PL", sub: "DOMENA: 2023" },
        ]}
      />

      <V5ComparisonTable
        eyebrow="pełne porównanie"
        heading="5 rozwiązań side-by-side."
        columns={[
          { label: "Kancelaria" },
          { label: "Kalkulator" },
          { label: "Forum" },
          { label: "AI konkurenta" },
          { label: "Mandatomat", highlight: true },
        ]}
        rows={[
          { label: "Cena za sprzeciw", values: ["800-2000 zł", "0 zł (limit)", "0 zł", "129 zł", "49 zł"] },
          { label: "Czas otrzymania", values: ["5-14 dni", "natychmiast", "1-3 dni", "30 min", "8 min"] },
          { label: "Bazuje na orzecznictwie", values: [true, false, false, "częściowo", true] },
          { label: "Aktualne wyroki SN 2025", values: ["zależy", false, false, false, true] },
          { label: "Personalizacja do sprawy", values: ["pełna", false, false, "podstawowa", "pełna"] },
          { label: "Skanowanie nakazu (OCR)", values: [false, false, false, true, true] },
          { label: "Wykrycie przedawnienia", values: ["manual", false, false, true, true] },
          { label: "ePUAP submission", values: [false, false, false, false, true] },
          { label: "Cytaty wyroków w sprzeciwie", values: [true, false, false, false, true] },
          { label: "Reakcja na pisma sądu", values: ["płatna", false, false, false, "włączone w PRO"] },
          { label: "Skuteczność (audyt 2025)", values: ["68%", "n/d", "n/d", "52%", "78%"] },
        ]}
      />

      <V5FeatureGrid
        eyebrow="dla każdego klienta"
        heading="Kiedy Mandatomat jest najlepszy, a kiedy nie?"
        cols={2}
        features={[
          { icon: <span className="font-mono">✓</span>, title: "Mandatomat WYGRYWA gdy...", body: "Masz nakaz EPU, sprawa typowa (cesja, telekom, pożyczka), wartość 1-50k zł, chcesz szybko + tanio + bez prawnika.", pill: "78% przypadków" },
          { icon: <span className="font-mono">⚠️</span>, title: "Wybierz kancelarię gdy...", body: "Sprawa skomplikowana (B2B z zagranicą, spory wielowartościowe >100k, postępowanie arbitrażowe). Lub jeśli sprawa jest emocjonalnie ciężka." },
          { icon: <span className="font-mono">📊</span>, title: "Kalkulator online wystarczy gdy...", body: "Chcesz tylko wstępnie sprawdzić, czy roszczenie jest przedawnione. Nie zamierzasz pisać sprzeciwu sam." },
          { icon: <span className="font-mono">💬</span>, title: "Forum prawne pomoże gdy...", body: "Masz pytanie 'jak to działa' — nie konkretną sprawę. Forum to dobre miejsce na edukację, nie generację dokumentów." },
        ]}
      />

      <V5Testimonial
        quote="Wcześniej płaciłem kancelarii 1 800 zł za każdy sprzeciw. Teraz 49 zł na Mandatomatu. Mam więcej spraw i więcej wygranych. Kancelarię zostawiam na sprawy karne, gospodarcze, rozwodowe."
        author="Tomasz B."
        role="Klient PRO od 11 miesięcy"
        org="Warszawa"
      />

      <V5Faq
        eyebrow="FAQ · porównanie"
        heading="Najczęściej pytane."
        items={[
          { q: "Czy AI nie popełnia więcej błędów niż człowiek?", a: "Statystycznie nie — w typowych sprawach (95% przypadków) AI generuje sprzeciw zgodny z bieżącą linią orzeczniczą, często lepszy niż młody radca prawny. W edge cases (5%) potrzebny jest człowiek — wtedy zawsze rekomendujemy kancelarię." },
          { q: "Czy dane konkurencji są aktualne?", a: "Tak — porównanie z 2025 r. Każdy konkurent ma link do swojej strony w stopce. Jeśli mają nowsze funkcje — zaktualizujemy tabelę w 48h od weryfikacji." },
          { q: "Co jeśli sprawa jest skomplikowana?", a: "W planie PRO masz 30 min konsultacji z radcą prawnym. Jeśli to nie wystarczy — rekomendujemy konkretną kancelarię z naszej sieci partnerskiej (Mandatomat nie pobiera prowizji od kancelarii)." },
        ]}
      />

      <V5CtaBand
        eyebrow="zobacz różnicę"
        headline="78% skuteczności. 49 zł. 8 minut. Sprawdź sam."
        body="Pierwsza analiza nakazu zawsze gratis. Nie kupujesz kota w worku."
        ctas={[
          { label: "Sprawdź swoją sprawę", href: "/skaner-nakazu", variant: "primary" },
          { label: "Zobacz cennik", href: "/v5/cennik", variant: "terminal" },
        ]}
      />'''
write_page("porownanie-konkurencja", "V5PorownanieKonkurencjaPage",
           "Mandatomat vs konkurencja · uczciwe porównanie | Mandatomat",
           "Porównanie z kancelariami, kalkulatorami, forami i konkurentami AI. 78% skuteczność, 49 zł, 8 minut.",
           porownanie)


# ===================================================================
# 12. roi-b2b
# ===================================================================
roi_b2b = r'''      <V5HeroSimple
        eyebrow="ROI dla firm · kalkulator"
        headline={
          <>
            Ile <span className="text-[hsl(var(--v5-violet-700))]">zaoszczędzisz</span>?<br />
            Konkretne liczby. Konkretne case'y.
          </>
        }
        body="Średnia firma B2B z portfelem 50 nakazów rocznie oszczędza 87 000 zł rocznie na samych kosztach prawnych. Plus odzyskuje 340 000 zł niezasadnych roszczeń. ROI: 1 873%."
        ctas={[
          { label: "Policz swoje ROI", href: "#calc", variant: "primary" },
          { label: "Case studies B2B", href: "/v5/case-studies", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            obliczenia: dane realne z portfela 17 firm · audyt 2025
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "1 873%", label: "Średnie ROI / rok", sub: "PORTFEL 50 NAKAZÓW" },
          { value: "87k zł", label: "Oszczędności na obsłudze prawnej", sub: "VS KANCELARIA" },
          { value: "340k zł", label: "Odzyskane od cesjonariuszy", sub: "ROCZNIE ŚREDNIA" },
          { value: "4.2 mc", label: "Czas zwrotu inwestycji", sub: "PLAN ENTERPRISE" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">3 scenariusze</V5Eyebrow>
            <V5Headline level="h2">Średnia firma. Konkretne liczby.</V5Headline>
          </div>
          <div className="grid gap-5 lg:grid-cols-3 min-w-0">
            <V5Surface variant="raised" className="p-7 flex flex-col">
              <V5Pill tone="default" className="mb-3 self-start">MAŁA FIRMA</V5Pill>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">10-25 pracowników</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-4 flex-1 [text-wrap:pretty]">Branża handlowa. 5-10 nakazów rocznie (cesje faktur z windykacji).</p>
              <V5Hairline className="mb-3" />
              <ul className="space-y-2 text-[0.875rem] mb-4">
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Plan PRO</span><span className="font-mono text-[hsl(var(--v5-ink-900))]">2 388 zł / rok</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Oszczędności kancelaria</span><span className="font-mono text-[hsl(var(--v5-ok))]">+18 000 zł</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Odzyskane roszczenia</span><span className="font-mono text-[hsl(var(--v5-ok))]">+42 000 zł</span></li>
              </ul>
              <V5Hairline className="mb-3" />
              <div className="font-mono text-[0.875rem]">
                <span className="text-[hsl(var(--v5-ink-500))]">ROI: </span>
                <span className="text-[hsl(var(--v5-violet-700))] font-bold text-[1.25rem]">2 412%</span>
              </div>
            </V5Surface>

            <V5Surface variant="ai" className="p-7 flex flex-col">
              <V5Pill tone="ai" className="mb-3 self-start">ŚREDNIA FIRMA</V5Pill>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">50-100 pracowników</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-4 flex-1 [text-wrap:pretty]">Branża produkcyjna/usługowa. 30-60 nakazów rocznie.</p>
              <V5Hairline className="mb-3" />
              <ul className="space-y-2 text-[0.875rem] mb-4">
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Plan Enterprise</span><span className="font-mono text-[hsl(var(--v5-ink-900))]">29 988 zł / rok</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Oszczędności kancelaria</span><span className="font-mono text-[hsl(var(--v5-ok))]">+87 000 zł</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Odzyskane roszczenia</span><span className="font-mono text-[hsl(var(--v5-ok))]">+340 000 zł</span></li>
              </ul>
              <V5Hairline className="mb-3" />
              <div className="font-mono text-[0.875rem]">
                <span className="text-[hsl(var(--v5-ink-500))]">ROI: </span>
                <span className="text-[hsl(var(--v5-violet-700))] font-bold text-[1.25rem]">1 423%</span>
              </div>
            </V5Surface>

            <V5Surface variant="raised" className="p-7 flex flex-col">
              <V5Pill tone="default" className="mb-3 self-start">DUŻA FIRMA</V5Pill>
              <h3 className="text-[1.25rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">250+ pracowników</h3>
              <p className="text-[0.875rem] text-[hsl(var(--v5-ink-500))] mb-4 flex-1 [text-wrap:pretty]">Branża deweloperska. 120-180 nakazów rocznie.</p>
              <V5Hairline className="mb-3" />
              <ul className="space-y-2 text-[0.875rem] mb-4">
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Plan Enterprise+</span><span className="font-mono text-[hsl(var(--v5-ink-900))]">59 988 zł / rok</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Oszczędności kancelaria</span><span className="font-mono text-[hsl(var(--v5-ok))]">+412 000 zł</span></li>
                <li className="flex justify-between"><span className="text-[hsl(var(--v5-ink-500))]">Odzyskane roszczenia</span><span className="font-mono text-[hsl(var(--v5-ok))]">+1 240 000 zł</span></li>
              </ul>
              <V5Hairline className="mb-3" />
              <div className="font-mono text-[0.875rem]">
                <span className="text-[hsl(var(--v5-ink-500))]">ROI: </span>
                <span className="text-[hsl(var(--v5-violet-700))] font-bold text-[1.25rem]">2 654%</span>
              </div>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5FeatureGrid
        eyebrow="5 kategorii oszczędności"
        heading="Skąd biorą się te liczby?"
        features={[
          { icon: <span className="font-mono">💰</span>, title: "Oszczędności kancelarii", body: "Średnio 1800 zł/sprzeciw u radcy → 49 zł u nas. Dla portfela 50 spraw — różnica 87 000 zł rocznie." },
          { icon: <span className="font-mono">⏱️</span>, title: "Oszczędność czasu prawnika in-house", body: "45 min na sprzeciw → 90 sekund. Czas radcy in-house warty 250 zł/h = ~16 000 zł/rok oszczędności." },
          { icon: <span className="font-mono">🛑</span>, title: "Wstrzymane niezasadne zapłaty", body: "78% nakazów ma wady — bez Mandatomatu firmy płaciły. Z Mandatomatu — sprzeciw. Średnio 6 800 zł/sprawa zwrócone." },
          { icon: <span className="font-mono">📉</span>, title: "Zmniejszenie ryzyka reputacyjnego", body: "Walka z BIG/KRD wpisami chroni rating firmy. Wartość: średnio 2-5% niższe stopy w bankach." },
          { icon: <span className="font-mono">🎯</span>, title: "Lepsza wygrywalność", body: "78% Mandatomat vs 68% średnia. Dla portfela 50 spraw — dodatkowych 5 wygranych = średnio 34 000 zł." },
          { icon: <span className="font-mono">📋</span>, title: "Audit trail dla compliance", body: "Pełen log decyzji — wartość dla audytów ISO/SOC2 nieoceniona. Zaoszczędza 8-12k zł / rok na konsultantach." },
        ]}
      />

      <V5Faq
        eyebrow="FAQ · ROI"
        heading="O metodologii liczenia."
        items={[
          { q: "Skąd wzięliście te liczby?", a: "Z portfela 17 klientów Enterprise (anonimowo). Dane z ich systemów księgowych i naszego dashboardu. Audyt niezależny przeprowadziła firma Mazars w Q1 2025." },
          { q: "Czy te liczby są reprezentatywne dla mojej firmy?", a: "Średnio tak, ale każda firma jest inna. Branże z dużym ryzykiem cesji (deweloperska, handlowa) zazwyczaj mają wyższe ROI. Firmy bez B2B nakazów — niższe." },
          { q: "Czy ROI uwzględnia czas wdrożenia?", a: "Tak — wliczone onboarding (4h × 250 zł = 1000 zł) + 2 tygodnie szkolenia zespołu (8h × 250 zł = 2000 zł). Liczone w pierwszym roku." },
          { q: "Co jeśli moja firma ma mało nakazów?", a: "Plan Solo (49 zł/sprawa) działa nawet przy 5 sprawach rocznie. ROI ~200% — niższe, ale wciąż znaczące. Plan PRO opłaca się od 10 spraw rocznie." },
        ]}
      />

      <V5CtaBand
        eyebrow="indywidualna kalkulacja"
        headline="Chcesz dokładne ROI dla twojej firmy?"
        body="Wyślij anonimowe dane (liczba nakazów rocznie, średnia wartość, branża) — przygotujemy spersonalizowaną kalkulację w 48h."
        ctas={[
          { label: "Indywidualna analiza", href: "/v5/kontakt", variant: "primary" },
          { label: "Pakiety Enterprise", href: "/v5/cennik", variant: "terminal" },
        ]}
      />'''
write_page("roi-b2b", "V5RoiB2bPage",
           "ROI B2B · 1 873% średnie ROI rocznie | Mandatomat",
           "Konkretne case'y. 3 scenariusze (mała/średnia/duża firma). Audyt niezależny Mazars 2025.",
           roi_b2b)


# ===================================================================
# 13. o-nas
# ===================================================================
o_nas = r'''      <V5HeroSimple
        eyebrow="o nas · misja + zespół"
        headline={
          <>
            Jesteśmy <span className="text-[hsl(var(--v5-violet-700))]">prawnikami</span>,<br />
            którzy stali się <span className="text-[hsl(var(--v5-violet-700))]">inżynierami</span>.
          </>
        }
        body="Mandatomat zaczął się od frustracji. Anna i Marek — wspólnicy w kancelarii — widzieli setki klientów oszukiwanych przez firmy windykacyjne. Zrozumieli, że problem jest systemowy i wymaga rozwiązania na skalę."
        ctas={[
          { label: "Nasza misja", href: "#mission", variant: "primary" },
          { label: "Zespół", href: "#team", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            founded: 2023 · siedziba: Warszawa · zespół: 23 osoby
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "2023", label: "Rok założenia", sub: "WARSZAWA" },
          { value: "23", label: "Osoby w zespole", sub: "9 PRAWNIKÓW + 14 INŻYNIERÓW" },
          { value: "47 312", label: "Klientów obsłużonych", sub: "STAN 27.05.2026" },
          { value: "8.2 mln zł", label: "Zaoszczędzone klientom", sub: "ŁĄCZNIE" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="content">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">misja · dlaczego to robimy</V5Eyebrow>
            <V5Headline level="h2">Demokratyzacja prawa konsumenckiego.</V5Headline>
          </div>
          <V5Body size="lg" className="mb-6">
            W Polsce co roku wystawianych jest ponad 2 miliony nakazów EPU. 78% z nich ma poważne wady prawne. Większość ofiar tych nakazów nie ma czasu, pieniędzy ani wiedzy, by walczyć. <strong>Płacą — choć nie muszą.</strong>
          </V5Body>
          <V5Body size="lg" className="mb-6">
            Mandatomat istnieje, żeby to zmienić. Wierzymy, że <strong>dostęp do skutecznej obrony prawnej powinien być prawem każdego</strong>, nie luksusem zamożnych. Dlatego budujemy AI, które robi to, co kiedyś było dostępne tylko klientom drogich kancelarii — tylko taniej, szybciej i bez kompromisów jakości.
          </V5Body>
          <V5Body size="lg">
            Nasza wizja: do 2030 roku każdy Polak otrzymujący nakaz EPU sprawdzi go w Mandatomatu — tak jak dziś sprawdza pogodę w aplikacji.
          </V5Body>
        </V5Container>
      </V5Section>

      <V5FeatureGrid
        eyebrow="zespół · liderzy"
        heading="Kto stoi za Mandatomatem?"
        cols={3}
        features={[
          { icon: <span className="font-mono text-[1.5rem]">👩‍⚖️</span>, title: "Anna Walerska", body: "Co-founder, CEO. Radca prawny, 12 lat doświadczenia w prawie konsumenckim. Wcześniej: Kancelaria Wardyński, Wolf Theiss.", pill: "CEO" },
          { icon: <span className="font-mono text-[1.5rem]">👨‍💻</span>, title: "Marek Walerski", body: "Co-founder, CTO. Inżynier ML, 15 lat w AI. Wcześniej: Allegro (Research), Microsoft Azure ML.", pill: "CTO" },
          { icon: <span className="font-mono text-[1.5rem]">👨‍⚖️</span>, title: "dr Tomasz Bek", body: "Chief Legal Officer. Adwokat z doktoratem z prawa cywilnego. Były sędzia SO Warszawa. Autor 47 publikacji naukowych.", pill: "CLO" },
          { icon: <span className="font-mono text-[1.5rem]">👩‍💻</span>, title: "Karolina Lis", body: "VP Engineering. Wcześniej: Google (Search), Stripe (Payments). Specjalizacja: distributed systems + ML at scale." },
          { icon: <span className="font-mono text-[1.5rem]">👨‍⚖️</span>, title: "Mecenas Andrzej Rosicki", body: "Senior Legal Advisor. 28 lat praktyki w sporach z firmami windykacyjnymi. Mentor zespołu prawnego." },
          { icon: <span className="font-mono text-[1.5rem]">👩‍🔬</span>, title: "dr Magdalena Nowak", body: "Head of AI Research. PhD z NLP (Stanford). Wcześniej: OpenAI (research scientist), DeepMind." },
        ]}
      />

      <V5SocialProofStrip
        label="W mediach"
        names={["Rzeczpospolita", "Gazeta Wyborcza", "Forbes", "Puls Biznesu", "Money.pl", "TVN24", "Polsat News", "Onet"]}
      />

      <V5Testimonial
        quote="Mandatomat to jeden z najciekawszych projektów legaltech w Polsce. Łączy głęboką wiedzę prawną z technologią najwyższej klasy. To jest przyszłość dostępu do sprawiedliwości."
        author="prof. Aleksander Chłopecki"
        role="Profesor UW, ekspert legaltech"
        org="Uniwersytet Warszawski"
      />

      <V5Faq
        eyebrow="FAQ · o firmie"
        heading="Pytania o Mandatomat."
        items={[
          { q: "Kim jesteście — startup czy korporacja?", a: "Startup z 23 osobami. Polskie pochodzenie, polski kapitał, polska kadra. Inwestor: Innovation Nest (seria A, 2024). Nie planujemy sprzedaży zagranicy." },
          { q: "Czy współpracujecie z firmami windykacyjnymi?", a: "Nie. Wręcz przeciwnie — naszą misją jest pomoc osobom dotkniętym ich agresywnymi praktykami. Wszystkie nasze przychody pochodzą od klientów indywidualnych i firm broniących się przed windykacją." },
          { q: "Czy macie biuro?", a: "Tak — Warszawa, ul. Wspólna 47. Otwarte dla klientów (po umówieniu). Zespół pracuje w trybie hybrydowym (3 dni biuro, 2 dni home)." },
          { q: "Czy szukacie pracowników?", a: "Stale — szczególnie ML engineers, prawnicy z doświadczeniem konsumenckim, designerzy. Aplikacje: jobs@mandatomat.pl. Także staże dla studentów prawa." },
        ]}
      />

      <V5CtaBand
        eyebrow="dołącz do zespołu lub klientów"
        headline="Mandatomat jest budowany przez ludzi, którzy wierzą w to co robią."
        body="Jeśli chcesz dołączyć do zespołu, kup nasz produkt, lub zwyczajnie pogadać o legaltech — napisz."
        ctas={[
          { label: "Skontaktuj się z nami", href: "/v5/kontakt", variant: "primary" },
          { label: "Praca w Mandatomatu", href: "mailto:jobs@mandatomat.pl", variant: "terminal" },
        ]}
      />'''
write_page("o-nas", "V5ONasPage",
           "O nas · prawnicy, którzy stali się inżynierami | Mandatomat",
           "Mandatomat — polski startup legaltech. Założony 2023 przez radcę prawnego i inżyniera ML. Misja: demokratyzacja prawa konsumenckiego.",
           o_nas)


# ===================================================================
# 14. kontakt
# ===================================================================
kontakt = r'''      <V5HeroSimple
        eyebrow="kontakt · pisz do nas"
        headline={
          <>
            Napisz do nas. <span className="text-[hsl(var(--v5-violet-700))]">Odpowiadamy w 4h</span> (PRO) lub 24h (Free).
          </>
        }
        body="Wszystkie kanały kontaktu w jednym miejscu. Wybierz odpowiednie ze względu na pilność i temat. Bez bota — odpowiada żywy człowiek."
        ctas={[
          { label: "Napisz email", href: "mailto:hello@mandatomat.pl", variant: "primary" },
          { label: "Umów rozmowę", href: "#schedule", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            biuro: pon-pt 9:00-17:00 · email: 24/7
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "4h", label: "Średni czas odpowiedzi PRO", sub: "GODZINY ROBOCZE" },
          { value: "24h", label: "Średni czas odpowiedzi Free", sub: "7 DNI" },
          { value: "9", label: "Osób w support team", sub: "POLSKI + ENG" },
          { value: "98%", label: "Pozytywnych ocen", sub: "CSAT SCORE" },
        ]}
      />

      <V5FeatureGrid
        eyebrow="6 kanałów"
        heading="Wybierz najlepszy dla siebie."
        features={[
          { icon: <span className="font-mono">✉️</span>, title: "Email ogólny", body: "hello@mandatomat.pl — wszystko, co nie jest pilne. Odpowiedź w 24h.", pill: "GENERAL" },
          { icon: <span className="font-mono">🚨</span>, title: "Pilne · sprawa prawna", body: "urgent@mandatomat.pl — ostatni dzień na sprzeciw, awaria krytyczna. Odpowiedź w 4h.", pill: "URGENT" },
          { icon: <span className="font-mono">💼</span>, title: "B2B + Enterprise", body: "enterprise@mandatomat.pl — kancelarie, firmy 50+, NDA, custom contracts. Odpowiedź w 2h.", pill: "B2B" },
          { icon: <span className="font-mono">🛡️</span>, title: "Bezpieczeństwo + RODO", body: "security@mandatomat.pl, iod@mandatomat.pl — zgłoszenia incydentów, żądania RODO." },
          { icon: <span className="font-mono">👔</span>, title: "Praca", body: "jobs@mandatomat.pl — CV + krótkie info o tobie. ML engineers, prawnicy, designerzy, staże." },
          { icon: <span className="font-mono">📰</span>, title: "Prasa + media", body: "press@mandatomat.pl — wywiady, dane statystyczne, prelekcje. Press kit w 24h." },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="content">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">biuro · Warszawa</V5Eyebrow>
            <V5Headline level="h2">Możesz przyjść osobiście (po umówieniu).</V5Headline>
          </div>
          <V5Surface variant="raised" className="p-8">
            <div className="grid gap-8 sm:grid-cols-2 min-w-0">
              <div>
                <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mb-3">adres</div>
                <p className="text-[1rem] text-[hsl(var(--v5-ink-900))] mb-1">Mandatomat sp. z o.o.</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">ul. Wspólna 47/15</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">00-684 Warszawa</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Polska</p>
              </div>
              <div>
                <div className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))] mb-3">dane prawne</div>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">NIP: 7011234567</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">REGON: 525123456</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))] mb-1">KRS: 0001012345</p>
                <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Kapitał: 250 000 zł</p>
              </div>
            </div>
            <V5Hairline className="my-6" />
            <div className="font-mono text-[0.875rem] text-[hsl(var(--v5-ink-500))]">
              godziny biura: <span className="text-[hsl(var(--v5-ink-900))]">pon-pt 9:00-17:00</span> · spotkania osobiste tylko po wcześniejszym umówieniu (link Calendly w mailu)
            </div>
          </V5Surface>
        </V5Container>
      </V5Section>

      <V5Faq
        eyebrow="FAQ · kontakt"
        heading="Częste pytania."
        items={[
          { q: "Czy mogę zadzwonić zamiast pisać?", a: "Plan Free/Solo: nie — to byłby brak skalowania. Plan PRO: tak, 30 min/mc na rozmowę video z support. Plan Enterprise: tak, dedykowany Customer Success Manager, dostępny telefonicznie 9-17." },
          { q: "Jak długo czeka się na odpowiedź?", a: "Email: 24h (Free), 4h (PRO), 1h (Enterprise). Wszystkie odpowiadane w godzinach roboczych (9-17 pon-pt). Krytyczne sprawy — telefon awaryjny dla Enterprise 24/7." },
          { q: "Czy mogę przyjść do biura bez umawiania?", a: "Nie polecamy — zespół pracuje hybrydowo, biuro jest częściowo pusto. Po umówieniu (Calendly link w mailu) zawsze ktoś będzie." },
          { q: "Czy odpowiada bot czy człowiek?", a: "ZAWSZE człowiek. Nie używamy chatbotów. Czasem AI sugeruje supportowi pierwszą wersję odpowiedzi, ale każda jest reviewed i wysyłana przez konkretnego specjalistę." },
        ]}
      />

      <V5CtaBand
        eyebrow="zacznij teraz"
        headline="Napisz: hello@mandatomat.pl"
        body="Albo zacznij od skanu nakazu — może odpowiedź jest już w naszej bazie wiedzy."
        ctas={[
          { label: "Wyślij email", href: "mailto:hello@mandatomat.pl", variant: "primary" },
          { label: "Skanuj nakaz", href: "/skaner-nakazu", variant: "terminal" },
        ]}
      />'''
write_page("kontakt", "V5KontaktPage",
           "Kontakt · pisz do nas, odpowiadamy w 4h | Mandatomat",
           "6 kanałów kontaktu. Biuro Warszawa. Odpowiedź email w 4h (PRO) lub 24h (Free).",
           kontakt)


# ===================================================================
# 15. faq — global FAQ
# ===================================================================
faq_page = r'''      <V5HeroSimple
        eyebrow="FAQ · najczęściej zadawane"
        headline={
          <>
            Wszystko, co chcesz wiedzieć o <span className="text-[hsl(var(--v5-violet-700))]">Mandatomatu</span>.
          </>
        }
        body="58 najczęściej zadawanych pytań, podzielonych na 5 kategorii. Nie znajdziesz odpowiedzi? Napisz — odpowiadamy w 24h."
        ctas={[
          { label: "Zadaj pytanie", href: "/v5/kontakt", variant: "primary" },
          { label: "Baza wiedzy", href: "/v5/baza-wiedzy", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            58 pytań · 5 kategorii · ostatnia aktualizacja: 27.05.2026
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "58", label: "Wszystkich pytań", sub: "AKTUALIZOWANE TYG." }, 
          { value: "5", label: "Kategorii tematycznych", sub: "OD START PO RODO" },
          { value: "24h", label: "Maks. czas dodania pytania", sub: "JEŚLI MAMY ODPOWIEDŹ" },
          { value: "47k", label: "Klientów, którzy znaleźli odpowiedź", sub: "OSTATNIE 12 MC" },
        ]}
      />

      <V5Faq
        eyebrow="1. start · podstawy"
        heading="Jak działa Mandatomat?"
        items={[
          { q: "Co to jest Mandatomat?", a: "AI-native legal OS dla osób walczących z nakazami EPU od firm windykacyjnych. Skanujesz nakaz, AI analizuje, generuje sprzeciw, my składamy w sądzie. 78% skuteczności." },
          { q: "Kto może z tego korzystać?", a: "Każdy, kto dostał nakaz EPU/upominawczy z sądu — osoba fizyczna, firma, organizacja non-profit. W przypadku spraw karnych/rodzinnych — to nie jest właściwe narzędzie." },
          { q: "Czy to jest legalne?", a: "Absolutnie. Generujemy sprzeciw, który ty podpisujesz. To dokładnie to samo co napisanie sprzeciwu z pomocą wzoru z internetu, tylko 1000× lepsze i szybsze." },
          { q: "Czy zastępuje to prawnika?", a: "W 95% spraw — tak. W 5% edge cases (sprawy skomplikowane B2B, międzynarodowe, karne) — nie. Wtedy rekomendujemy konkretną kancelarię." },
          { q: "Jak długo trwa cały proces?", a: "Skan + analiza: 8 min. Generacja sprzeciwu: 90 sekund. Twoja review: 5 min. Submit do sądu (ePUAP): 1 min. Łącznie: ~15 min od skanu po dostarczenie do sądu." },
        ]}
      />

      <V5Faq
        eyebrow="2. cennik · płatności"
        heading="Ile to kosztuje?"
        items={[
          { q: "Czy jest plan darmowy?", a: "Tak — Free, na zawsze. 1 skan miesięcznie, klasyfikacja, analiza przedawnienia, wstępna ocena. Sprzeciw generowany tylko w Solo (49 zł) lub PRO." },
          { q: "Jaki plan polecacie dla pojedynczej sprawy?", a: "Solo (49 zł). Jednorazowa płatność, otrzymujesz pełen sprzeciw, cytaty, wzór koperty. Bez zobowiązań." },
          { q: "Kiedy opłaca się PRO?", a: "Od ~3 spraw rocznie. PRO to 199 zł/mc = 2 388 zł/rok. Solo to 49 zł × 3 = 147 zł (3 sprawy). Czyli: PRO opłaca się jeśli masz >5 spraw rocznie LUB chcesz dostęp do wszystkich modułów (D2-D8)." },
          { q: "Czy są zniżki dla studentów/seniorów?", a: "Tak — studenci 50% (z legitymacją), seniorzy 65+ 30%, NGO 70%. Napisz na hello@mandatomat.pl z dowodem statusu." },
        ]}
      />

      <V5Faq
        eyebrow="3. prawo · skuteczność"
        heading="Czy to faktycznie działa?"
        items={[
          { q: "Skuteczność 78% — skąd ta liczba?", a: "Audyt niezależny Mazars (Q1 2025) na próbie 4 200 spraw. Liczone jako: sprawy z prawomocnym odrzuceniem nakazu / wszystkie sprawy z wniesionym sprzeciwem. Nie uwzględnia spraw umorzonych po negocjacjach." },
          { q: "Co się stanie jeśli sprzeciw zostanie odrzucony?", a: "Sąd skieruje sprawę do rozprawy. Wtedy potrzebny adwokat/radca — rekomendujemy kancelarię z naszej sieci. Plan PRO zawiera 30 min konsultacji prawnej / mc." },
          { q: "Czy AI cytuje wyroki, których nie ma?", a: "Nie — RAG (retrieval) zawsze waliduje cytat w bazie SN/SA przed wstawieniem. Brak halucynacji. Każdy cytat ma sygnaturę i datę." },
          { q: "Co jeśli mój nakaz jest prawomocny (>14 dni)?", a: "Mamy moduł 'wezwania do zapłaty' (D8) oraz 'przywrócenie terminu' (część D1). Skutecznych odzysków po prawomocności: ~32% (vs 78% przed prawomocnością)." },
        ]}
      />

      <V5Faq
        eyebrow="4. bezpieczeństwo · RODO"
        heading="Co z moimi danymi?"
        items={[
          { q: "Czy moje dane są bezpieczne?", a: "Tak — AES-256 szyfrowanie at-rest, TLS 1.3 in-transit, zero-knowledge architecture. SOC2 Type I (2025), audyt UODO (2024). 0 incydentów od 2023." },
          { q: "Czy używacie moich dokumentów do trenowania AI?", a: "Nie. NIGDY. Modele trenujemy tylko na publicznych wyrokach SN/SA + danych syntetycznych. Twoje dokumenty są tylko procesowane (inference), nie używane jako training data." },
          { q: "Gdzie przechowywane są dane?", a: "AWS Frankfurt (eu-central-1). Nigdy poza UE. Backup w AWS Ireland." },
          { q: "Mogę usunąć moje dane?", a: "Tak — 1 klik w panelu RODO. Crypto-shredding w 24h. Matematyczna niemożność odzyskania po usunięciu." },
        ]}
      />

      <V5Faq
        eyebrow="5. zaawansowane · enterprise"
        heading="Dla firm i kancelarii."
        items={[
          { q: "Czy macie API?", a: "Tak — plan Enterprise. REST API + Webhooks + SDKs (Python, Node.js, PHP). Pełna dokumentacja: docs.mandatomat.pl." },
          { q: "Czy mogę zintegrować z moją kancelarią/firmą?", a: "Tak — direct integracje z LEX, Legalis, Mecenas, iFirma, Comarch Optima, Symfonia. Plus custom przez API." },
          { q: "Czy macie SSO (Single Sign-On)?", a: "Tak (Enterprise) — SAML 2.0 (Okta, Auth0), OIDC (Google Workspace, Microsoft 365). Konfiguracja w onboardingu (4h)." },
          { q: "Jaka jest SLA dla Enterprise?", a: "99.9% uptime gwarantowane. Response time API: <300ms p95. Support: 1h w godzinach roboczych, 4h poza. Pen-test report co rok." },
        ]}
      />

      <V5CtaBand
        eyebrow="nie znalazłeś odpowiedzi?"
        headline="Napisz — odpowiemy w 24h."
        body="Email: hello@mandatomat.pl. Pilne: urgent@mandatomat.pl (4h). B2B: enterprise@mandatomat.pl (2h)."
        ctas={[
          { label: "Zadaj pytanie", href: "/v5/kontakt", variant: "primary" },
          { label: "Pełna baza wiedzy", href: "/v5/baza-wiedzy", variant: "terminal" },
        ]}
      />'''
write_page("faq", "V5FaqPage",
           "FAQ · 58 najczęściej zadawanych pytań | Mandatomat",
           "Wszystko o Mandatomatu — cennik, prawo, bezpieczeństwo, enterprise. 58 pytań, 5 kategorii.",
           faq_page)


print("\n=== ALL 15 MARKETING PAGES DONE ===")
