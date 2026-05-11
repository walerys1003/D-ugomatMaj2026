import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, Info } from "lucide-react";

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
  title: "Nowa promocja — kreator",
  robots: { index: false, follow: false },
};

const STEPS = [
  { id: 1, title: "Podstawy", description: "Nazwa, kod, okres obowiązywania" },
  { id: 2, title: "Reguły", description: "Rabat, próg minimalny, kombinacje" },
  { id: 3, title: "Segmentacja", description: "Plan, region, kanał, grupa" },
  { id: 4, title: "Limity", description: "Globalne i per-użytkownik" },
  { id: 5, title: "Podgląd", description: "Sprawdzenie konfiguracji" },
] as const;

interface PageProps {
  searchParams?: Promise<{ step?: string }>;
}

export default async function NewPromocjaPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const current = Math.min(Math.max(Number(sp.step ?? 1), 1), 5);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/promocje"
          className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Krok {current} z {STEPS.length}
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Nowa promocja
        </h1>
        <p className="max-w-2xl text-iron-600">
          Kreator promocji prowadzi przez konfigurację rabatów, segmentów oraz limitów.
          Wszystkie zmiany są zapisywane w wersjach.
        </p>
      </header>

      {/* Stepper */}
      <ol className="flex flex-wrap gap-2" aria-label="Kroki kreatora">
        {STEPS.map((step) => {
          const isDone = step.id < current;
          const isActive = step.id === current;
          return (
            <li key={step.id} className="flex-1 min-w-[180px]">
              <Link
                href={`/admin/promocje/nowa?step=${step.id}`}
                className={`block rounded-md border p-3 transition focus-visible:outline-none focus-visible:shadow-shield-focus ${
                  isActive
                    ? "border-dlugomat-700 bg-dlugomat-50"
                    : isDone
                    ? "border-accent-200 bg-accent-50/50"
                    : "border-iron-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isDone
                        ? "bg-accent-600 text-white"
                        : isActive
                        ? "bg-dlugomat-900 text-white"
                        : "bg-iron-200 text-iron-700"
                    }`}
                    aria-hidden
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </span>
                  <span className="text-sm font-semibold text-dlugomat-900">
                    {step.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-iron-500">{step.description}</p>
              </Link>
            </li>
          );
        })}
      </ol>

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[current - 1].title}</CardTitle>
          <CardDescription>{STEPS[current - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {current === 1 ? <Step1 /> : null}
          {current === 2 ? <Step2 /> : null}
          {current === 3 ? <Step3 /> : null}
          {current === 4 ? <Step4 /> : null}
          {current === 5 ? <Step5 /> : null}
        </CardContent>
      </Card>

      <nav className="flex items-center justify-between" aria-label="Nawigacja krokami">
        <Button
          variant="ghost"
          asChild
          disabled={current === 1}
        >
          <Link href={`/admin/promocje/nowa?step=${Math.max(current - 1, 1)}`}>
            Wstecz
          </Link>
        </Button>
        {current < STEPS.length ? (
          <Button asChild>
            <Link href={`/admin/promocje/nowa?step=${current + 1}`}>Dalej</Link>
          </Button>
        ) : (
          <Button variant="success">Opublikuj promocję</Button>
        )}
      </nav>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-dlugomat-900">{label}</span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-iron-500">{hint}</span> : null}
    </label>
  );
}

const inputCls =
  "w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-dlugomat-900 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus";

function Step1() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nazwa promocji">
        <input type="text" className={inputCls} defaultValue="Wiosna 2026" />
      </Field>
      <Field label="Kod promocyjny" hint="Wielkie litery, 4-16 znaków">
        <input type="text" className={inputCls} defaultValue="WIOSNA26" />
      </Field>
      <Field label="Data rozpoczęcia">
        <input type="date" className={inputCls} defaultValue="2026-05-15" />
      </Field>
      <Field label="Data zakończenia">
        <input type="date" className={inputCls} defaultValue="2026-06-30" />
      </Field>
      <Field label="Opis wewnętrzny (admin only)" hint="Niewidoczny dla użytkowników">
        <textarea className={`${inputCls} min-h-[80px]`} defaultValue="Kampania sezonowa B2C." />
      </Field>
    </div>
  );
}

