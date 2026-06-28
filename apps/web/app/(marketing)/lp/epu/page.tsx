import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  FileText,
  Gavel,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Nakaz zaplaty z EPU — co robic? | Dlugomat",
  description:
    "Otrzymales nakaz zaplaty z e-Sadu (EPU)? Sprawdz w 3 minuty czy jest zgodny z prawem i zloz sprzeciw przed uplywem terminu.",
};

const KEY_FACTS = [
  {
    label: "Termin sprzeciwu",
    value: "14 dni",
    description: "Od dnia doreczenia nakazu",
  },
  {
    label: "Skutek braku sprzeciwu",
    value: "Klauzula",
    description: "Nakaz staje sie tytulem egzekucyjnym",
  },
  {
    label: "Czas analizy",
    value: "3 min",
    description: "Pelne sprawdzenie zasadnosci roszczenia",
  },
  {
    label: "Skutecznosc sprzeciwu",
    value: "82%",
    description: "Sprawy wraca do zwyklego trybu sadowego",
  },
];

const CHECKLIST = [
  "Czy wierzyciel istnieje i ma legitymacje czynna?",
  "Czy roszczenie nie jest przedawnione (3 lub 6 lat)?",
  "Czy umowa rzeczywiscie zostala zawarta?",
  "Czy odsetki nie przekraczaja maksymalnych ustawowych?",
  "Czy wezwanie do zaplaty zostalo doreczone?",
  "Czy wlasciwosc miejscowa sadu jest poprawna?",
];

export default function EpuLandingPage() {
  return (
    <div className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <Badge tone="warning" withDot>
          Elektroniczne postepowanie upominawcze
        </Badge>
        <h1 className="mt-3 max-w-3xl font-display text-4xl text-slate-900 sm:text-5xl">
          Otrzymales nakaz zaplaty z e-Sadu (EPU)?
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Masz 14 dni na zlozenie sprzeciwu. W 3 minuty sprawdzimy zasadnosc
          roszczenia i wygenerujemy gotowe pismo procesowe.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild variant="primary" size="lg">
            <Link href="/skaner-nakazu">
              Zeskanuj nakaz z EPU
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="secondary" size="lg">
            <Link href="/kontakt/demo">Konsultacja prawnika</Link>
          </Button>
        </div>
        <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-3.5 w-3.5" />
          82% sprzeciwow generowanych przez Dlugomat skutkuje wycofaniem
          roszczenia lub jego znacznym obnizeniem.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {KEY_FACTS.map((f) => (
            <Card key={f.label} elevation="subtle">
              <CardContent className="py-6">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  {f.label}
                </p>
                <p className="mt-2 font-display text-2xl text-slate-900">
                  {f.value}
                </p>
                <p className="mt-1 text-xs text-slate-600">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <h2 className="font-display text-2xl text-slate-900">
              Co sprawdzamy w Twoim nakazie
            </h2>
            <p className="mt-2 max-w-xl text-slate-600">
              Algorytm Dlugomat analizuje 6 kluczowych aspektow kazdego nakazu z
              EPU. Wystarczy jeden uchybienie wierzyciela by uchylic nakaz.
            </p>
            <ul className="mt-6 space-y-3">
              {CHECKLIST.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <span className="text-sm text-slate-700">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <Card urgency="critical" elevation="pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
                Uwaga na termin
              </CardTitle>
              <CardDescription>14 dni — bez wyjatkow</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700">
                Termin liczy sie od dnia <strong>nastepujacego</strong> po
                doreczeniu nakazu. Jesli wypada w dzien wolny od pracy,
                przesuwa sie na pierwszy roboczy.
              </p>
              <p className="mt-3 text-sm text-slate-700">
                Brak sprzeciwu w terminie oznacza, ze nakaz uprawomocnia sie i
                staje sie podstawa do egzekucji komorniczej.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5" />
                Termin nie podlega przywroceniu po jego uplywie
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gavel className="h-5 w-5 text-slate-500" />
              Jak wyglada sprzeciw od nakazu z EPU
            </CardTitle>
            <CardDescription>
              Gotowy do podpisania PDF, zgodny z wymogami sadu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 text-sm text-slate-700">
              <li>
                <span className="font-medium text-slate-900">1.</span>{" "}
                Oznaczenie sadu (Sad Rejonowy Lublin-Zachod, VI Wydzial Cywilny)
              </li>
              <li>
                <span className="font-medium text-slate-900">2.</span> Sygnatura
                akt sprawy (np. Nc-e 4521/26)
              </li>
              <li>
                <span className="font-medium text-slate-900">3.</span>{" "}
                Oznaczenie stron postepowania
              </li>
              <li>
                <span className="font-medium text-slate-900">4.</span> Tresc
                sprzeciwu z merytorycznym uzasadnieniem
              </li>
              <li>
                <span className="font-medium text-slate-900">5.</span> Wnioski
                dowodowe (opcjonalnie)
              </li>
              <li>
                <span className="font-medium text-slate-900">6.</span> Podpis i
                lista zalacznikow
              </li>
            </ol>
          </CardContent>
        </Card>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <Card elevation="pop" className="bg-slate-900 text-white">
          <CardContent className="flex flex-col items-start gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-display text-xl">Nie zwlekaj. 14 dni mija szybko.</p>
              <p className="mt-1 text-sm text-slate-300">
                Sprawdz nakaz teraz i zloz sprzeciw zanim bedzie za pozno.
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/skaner-nakazu">Zeskanuj nakaz z EPU</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
