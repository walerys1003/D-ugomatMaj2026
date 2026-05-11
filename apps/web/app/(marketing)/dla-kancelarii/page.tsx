import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Długomat dla kancelarii prawnych | Automatyzacja pism procesowych",
  description:
    "Skrócenie czasu pracy o 75%, lepsza marża, więcej spraw obsłużonych. Długomat dla kancelarii indywidualnych i sieciowych.",
};

const PAIN_POINTS = [
  {
    pain: "Powtarzalne pisma zabierają 3-5h",
    solution: "Generator z cytowaniem KC/KPC w 12 minut",
  },
  {
    pain: "Trudno utrzymać aktualność szablonów",
    solution: "Wersjonowanie + automatyczne aktualizacje po zmianach prawa",
  },
  {
    pain: "Klient nie rozumie, na czym stoisz",
    solution: "Portal klienta z timeline'em sprawy i wyjaśnieniami",
  },
  {
    pain: "Trudność w mierzeniu rentowności sprawy",
    solution: "Time-tracking + raporty marżowości per klient/typ sprawy",
  },
];

const FEATURES = [
  {
    title: "Biblioteka 200+ wzorów pism",
    desc: "Sprzeciwy, apelacje, kasacje, wezwania, ugody — wszystkie z aktualnymi cytatami orzecznictwa.",
  },
  {
    title: "Personalizacja pod styl kancelarii",
    desc: "Własne nagłówki, podpisy, klauzule i formatowanie. Brand kit klienta.",
  },
  {
    title: "Współpraca w zespole",
    desc: "Role: partner, associate, paralegal. Komentarze, recenzje, work-in-progress.",
  },
  {
    title: "Integracja z fakturowaniem",
    desc: "iFirma, Fakturownia, własny ERP. Czas pracy → pozycje faktury.",
  },
  {
    title: "Compliance i RODO",
    desc: "Pełen audit log, retencja konfigurowalna, eksport GDPR dla klienta.",
  },
  {
    title: "Białe oznaczenie (Enterprise)",
    desc: "Pisma generowane pod marką Twojej kancelarii, klient nie widzi Długomat.",
  },
];

export default function DlaKancelariiPage() {
  return (
    <main className="bg-iron-50 dark:bg-iron-950 pb-20">
      <section className="bg-white dark:bg-iron-900 border-b border-iron-200 dark:border-iron-800">
        <div className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <p className="text-xs uppercase tracking-wider text-iron-500 mb-3">
            Dla kancelarii prawnych
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-iron-900 dark:text-iron-50 leading-[1.05]">
            Obsłuż 3× więcej spraw
            <br />
            <span className="text-accent-700">bez powiększania zespołu.</span>
          </h1>
          <p className="text-lg md:text-xl text-iron-600 dark:text-iron-300 mt-4 max-w-2xl mx-auto">
            Długomat skraca czas tworzenia pism procesowych o 75%. Twoja kancelaria
            zwiększa marżę bez kompromisu na jakości.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/roi-b2b">
              <Button variant="primary" className="min-w-[200px]">
                Policz ROI dla swojej kancelarii
              </Button>
            </Link>
            <Link href="/kontakt?temat=demo">
              <Button variant="secondary">Umów demo (45 min)</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 text-center mb-10">
          Co rozwiązujemy
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          {PAIN_POINTS.map((p, i) => (
            <Card key={i} elevation="subtle">
              <CardContent className="pt-6 space-y-3">
                <div className="text-sm text-danger-700 dark:text-danger-400 font-medium">
                  ✕ {p.pain}
                </div>
                <div className="text-sm text-accent-700 dark:text-accent-400 font-medium">
                  ✓ {p.solution}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-10 max-w-5xl">
        <h2 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 text-center mb-10">
          Funkcje dla kancelarii
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <Card key={i} elevation="subtle">
              <CardHeader>
                <CardTitle className="text-base">{f.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-iron-600 dark:text-iron-400">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-4xl">
        <Card elevation="pop">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <p className="text-xs uppercase tracking-wider text-iron-500">
              Polecane przez kancelarie
            </p>
            <blockquote className="font-display text-xl md:text-2xl text-iron-900 dark:text-iron-50 max-w-2xl mx-auto leading-relaxed">
              "Długomat skrócił nam czas na sprzeciwy EPU z 4 godzin do 35 minut.
              W kwartale obsłużyliśmy 60% więcej spraw bez nowych etatów."
            </blockquote>
            <div className="text-sm text-iron-600 dark:text-iron-400">
              <strong className="text-iron-900 dark:text-iron-50">
                mec. Anna Kowalska
              </strong>{" "}
              · Partner zarządzający · Kancelaria Kowalska &amp; Partnerzy (Warszawa)
            </div>
            <div className="pt-4 flex flex-wrap gap-2 justify-center">
              <Link href="/case-studies">
                <Button variant="secondary">Więcej case studies</Button>
              </Link>
              <Link href="/kontakt?temat=demo">
                <Button variant="primary">Umów demo</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
