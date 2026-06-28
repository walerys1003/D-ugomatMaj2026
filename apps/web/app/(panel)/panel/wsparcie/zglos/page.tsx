import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, Headphones, MessageSquare, Phone } from "lucide-react";
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
  title: "Zglos zapytanie — Dlugomat",
  description: "Formularz zgloszenia wsparcia z kategorii i SLA.",
};

type Category = {
  value: string;
  label: string;
  sla: string;
  description: string;
};

const CATEGORIES: Category[] = [
  {
    value: "case",
    label: "Pytanie o sprawe",
    sla: "do 4 godzin w dni robocze",
    description: "Pytania merytoryczne dotyczace konkretnej sprawy.",
  },
  {
    value: "tech",
    label: "Problem techniczny",
    sla: "do 1 godziny",
    description: "Bledy aplikacji, problemy z logowaniem, zalaczniki.",
  },
  {
    value: "billing",
    label: "Faktury i platnosci",
    sla: "do 8 godzin",
    description: "Pytania o platnosci, faktury VAT, zwroty.",
  },
  {
    value: "lawyer",
    label: "Konsultacja prawnika",
    sla: "do 24 godzin (rezerwacja)",
    description: "Umow termin rozmowy z mecenasem (15 lub 30 min).",
  },
];

const PRIORITIES: Array<{ value: string; label: string; tone: "info" | "warning" | "danger" }> = [
  { value: "low", label: "Niska", tone: "info" },
  { value: "normal", label: "Normalna", tone: "info" },
  { value: "high", label: "Wysoka", tone: "warning" },
  { value: "urgent", label: "Pilna (termin sadowy)", tone: "danger" },
];

export default function ReportSupportPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/wsparcie"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Wsparcie
        </Link>
        <h1 className="mt-3 font-display text-3xl text-slate-900">
          Zglos zapytanie
        </h1>
        <p className="mt-2 text-slate-600">
          Sredni czas pierwszej odpowiedzi: 47 minut w godzinach 8-20.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Nowe zgloszenie</CardTitle>
            <CardDescription>
              Podaj jak najwiecej szczegolow, aby zespol mogl szybko pomoc.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Kategoria
                </label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.value}
                      className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition has-[:checked]:border-slate-900 has-[:checked]:bg-slate-50"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={cat.value}
                        className="sr-only"
                        defaultChecked={cat.value === "case"}
                      />
                      <p className="font-medium text-slate-900">{cat.label}</p>
                      <p className="mt-1 text-xs text-slate-600">
                        {cat.description}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">SLA: {cat.sla}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                  Priorytet
                </label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITIES.map((p) => (
                    <label
                      key={p.value}
                      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 transition has-[:checked]:border-slate-900 has-[:checked]:bg-slate-900 has-[:checked]:text-white"
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={p.value}
                        className="sr-only"
                        defaultChecked={p.value === "normal"}
                      />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="case-id"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Sprawa (opcjonalnie)
                </label>
                <select
                  id="case-id"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                >
                  <option value="">— nie dotyczy konkretnej sprawy —</option>
                  <option value="spr-001">I Nc 4521/26 — Provident Polska</option>
                  <option value="spr-002">I C 882/26 — Bank Pekao S.A.</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="subject"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Temat
                </label>
                <input
                  id="subject"
                  type="text"
                  placeholder="Krotki opis problemu"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Opis
                </label>
                <textarea
                  id="message"
                  rows={6}
                  placeholder="Opisz szczegolowo z czym potrzebujesz pomocy."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Maks. 5000 znakow. Mozesz zalaczyc do 5 plikow (po 10 MB).
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-6">
                <p className="text-xs text-slate-500">
                  Wysylajac zgloszenie akceptujesz politykę przetwarzania danych.
                </p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" type="button">
                    Zapisz szkic
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Wyslij zgloszenie
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Inne kanaly</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="inline-flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-slate-400" />
                +48 22 100 50 50 (8-20)
              </p>
              <p className="inline-flex items-center gap-2 text-slate-700">
                <MessageSquare className="h-4 w-4 text-slate-400" />
                Czat w aplikacji (8-22)
              </p>
              <p className="inline-flex items-center gap-2 text-slate-700">
                <Headphones className="h-4 w-4 text-slate-400" />
                Dyzur prawnika (pn-pt)
              </p>
            </CardContent>
          </Card>

          <Card urgency="warning">
            <CardContent className="flex gap-3 py-5">
              <AlertCircle className="mt-0.5 h-5 w-5 text-amber-600" />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Termin sadowy do 3 dni?
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  Wybierz priorytet &quot;Pilna&quot; i zaznacz sprawe. Zespol
                  prawny reaguje w 30 minut.
                </p>
                <div className="mt-3">
                  <Badge tone="warning" withDot>
                    Tryb pilny
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
