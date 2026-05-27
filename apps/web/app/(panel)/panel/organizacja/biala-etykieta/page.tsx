import type { Metadata } from "next";
import { Image as ImageIcon, Mail, Palette, Sparkles } from "lucide-react";

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
  title: "White-label · Organizacja · Długomat",
};

export default function BialaEtykietaPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
            Organizacja · Enterprise
          </p>
          <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
            White-label
          </h1>
          <p className="mt-1 max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
            Klient nie musi wiedzieć, że korzystasz z Długomatu. Customizujesz
            logo, kolor primary, domenę panelu i nadawcę e-maili.
          </p>
        </div>
        <Badge tone="info" withDot>
          Plan Enterprise
        </Badge>
      </header>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <ImageIcon className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">Identyfikacja wizualna</CardTitle>
          <CardDescription>
            Logo i favicon wyświetlane w panelu klienta zamiast brand Długomat.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Logo (SVG, PNG)"
            helper="Maks. 200 KB · proporcje 4:1 lub 1:1"
            kind="file"
          />
          <Field
            label="Favicon (ICO, PNG)"
            helper="32×32 px lub 64×64 px"
            kind="file"
          />
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Palette className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">Kolor marki</CardTitle>
          <CardDescription>
            Kolor primary użyty w przyciskach, linkach i akcentach.
            Pozostałe kolory dobierane automatycznie z zachowaniem kontrastu WCAG AA.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="HEX primary" helper="np. #1F4E79" kind="text" placeholder="#1F4E79" />
          <Field label="HEX dark mode" helper="(opcjonalne)" kind="text" placeholder="#5B8FC9" />
          <Field label="Nazwa wyświetlana" helper="W stopce e-maili" kind="text" placeholder="Kancelaria Kowalska" />
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Sparkles className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">Custom domena panelu</CardTitle>
          <CardDescription>
            Twoi klienci logują się np. pod{" "}
            <code className="rounded bg-ink-100 px-1.5 py-0.5 font-mono text-fluid-xs dark:bg-dlugomat-900">
              panel.kancelaria-kowalska.pl
            </code>{" "}
            zamiast app.dlugomat.pl. Dodajemy rekord CNAME, certyfikat Let&apos;s Encrypt OK.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Domena (FQDN)"
            helper="np. panel.kancelaria-kowalska.pl"
            kind="text"
            placeholder="panel.twojadomena.pl"
          />
          <Field
            label="Status DNS"
            helper="Wymagany rekord CNAME → app.dlugomat.pl"
            kind="status"
            value="Niezweryfikowana"
          />
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Mail className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">Nadawca e-maili</CardTitle>
          <CardDescription>
            E-maile transakcyjne wychodzą z Twojej domeny. Wymaga konfiguracji SPF, DKIM i DMARC.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Adres From"
            kind="text"
            placeholder="noreply@kancelaria-kowalska.pl"
          />
          <Field label="Nazwa nadawcy" kind="text" placeholder="Kancelaria Kowalska" />
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="secondary">Anuluj zmiany</Button>
        <Button>Zapisz konfigurację</Button>
      </div>
    </div>
  );
}

function Field({
  label,
  helper,
  kind,
  placeholder,
  value,
}: {
  label: string;
  helper?: string;
  kind: "text" | "file" | "status";
  placeholder?: string;
  value?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300">
        {label}
      </span>
      {kind === "file" ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed border-ink-300 bg-ink-50/40 p-3 text-fluid-sm text-ink-500 dark:border-dlugomat-800 dark:bg-dlugomat-900/30">
          <ImageIcon className="size-4" aria-hidden />
          Kliknij lub przeciągnij plik
        </div>
      ) : kind === "status" ? (
        <div className="rounded-lg border border-ink-200 bg-ink-50/40 px-3 py-2 text-fluid-sm dark:border-ink-800 dark:bg-dlugomat-900/30">
          <Badge tone="warning" withDot>
            {value}
          </Badge>
        </div>
      ) : (
        <input
          type="text"
          placeholder={placeholder}
          className="h-11 rounded-lg border border-ink-200 bg-white px-3 text-fluid-sm focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-ink-800 dark:bg-ink-950"
        />
      )}
      {helper ? (
        <span className="text-fluid-xs text-ink-500">{helper}</span>
      ) : null}
    </label>
  );
}
