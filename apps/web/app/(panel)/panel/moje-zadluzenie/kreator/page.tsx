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
  title: "Kreator — dodaj zadłużenie",
  description: "Krok po kroku dodaj nowe zadłużenie do swojego portfela.",
};

const STEPS = [
  { id: 1, title: "Typ zadłużenia", description: "Bank, windykator, komornik, inne" },
  { id: 2, title: "Wierzyciel", description: "Dane podmiotu, kontakt, numer sprawy" },
  { id: 3, title: "Kwota i odsetki", description: "Aktualna kwota, oprocentowanie" },
  { id: 4, title: "Dokumenty", description: "Załącz umowę, wezwania, pisma" },
  { id: 5, title: "Podsumowanie", description: "Sprawdzenie danych i zapisanie" },
] as const;

interface PageProps {
  searchParams?: Promise<{ step?: string }>;
}

const inputCls =
  "w-full rounded-md border border-ink-300 bg-white px-3 py-2 text-sm text-dlugomat-900 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus";

export default async function ZadluzenieKreatorPage({ searchParams }: PageProps) {
  const sp = (await searchParams) ?? {};
  const current = Math.min(Math.max(Number(sp.step ?? 1), 1), 5);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/panel/moje-zadluzenie"
          className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900 focus-visible:outline-none focus-visible:shadow-shield-focus rounded"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do listy zadłużeń
        </Link>
      </div>

      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          Krok {current} z {STEPS.length}
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Dodaj zadłużenie
        </h1>
        <p className="max-w-2xl text-ink-600">
          Wypełnij formularz krok po kroku. Dane są szyfrowane i widoczne tylko
          dla Ciebie i przypisanego prawnika.
        </p>
      </header>

      <ol className="flex flex-wrap gap-2" aria-label="Kroki kreatora">
        {STEPS.map((step) => {
          const isDone = step.id < current;
          const isActive = step.id === current;
          return (
            <li key={step.id} className="flex-1 min-w-[160px]">
              <Link
                href={`/panel/moje-zadluzenie/kreator?step=${step.id}`}
                className={`block rounded-md border p-3 transition focus-visible:outline-none focus-visible:shadow-shield-focus ${
                  isActive
                    ? "border-dlugomat-700 bg-dlugomat-50"
                    : isDone
                    ? "border-accent-200 bg-accent-50/50"
                    : "border-ink-200 bg-white"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                      isDone
                        ? "bg-accent-600 text-white"
                        : isActive
                        ? "bg-dlugomat-900 text-white"
                        : "bg-ink-200 text-ink-700"
                    }`}
                    aria-hidden
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : step.id}
                  </span>
                  <span className="text-sm font-semibold text-dlugomat-900">
                    {step.title}
                  </span>
                </div>
                <p className="mt-1 text-xs text-ink-500">{step.description}</p>
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
        <Button variant="ghost" asChild disabled={current === 1}>
          <Link href={`/panel/moje-zadluzenie/kreator?step=${Math.max(current - 1, 1)}`}>
            Wstecz
          </Link>
        </Button>
        {current < STEPS.length ? (
          <Button asChild>
            <Link href={`/panel/moje-zadluzenie/kreator?step=${current + 1}`}>Dalej</Link>
          </Button>
        ) : (
          <Button variant="success">Zapisz zadłużenie</Button>
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
      {hint ? <span className="mt-1 block text-xs text-ink-500">{hint}</span> : null}
    </label>
  );
}

function Step1() {
  const TYPES = [
    { id: "bank", label: "Kredyt bankowy", desc: "Bank lub instytucja finansowa" },
    { id: "windykator", label: "Firma windykacyjna", desc: "BestCollect, Kruk, EOS i inne" },
    { id: "komornik", label: "Egzekucja komornicza", desc: "Komornik prowadzi postępowanie" },
    { id: "telekom", label: "Operator (telekom/energetyka)", desc: "Faktury, rachunki" },
    { id: "alimenty", label: "Alimenty", desc: "Zaległe alimenty" },
    { id: "inne", label: "Inne", desc: "Pożyczki prywatne, mandaty itp." },
  ];

  return (
    <fieldset className="grid gap-3 sm:grid-cols-2">
      <legend className="sr-only">Wybierz typ zadłużenia</legend>
      {TYPES.map((t) => (
        <label
          key={t.id}
          className="flex items-start gap-3 rounded-md border border-ink-200 p-4 cursor-pointer hover:bg-ink-50 has-[:checked]:border-dlugomat-700 has-[:checked]:bg-dlugomat-50"
        >
          <input type="radio" name="debt_type" value={t.id} className="mt-1" />
          <div>
            <p className="font-medium text-dlugomat-900">{t.label}</p>
            <p className="text-xs text-ink-500">{t.desc}</p>
          </div>
        </label>
      ))}
    </fieldset>
  );
}

function Step2() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Nazwa wierzyciela">
        <input type="text" className={inputCls} placeholder="np. mBank S.A." />
      </Field>
      <Field label="NIP wierzyciela" hint="10 cyfr (opcjonalnie)">
        <input type="text" className={inputCls} maxLength={10} />
      </Field>
      <Field label="Numer sprawy/umowy">
        <input type="text" className={inputCls} placeholder="np. 12345/2024" />
      </Field>
      <Field label="Data zawarcia/zaciągnięcia">
        <input type="date" className={inputCls} />
      </Field>
      <Field label="Telefon kontaktowy">
        <input type="tel" className={inputCls} placeholder="+48 ..." />
      </Field>
      <Field label="E-mail">
        <input type="email" className={inputCls} placeholder="kontakt@wierzyciel.pl" />
      </Field>
    </div>
  );
}

function Step3() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Aktualna kwota (PLN)">
        <input type="number" className={inputCls} min={0} step="0.01" placeholder="12400.00" />
      </Field>
      <Field label="Pierwotna kwota zobowiązania (PLN)">
        <input type="number" className={inputCls} min={0} step="0.01" placeholder="20000.00" />
      </Field>
      <Field label="Oprocentowanie roczne (%)" hint="0 jeśli nie wiesz">
        <input type="number" className={inputCls} min={0} max={50} step={0.1} defaultValue={0} />
      </Field>
      <Field label="Status">
        <select className={inputCls} defaultValue="active">
          <option value="active">Aktywne (płacę)</option>
          <option value="overdue">Zaległe (nie płacę)</option>
          <option value="negotiation">W negocjacjach</option>
          <option value="execution">W egzekucji</option>
          <option value="suspended">Zawieszone</option>
        </select>
      </Field>
      <Field label="Data wymagalności">
        <input type="date" className={inputCls} />
      </Field>
      <Field label="Notatka wewnętrzna" hint="Widoczna tylko dla Ciebie">
        <textarea className={`${inputCls} min-h-[80px]`} />
      </Field>
    </div>
  );
}

