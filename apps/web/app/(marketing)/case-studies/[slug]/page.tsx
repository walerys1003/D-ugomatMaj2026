import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";

interface CaseStudyDetail {
  slug: string;
  client_name: string;
  client_kind: "kancelaria" | "windykacja" | "osoba_prywatna" | "korporacja";
  industry: string;
  headline: string;
  challenge: string;
  solution: string[];
  results: Array<{ metric: string; label: string }>;
  testimonial: { quote: string; author: string; role: string };
  duration_months: number;
  modules_used: string[];
  published_at: string;
}

const DETAILS: Record<string, CaseStudyDetail> = {
  "kancelaria-kowalska-warszawa": {
    slug: "kancelaria-kowalska-warszawa",
    client_name: "Kowalska & Partnerzy",
    client_kind: "kancelaria",
    industry: "Kancelaria prawna · 12 prawników",
    headline: "60% więcej spraw bez nowych etatów",
    challenge:
      "Kancelaria specjalizująca się w sporach konsumenckich miała problem ze skalowaniem: 4 godziny na pojedynczy sprzeciw EPU oznaczało ograniczenie do ok. 45 spraw miesięcznie. Klienci czekali na pisma 5-7 dni roboczych.",
    solution: [
      "Wdrożenie planu Pro z 5 użytkownikami (partner + 4 associate'ów).",
      "Personalizacja szablonów EPU pod styl kancelarii — własne nagłówki, klauzule i podpisy elektroniczne.",
      "Integracja z systemem fakturowym Fakturownia — czas pracy → pozycje faktury.",
      "Szkolenie 2-godzinne dla zespołu (webinar + materiały).",
      "Konfiguracja workflow zatwierdzania: associate przygotowuje, partner akceptuje.",
    ],
    results: [
      { metric: "−72%", label: "czas na sprzeciw EPU" },
      { metric: "+60%", label: "wolumen spraw miesięcznie" },
      { metric: "1,2 dnia", label: "średni TAT pisma (z 6)" },
      { metric: "9,2 / 10", label: "satysfakcja klientów" },
    ],
    testimonial: {
      quote:
        "Długomat skrócił nam czas na sprzeciwy EPU z 4 godzin do 35 minut. W kwartale obsłużyliśmy 60% więcej spraw bez nowych etatów. Klienci wracają i polecają.",
      author: "mec. Anna Kowalska",
      role: "Partner zarządzający",
    },
    duration_months: 6,
    modules_used: ["D1 Sprzeciw EPU", "D2 Przedawnienie", "D4 Ugoda", "AI Asystent"],
    published_at: "2026-02-10",
  },
  "best-recovery-portfel-konsumencki": {
    slug: "best-recovery-portfel-konsumencki",
    client_name: "Best Recovery S.A.",
    client_kind: "windykacja",
    industry: "Zarządzanie wierzytelnościami · 320 osób",
    headline: "Cure rate +18 pp w pół roku",
    challenge:
      "Firma zarządza portfelem 32 000 spraw konsumenckich nabytych od banków. Ręczne generowanie pism było wąskim gardłem; cure rate utrzymywał się na poziomie 14%. Brak ścieżki ugody dla spraw przedawnionych powodował dodatkowe ryzyko UOKiK.",
    solution: [
      "Plan Enterprise z SSO Okta dla 80 użytkowników z różnymi rolami.",
      "Masowy import portfela z systemu wierzytelności (REST API).",
      "Routing reguły: kwota > 50 000 → senior; przedawnione → ścieżka ugody.",
      "Workflow zatwierdzania dla pism powyżej 20 000 zł (maker-checker).",
      "Custom webhook do hurtowni danych BI dla raportów zarządczych.",
    ],
    results: [
      { metric: "+18 pp", label: "wzrost cure rate" },
      { metric: "3,2×", label: "wolumen spraw / FTE" },
      { metric: "0", label: "incydentów RODO" },
      { metric: "12 dni", label: "TAT vs 38 dni (−68%)" },
    ],
    testimonial: {
      quote:
        "Długomat dał nam to, czego nie potrafiły systemy windykacyjne — szybkie, jakościowe pisma z cytowaniem KC i pełną kontrolą operacyjną. Compliance team śpi spokojnie.",
      author: "Tomasz Wiśniewski",
      role: "Dyrektor operacyjny",
    },
    duration_months: 8,
    modules_used: ["D1 EPU", "D2 Przedawnienie", "D4 Ugoda", "D6 BIK", "API REST", "Webhooks"],
    published_at: "2025-12-15",
  },
  "ms-energy-dzial-prawny": {
    slug: "ms-energy-dzial-prawny",
    client_name: "MS Energy",
    client_kind: "korporacja",
    industry: "Energetyka · grupa 3 spółek",
    headline: "Centralizacja windykacji 3 spółek",
    challenge:
      "Grupa energetyczna miała 3 niezależne procesy windykacyjne w 3 spółkach. Brak spójnej polityki, duplikacja narzędzi, koszt 4,2 mln zł rocznie, audity wewnętrzne wskazywały na ryzyko compliance.",
    solution: [
      "Plan Enterprise z SSO Okta i SCIM provisioning.",
      "Multi-tenant: 3 organizacje w jednym tenant'cie z osobnymi ustawieniami.",
      "Custom branding pod markę holdingu + sub-brandy spółek.",
      "Audit chain z HMAC-SHA256, retencja 7 lat.",
      "Integracja z hurtownią danych SAP BW.",
    ],
    results: [
      { metric: "1,8 mln zł", label: "oszczędności rocznie" },
      { metric: "−45%", label: "duplikacja procesów" },
      { metric: "100%", label: "audit coverage" },
      { metric: "ISO 27001", label: "certyfikacja utrzymana" },
    ],
    testimonial: {
      quote:
        "Wreszcie mamy jedną platformę zamiast trzech, z jedną polityką compliance i jednym audytem. Oszczędności znaczne, ryzyko regulacyjne minimalne.",
      author: "Magdalena Lewandowska",
      role: "Dyrektor prawny grupy",
    },
    duration_months: 4,
    modules_used: ["Multi-tenant", "SSO/SCIM", "Audit chain", "Custom workflows"],
    published_at: "2025-10-08",
  },
  "pani-anna-sprzeciw-nakaz": {
    slug: "pani-anna-sprzeciw-nakaz",
    client_name: "Anna J.",
    client_kind: "osoba_prywatna",
    industry: "Osoba prywatna · Kraków",
    headline: "Skutecznie odwołała się od nakazu zapłaty",
    challenge:
      "Pani Anna dostała nakaz zapłaty z e-sądu na 47 320 zł z tytułu zaległego abonamentu sprzed 8 lat. Termin sprzeciwu mijał za 6 dni. Nie miała środków na prawnika ani wiedzy prawniczej.",
    solution: [
      "Założenie darmowego konta w planie Free.",
      "Skanowanie nakazu — OCR rozpoznał strony, kwotę, dług i terminy.",
      "Moduł D2 Przedawnienie wykazał: roszczenie przedawnione (art. 118 KC).",
      "Wygenerowanie sprzeciwu z cytowaniem art. 118 KC i orzecznictwa SN.",
      "Wysyłka do e-sądu via ePUAP w ramach platformy.",
    ],
    results: [
      { metric: "47 320 zł", label: "oddalonego roszczenia" },
      { metric: "22 minuty", label: "od konta do złożenia pisma" },
      { metric: "0 zł", label: "kosztów (plan Free)" },
      { metric: "31 dni", label: "do umorzenia postępowania" },
    ],
    testimonial: {
      quote:
        "Bez Długomat byłabym zmuszona zapłacić dług, którego prawnie już nie ma. Wszystko zrobiłam sama, krok po kroku, z wyjaśnieniem co i dlaczego.",
      author: "Anna J.",
      role: "Klient indywidualny",
    },
    duration_months: 1,
    modules_used: ["D1 Sprzeciw EPU", "D2 Przedawnienie", "Skaner OCR"],
    published_at: "2026-01-20",
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = DETAILS[slug];
  if (!c) return { title: "Case study | Długomat" };
  return {
    title: `${c.client_name} — ${c.headline} | Długomat`,
    description: c.challenge.slice(0, 160),
  };
}

const KIND_LABELS = {
  kancelaria: "Kancelaria",
  windykacja: "Windykacja",
  osoba_prywatna: "Osoba prywatna",
  korporacja: "Korporacja",
};

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = DETAILS[slug];
  if (!c) notFound();

  return (
    <main className="bg-ink-50 dark:bg-ink-950 pb-20">
      <section className="bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link href="/case-studies" className="text-xs text-ink-500 hover:text-ink-700">
            ← Wszystkie case studies
          </Link>
          <div className="mt-3 flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
              {KIND_LABELS[c.client_kind]}
            </span>
            <span className="text-xs text-ink-500">{c.industry}</span>
          </div>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-ink-900 dark:text-ink-50">
            {c.client_name}
          </h1>
          <p className="font-display text-xl md:text-2xl text-accent-700 mt-3">
            {c.headline}
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-4xl grid lg:grid-cols-[1fr_280px] gap-6">
        <div className="space-y-6">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>Wyzwanie</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-ink-700 dark:text-ink-300 leading-relaxed">
                {c.challenge}
              </p>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>Rozwiązanie</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {c.solution.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-ink-700 dark:text-ink-300">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-100 dark:bg-accent-700/20 text-accent-700 flex items-center justify-center text-xs font-semibold">
                      {i + 1}
                    </span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card elevation="pop">
            <CardHeader>
              <CardTitle>Wyniki</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-3">
                {c.results.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-accent-200 dark:border-accent-700/30 bg-accent-50 dark:bg-accent-700/10 px-4 py-3"
                  >
                    <div className="font-display text-2xl font-semibold text-accent-700">
                      {r.metric}
                    </div>
                    <div className="text-xs text-ink-600 dark:text-ink-400 mt-0.5">
                      {r.label}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardContent className="pt-6">
              <blockquote className="font-display text-lg text-ink-900 dark:text-ink-50 leading-relaxed border-l-4 border-accent-600 pl-4">
                "{c.testimonial.quote}"
              </blockquote>
              <div className="text-sm text-ink-600 dark:text-ink-400 mt-3 pl-5">
                <strong className="text-ink-900 dark:text-ink-50">
                  {c.testimonial.author}
                </strong>{" "}
                · {c.testimonial.role}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Wdrożenie</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-500">Czas wdrożenia</div>
                <div className="font-medium text-ink-900 dark:text-ink-50">
                  {c.duration_months} {c.duration_months === 1 ? "miesiąc" : "miesięcy"}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wider text-ink-500 mt-2">
                  Użyte moduły
                </div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {c.modules_used.map((m) => (
                    <span
                      key={m}
                      className="text-xs px-2 py-0.5 rounded-full bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card elevation="pop">
            <CardContent className="pt-5 space-y-3">
              <h3 className="font-display font-semibold text-ink-900 dark:text-ink-50">
                Chcesz podobne wyniki?
              </h3>
              <Link href="/kontakt?temat=demo">
                <Button variant="primary" className="w-full">
                  Umów demo
                </Button>
              </Link>
              <Link href="/roi-b2b">
                <Button variant="secondary" className="w-full">
                  Policz ROI
                </Button>
              </Link>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
