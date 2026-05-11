import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Długomat dla działów windykacji | Skuteczność i compliance",
  description:
    "Skalowalna obsługa portfela wierzytelności. Automatyzacja EPU, wezwań i ugód. Pełen compliance z KNF i UOKiK.",
};

const KPIS = [
  { value: "78%", label: "skuteczność EPU" },
  { value: "12 min", label: "średni czas generowania pisma" },
  { value: "3,2×", label: "wzrost obsługiwanych spraw" },
  { value: "0", label: "incydentów RODO w 2025" },
];

const CAPABILITIES = [
  {
    title: "Masowe generowanie EPU",
    desc: "Import portfela z CSV/Excel, walidacja danych, generowanie tysięcy pozwów w trybie batch z pełnym audit trailem.",
  },
  {
    title: "Inteligentny routing spraw",
    desc: "Reguły: kwota > 50k → senior specjalista, sprawa przedawniona → ścieżka ugody. Wszystko konfigurowalne.",
  },
  {
    title: "Workflow zatwierdzania",
    desc: "Maker-checker dla pism powyżej progu kwotowego. Dwa poziomy akceptacji + audit log.",
  },
  {
    title: "Integracja z bankami",
    desc: "BIK monitoring, masowe zapytania do KRD i ERIF, automatyczne sprawdzenie statusu w EPU.",
  },
  {
    title: "Raportowanie dla zarządu",
    desc: "Dashboardy: cure rate, recovery rate, time-to-cash, koszty per portfel. Eksport do BI.",
  },
  {
    title: "Compliance i UOKiK",
    desc: "Każde pismo loguje się do audit chain (HMAC). Komunikacja z dłużnikiem zgodna z dobrymi praktykami KNF.",
  },
];

export default function DlaWindykacjiPage() {
  return (
    <main className="bg-iron-50 dark:bg-iron-950 pb-20">
      <section className="bg-white dark:bg-iron-900 border-b border-iron-200 dark:border-iron-800">
        <div className="container mx-auto px-4 py-16 max-w-5xl">
          <p className="text-xs uppercase tracking-wider text-iron-500 mb-3">
            Dla działów windykacji i firm zarządzających portfelami
          </p>
          <h1 className="font-display text-4xl md:text-6xl font-semibold text-iron-900 dark:text-iron-50 leading-[1.05] max-w-3xl">
            Recovery, którego nie da się zrobić ręcznie.
          </h1>
          <p className="text-lg md:text-xl text-iron-600 dark:text-iron-300 mt-4 max-w-2xl">
            Długomat obsługuje portfele wierzytelności od 100 spraw do 50 000+ z
            zachowaniem compliance i pełnej kontroli operacyjnej.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/kontakt?temat=enterprise">
              <Button variant="primary">Umów rozmowę z konsultantem</Button>
            </Link>
            <Link href="/roi-b2b">
              <Button variant="secondary">Policz ROI</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-iron-200 dark:border-iron-800 bg-white dark:bg-iron-900">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {KPIS.map((k, i) => (
              <div
                key={i}
                className={`text-center md:text-left ${
                  i > 0
                    ? "md:border-l md:border-iron-200 dark:md:border-iron-800 md:pl-6"
                    : ""
                }`}
              >
                <div className="font-display text-3xl md:text-4xl font-semibold text-iron-900 dark:text-iron-50 tabular-nums">
                  {k.value}
                </div>
                <div className="text-xs uppercase tracking-wider text-iron-500 mt-1">
                  {k.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-5xl">
        <h2 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mb-2">
          Możliwości platformy
        </h2>
        <p className="text-iron-600 dark:text-iron-400 mb-10 max-w-2xl">
          Wszystko, czego potrzebuje sprawny dział windykacji — od importu portfela
          po raporty dla zarządu.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {CAPABILITIES.map((c, i) => (
            <Card key={i} elevation="subtle">
              <CardHeader>
                <CardTitle className="text-base">{c.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-iron-600 dark:text-iron-400">{c.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-4xl">
        <Card elevation="pop">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-iron-900 dark:text-iron-50">
              Proof of Concept w 30 dni
            </h2>
            <p className="text-iron-600 dark:text-iron-300 max-w-2xl mx-auto">
              Wgrywamy próbkę 100-500 spraw z Twojego portfela, konfigurujemy reguły,
              uruchamiamy w sandboxie. Po 30 dniach dostajesz raport z mierzalną
              skutecznością — bez zobowiązań.
            </p>
            <Link href="/kontakt?temat=poc">
              <Button variant="primary">Zacznijmy POC</Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