function Step4() {
  return (
    <div className="space-y-4">
      <Card urgency="normal">
        <CardContent className="flex items-start gap-3 p-5">
          <Info className="mt-1 h-4 w-4 text-dlugomat-700" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-dlugomat-900">Bezpieczeństwo dokumentów</p>
            <p className="text-sm text-ink-600">
              Wszystkie pliki są szyfrowane (AES-256) i przechowywane w EU.
              Dostęp ma tylko Ty i przypisany prawnik.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-lg border-2 border-dashed border-ink-300 bg-ink-50/50 p-8 text-center">
        <p className="font-semibold text-dlugomat-900">Przeciągnij pliki tutaj</p>
        <p className="mt-1 text-sm text-ink-600">
          lub kliknij, aby wybrać z dysku · PDF, JPG, PNG · max 25 MB
        </p>
        <input type="file" multiple className="sr-only" id="file-upload" />
        <label
          htmlFor="file-upload"
          className="mt-4 inline-block rounded-md bg-dlugomat-900 px-4 py-2 text-sm font-medium text-white cursor-pointer focus-within:shadow-shield-focus"
        >
          Wybierz pliki
        </label>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-dlugomat-900">Sugerowane dokumenty</h3>
        <ul className="mt-2 space-y-1 text-sm text-ink-700">
          <li>· Umowa kredytowa lub umowa o świadczenie usług</li>
          <li>· Wezwania do zapłaty</li>
          <li>· Pisma od windykatora/komornika</li>
          <li>· Korespondencja e-mail z wierzycielem</li>
          <li>· Raport BIK (jeśli dotyczy)</li>
        </ul>
      </div>
    </div>
  );
}

function Step5() {
  return (
    <div className="space-y-4">
      <Card urgency="success">
        <CardContent className="flex items-start gap-3 p-5">
          <Check className="mt-1 h-4 w-4 text-accent-700" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-dlugomat-900">
              Wszystkie wymagane pola wypełnione
            </p>
            <p className="text-sm text-ink-700">
              Możesz dodać zadłużenie. Po zapisaniu zostanie ono dodane do listy
              w „Moje zadłużenie".
            </p>
          </div>
        </CardContent>
      </Card>

      <dl className="grid gap-3 sm:grid-cols-2 text-sm">
        <Row label="Typ" value="Kredyt bankowy" />
        <Row label="Wierzyciel" value="mBank S.A." />
        <Row label="Numer sprawy" value="12345/2024" />
        <Row label="Aktualna kwota" value="12 400,00 PLN" />
        <Row label="Pierwotna kwota" value="20 000,00 PLN" />
        <Row label="Oprocentowanie" value="7,5% rocznie" />
        <Row label="Status" value="Aktywne" />
        <Row label="Dokumenty" value="3 pliki (12,4 MB)" />
      </dl>

      <div className="flex flex-wrap gap-2">
        <Badge tone="info">Auto-przypisanie prawnika</Badge>
        <Badge tone="success" withDot>Szyfrowanie AES-256</Badge>
        <Badge tone="neutral">RODO compliant</Badge>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 text-dlugomat-900">{value}</dd>
    </div>
  );
}
