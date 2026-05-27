import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, Info, PlayCircle } from "lucide-react";

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
  title: "Nowe zadanie cykliczne — Harmonogram",
  robots: { index: false, follow: false },
};

const TASK_TYPES = [
  { id: "report", label: "Raport okresowy", desc: "Wyślij e-mail z raportem (CSV/PDF)" },
  { id: "cleanup", label: "Cleanup danych", desc: "Usuwanie wygasłych sesji, tokenów" },
  { id: "sync", label: "Synchronizacja", desc: "Synchronizacja z systemem zewnętrznym" },
  { id: "billing", label: "Billing", desc: "Generowanie faktur, naliczenia" },
  { id: "notification", label: "Notyfikacja", desc: "Wysyłka powiadomień e-mail/SMS/push" },
  { id: "backup", label: "Backup", desc: "Backup bazy danych / S3" },
];

const CRON_PRESETS = [
  { value: "0 6 * * *", label: "Codziennie o 06:00" },
  { value: "0 6 * * 1", label: "W poniedziałki o 06:00" },
  { value: "0 0 1 * *", label: "1. dnia miesiąca o 00:00" },
  { value: "*/15 * * * *", label: "Co 15 minut" },
  { value: "0 */6 * * *", label: "Co 6 godzin" },
];

const inputCls =
  "w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-dlugomat-900 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus";

export default function NoweZadaniePage() {
  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/harmonogram"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do harmonogramu
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Admin · harmonogram · nowe zadanie
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Nowe zadanie cykliczne
        </h1>
        <p className="max-w-2xl text-iron-600">
          Skonfiguruj zadanie wykonywane automatycznie według harmonogramu cron.
          Wszystkie zadania są logowane do audytu.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>1. Typ zadania</CardTitle>
          <CardDescription>Wybierz kategorię operacji</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <legend className="sr-only">Typ zadania</legend>
            {TASK_TYPES.map((t) => (
              <label
                key={t.id}
                className="flex items-start gap-3 rounded-md border border-iron-200 p-4 cursor-pointer hover:bg-iron-50 has-[:checked]:border-dlugomat-700 has-[:checked]:bg-dlugomat-50"
              >
                <input type="radio" name="task_type" value={t.id} className="mt-1" />
                <div>
                  <p className="font-medium text-dlugomat-900">{t.label}</p>
                  <p className="text-xs text-iron-500">{t.desc}</p>
                </div>
              </label>
            ))}
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Podstawowe dane</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-dlugomat-900">Nazwa zadania</span>
              <input type="text" className={`${inputCls} mt-1`} placeholder="np. Raport tygodniowy płatności" />
            </label>
            <label className="block sm:col-span-2">
              <span className="text-sm font-medium text-dlugomat-900">Opis</span>
              <textarea className={`${inputCls} mt-1 min-h-[80px]`} placeholder="Krótki opis — co robi zadanie i dla kogo." />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-dlugomat-900">Właściciel</span>
              <input type="email" className={`${inputCls} mt-1`} defaultValue="admin@dlugomat.pl" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-dlugomat-900">Strefa czasowa</span>
              <select className={`${inputCls} mt-1`} defaultValue="Europe/Warsaw">
                <option>Europe/Warsaw</option>
                <option>UTC</option>
                <option>Europe/London</option>
              </select>
            </label>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <Calendar className="mr-2 inline h-4 w-4" aria-hidden />
            3. Harmonogram (cron)
          </CardTitle>
          <CardDescription>Wybierz preset lub wpisz własne wyrażenie cron</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {CRON_PRESETS.map((p) => (
              <button
                key={p.value}
                type="button"
                className="rounded-md border border-iron-200 bg-white p-3 text-left transition hover:bg-iron-50 focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <p className="font-mono text-xs text-dlugomat-900">{p.value}</p>
                <p className="mt-1 text-xs text-iron-500">{p.label}</p>
              </button>
            ))}
          </div>

          <label className="block">
            <span className="text-sm font-medium text-dlugomat-900">Wyrażenie cron</span>
            <input
              type="text"
              className={`${inputCls} mt-1 font-mono`}
              defaultValue="0 6 * * 1"
              placeholder="np. 0 6 * * 1"
            />
            <span className="mt-1 block text-xs text-iron-500">
              Format: minuta godzina dzień-miesiąca miesiąc dzień-tygodnia
            </span>
          </label>

          <Card urgency="normal">
            <CardContent className="flex items-start gap-3 p-4 text-sm">
              <Info className="mt-0.5 h-4 w-4 text-dlugomat-700 flex-shrink-0" aria-hidden />
              <div>
                <p className="font-medium text-dlugomat-900">Następne wykonania</p>
                <ul className="mt-1 space-y-0.5 text-iron-700 font-mono text-xs">
                  <li>2026-05-12 06:00 (poniedziałek)</li>
                  <li>2026-05-19 06:00 (poniedziałek)</li>
                  <li>2026-05-26 06:00 (poniedziałek)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Konfiguracja wykonania</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-dlugomat-900">Maksymalny czas (timeout)</span>
              <select className={`${inputCls} mt-1`} defaultValue="600">
                <option value="60">1 minuta</option>
                <option value="300">5 minut</option>
                <option value="600">10 minut</option>
                <option value="1800">30 minut</option>
                <option value="3600">1 godzina</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-dlugomat-900">Liczba prób</span>
              <select className={`${inputCls} mt-1`} defaultValue="3">
                <option value="1">Bez ponawiania</option>
                <option value="3">3 próby</option>
                <option value="5">5 prób</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-dlugomat-900">Backoff przy błędzie</span>
              <select className={`${inputCls} mt-1`} defaultValue="exponential">
                <option value="linear">Liniowy (1, 2, 3 min)</option>
                <option value="exponential">Wykładniczy (1, 2, 4 min)</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-dlugomat-900">Powiadomienia przy błędzie</span>
              <select className={`${inputCls} mt-1`} defaultValue="email">
                <option value="email">E-mail (właściciel)</option>
                <option value="slack">Slack #ops</option>
                <option value="pagerduty">PagerDuty</option>
                <option value="none">Brak</option>
              </select>
            </label>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-start gap-3">
            <Clock className="mt-1 h-5 w-5 text-dlugomat-700" aria-hidden />
            <div>
              <p className="font-semibold text-dlugomat-950">Gotowe do publikacji</p>
              <p className="text-sm text-iron-600">
                Po zapisaniu zadanie zostanie zarejestrowane w schedulerze i wykonane
                przy najbliższej zgodnej dacie wg cron.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="info">Tryb suchy: dostępny</Badge>
            <Button variant="ghost">
              <PlayCircle className="mr-2 h-4 w-4" aria-hidden />
              Uruchom test
            </Button>
            <Button variant="success">Zapisz zadanie</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
