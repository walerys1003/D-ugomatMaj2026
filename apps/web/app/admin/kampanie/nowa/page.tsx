import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Megaphone, Target, Mail, Calendar, CheckCircle2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Nowa kampania - Dlugomat Admin",
  description: "Kreator nowej kampanii komunikacyjnej - 5 krokow konfiguracji.",
};

const STEPS = [
  { id: 1, label: "Cel i kanaly", status: "current" as const },
  { id: 2, label: "Segmentacja", status: "upcoming" as const },
  { id: 3, label: "Tresc", status: "upcoming" as const },
  { id: 4, label: "Harmonogram", status: "upcoming" as const },
  { id: 5, label: "Podsumowanie", status: "upcoming" as const },
];

const CHANNELS = [
  { id: "email", label: "Email", description: "Wiadomosci transakcyjne i marketingowe", icon: Mail },
  { id: "sms", label: "SMS", description: "Krotkie powiadomienia tekstowe (limit 160 znakow)", icon: Mail },
  { id: "push", label: "Push (panel)", description: "Powiadomienia w panelu uzytkownika", icon: Mail },
  { id: "ivr", label: "IVR / telefon", description: "Automatyczne polaczenia glosowe", icon: Mail },
];

const GOALS = [
  { id: "education", label: "Edukacja", description: "Onboarding, instrukcje, materialy informacyjne" },
  { id: "retention", label: "Retencja", description: "Aktywacja, przypomnienia, utrzymanie zaangazowania" },
  { id: "compliance", label: "Compliance", description: "Powiadomienia prawne, RODO, regulamin" },
  { id: "conversion", label: "Konwersja", description: "Sprzedaz, upsell, plany platne" },
];

export default function NowaKampaniaPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/kampanie"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do kampanii
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Megaphone className="h-6 w-6 text-accent-600" aria-hidden />
            <h1 className="font-display text-3xl text-dlugomat-950">Nowa kampania</h1>
          </div>
          <p className="text-dlugomat-700 max-w-2xl">
            Krok po kroku skonfiguruj kampanie komunikacyjna z pelna kontrola nad celami, segmentacja i trescia.
          </p>
        </header>

        <nav aria-label="Postep konfiguracji" className="mb-8">
          <ol className="flex items-center gap-2 sm:gap-4 overflow-x-auto pb-2">
            {STEPS.map((step, idx) => (
              <li key={step.id} className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div
                  className={`flex items-center gap-2 ${
                    step.status === "current" ? "text-accent-700" : "text-dlugomat-500"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center h-7 w-7 rounded-full text-xs font-medium ${
                      step.status === "current"
                        ? "bg-accent-600 text-white"
                        : "bg-iron-200 text-dlugomat-700"
                    }`}
                    aria-current={step.status === "current" ? "step" : undefined}
                  >
                    {step.id}
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && <div className="h-px w-6 sm:w-12 bg-iron-300" aria-hidden />}
              </li>
            ))}
          </ol>
        </nav>

        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nazwa kampanii</CardTitle>
              <CardDescription>Wewnetrzna nazwa robocza - nie widoczna dla uzytkownikow</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                placeholder="np. Onboarding nowych dluznikow - maj 2026"
                className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Nazwa kampanii"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent-600" aria-hidden />
                Cel kampanii
              </CardTitle>
              <CardDescription>Wybierz jeden glowny cel biznesowy</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {GOALS.map((goal, idx) => (
                  <label
                    key={goal.id}
                    htmlFor={`goal-${goal.id}`}
                    className="flex items-start gap-3 p-3 rounded-md border border-iron-300 cursor-pointer hover:bg-dlugomat-50 has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="goal"
                      id={`goal-${goal.id}`}
                      defaultChecked={idx === 0}
                      className="mt-1 h-4 w-4 text-accent-600 border-iron-400 focus-visible:shadow-shield-focus"
                    />
                    <div>
                      <div className="font-medium text-dlugomat-950">{goal.label}</div>
                      <div className="text-sm text-dlugomat-700">{goal.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kanaly komunikacji</CardTitle>
              <CardDescription>Mozesz wybrac wiele kanalow - tresc bedzie dostosowana automatycznie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CHANNELS.map((ch, idx) => {
                  const Icon = ch.icon;
                  return (
                    <label
                      key={ch.id}
                      htmlFor={`ch-${ch.id}`}
                      className="flex items-start gap-3 p-3 rounded-md border border-iron-300 cursor-pointer hover:bg-dlugomat-50 has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        id={`ch-${ch.id}`}
                        defaultChecked={idx < 2}
                        className="mt-1 h-4 w-4 text-accent-600 border-iron-400 rounded focus-visible:shadow-shield-focus"
                      />
                      <Icon className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                      <div className="flex-1">
                        <div className="font-medium text-dlugomat-950">{ch.label}</div>
                        <div className="text-sm text-dlugomat-700">{ch.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-accent-600" aria-hidden />
                Wstepny harmonogram
              </CardTitle>
              <CardDescription>Mozesz uszczegolowic w kroku 4</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="kp-start" className="block text-sm font-medium text-dlugomat-900 mb-1">
                    Data startu
                  </label>
                  <input
                    id="kp-start"
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="kp-end" className="block text-sm font-medium text-dlugomat-900 mb-1">
                    Data zakonczenia
                  </label>
                  <input
                    id="kp-end"
                    type="date"
                    className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="text-sm text-dlugomat-800">
                    Po przejsciu do nastepnego kroku zdefiniujesz dokladna segmentacje odbiorcow na podstawie atrybutow,
                    statusu sprawy, planu spaty i innych kryteriow.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white border-t border-iron-200 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden />
              <span className="text-sm text-dlugomat-700">Krok 1 z 5</span>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" asChild>
                <Link href="/admin/kampanie">Anuluj</Link>
              </Button>
              <Button variant="secondary">Zapisz jako szkic</Button>
              <Button variant="primary">Dalej: segmentacja</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