function Step2() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Typ rabatu">
        <select className={inputCls} defaultValue="percent">
          <option value="percent">Procentowy</option>
          <option value="fixed">Kwotowy (PLN)</option>
          <option value="trial">Wydłużony okres próbny</option>
        </select>
      </Field>
      <Field label="Wartość rabatu" hint="np. 20 = 20%">
        <input type="number" className={inputCls} defaultValue={20} min={1} max={100} />
      </Field>
      <Field label="Minimalna wartość koszyka (PLN)">
        <input type="number" className={inputCls} defaultValue={99} min={0} />
      </Field>
      <Field label="Czy można łączyć z innymi rabatami">
        <select className={inputCls} defaultValue="no">
          <option value="no">Nie</option>
          <option value="yes">Tak</option>
        </select>
      </Field>
    </div>
  );
}

function Step3() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Plany objęte promocją">
        <select className={inputCls} multiple size={4} defaultValue={["basic", "pro"]}>
          <option value="free">Free</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </Field>
      <Field label="Kanał akwizycji">
        <select className={inputCls} multiple size={4} defaultValue={["paid_search", "partner"]}>
          <option value="organic">Organiczny</option>
          <option value="paid_search">SEM</option>
          <option value="partner">Partner</option>
          <option value="referral">Polecenia</option>
        </select>
      </Field>
      <Field label="Region (PL — województwa)" hint="Puste = cała Polska">
        <input type="text" className={inputCls} defaultValue="" placeholder="np. mazowieckie, śląskie" />
      </Field>
      <Field label="Segment użytkownika">
        <select className={inputCls} defaultValue="new">
          <option value="any">Każdy</option>
          <option value="new">Nowy (0 spraw)</option>
          <option value="returning">Powracający</option>
        </select>
      </Field>
    </div>
  );
}

function Step4() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Limit globalny" hint="Liczba aktywacji na całą kampanię">
        <input type="number" className={inputCls} defaultValue={2000} min={1} />
      </Field>
      <Field label="Limit per użytkownik">
        <input type="number" className={inputCls} defaultValue={1} min={1} max={10} />
      </Field>
      <Field label="Limit per dzień">
        <input type="number" className={inputCls} defaultValue={50} min={0} />
      </Field>
      <Field label="Powiadomienia">
        <select className={inputCls} defaultValue="80">
          <option value="50">Przy 50% wykorzystania</option>
          <option value="80">Przy 80% wykorzystania</option>
          <option value="100">Wyłącznie wyczerpanie</option>
        </select>
      </Field>
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-4">
      <Card urgency="success">
        <CardContent className="flex items-start gap-3 p-5">
          <Info className="mt-1 h-4 w-4 text-accent-700" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-dlugomat-900">
              Konfiguracja gotowa do publikacji
            </p>
            <p className="mt-1 text-sm text-iron-700">
              Wiosna 2026 · kod <strong>WIOSNA26</strong> · 20% rabatu · plany Basic/Pro ·
              limit globalny 2000, per użytkownik 1, ważne 2026-05-15 → 2026-06-30.
            </p>
          </div>
        </CardContent>
      </Card>

      <ul className="space-y-2 text-sm text-iron-700">
        <li className="flex items-center gap-2">
          <Badge tone="success" withDot>OK</Badge> Kod unikalny w systemie
        </li>
        <li className="flex items-center gap-2">
          <Badge tone="success" withDot>OK</Badge> Brak konfliktów z aktywnymi kampaniami
        </li>
        <li className="flex items-center gap-2">
          <Badge tone="info" withDot>info</Badge> Powiadomienia zespołu marketing ustawione
        </li>
      </ul>
    </div>
  );
}
