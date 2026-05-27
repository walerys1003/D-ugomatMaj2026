import type { Metadata } from "next";
import { Download, FileText, ShieldCheck } from "lucide-react";

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
  title: "Zgody RODO · Organizacja · Długomat",
};

type Consent = {
  id: string;
  scope: string;
  description: string;
  granted: boolean;
  signed_by?: string;
  signed_at?: string;
  required: boolean;
};

const CONSENTS: Consent[] = [
  {
    id: "rodo_processing",
    scope: "Przetwarzanie danych klientów",
    description:
      "Wymagana zgoda na przetwarzanie danych osobowych dłużników w celu generowania pism procesowych. Bez tej zgody platforma nie może świadczyć usługi.",
    granted: true,
    signed_by: "Anna Kowalska (Administrator)",
    signed_at: "2025-09-18",
    required: true,
  },
  {
    id: "rodo_dpa",
    scope: "Umowa powierzenia (DPA)",
    description:
      "Standardowa Umowa powierzenia przetwarzania danych zgodna z RODO art. 28.",
    granted: true,
    signed_by: "Anna Kowalska (Administrator)",
    signed_at: "2025-09-18",
    required: true,
  },
  {
    id: "rodo_subprocessors",
    scope: "Lista subprocesorów",
    description:
      "Lista podmiotów przetwarzających dane w naszym imieniu (AWS, Sentry, Stripe). Aktualizacja co najmniej raz na kwartał.",
    granted: true,
    signed_by: "Anna Kowalska (Administrator)",
    signed_at: "2026-04-01",
    required: true,
  },
  {
    id: "rodo_marketing",
    scope: "Marketing produktowy",
    description:
      "Możemy informować Cię o nowych funkcjach, case study i webinarach. W każdej chwili wycofasz zgodę.",
    granted: true,
    signed_by: "Anna Kowalska (Administrator)",
    signed_at: "2025-09-18",
    required: false,
  },
  {
    id: "rodo_research",
    scope: "Anonimowe statystyki branżowe",
    description:
      "Wykorzystanie zanonimizowanych metryk (np. czas generacji pism) do publikacji benchmarków rynkowych.",
    granted: false,
    required: false,
  },
];

export default function ZgodyRodoPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Organizacja · Compliance
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Zgody RODO
        </h1>
        <p className="max-w-2xl text-fluid-base text-ink-600 dark:text-ink-300">
          Wszystkie zgody administratora organizacji w jednym miejscu.
          Pełna historia zmian dostępna w sekcji Audyt.
        </p>
      </header>

      <Card elevation="subtle" urgency="success">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
            >
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <CardTitle className="text-fluid-base">
                Wszystkie wymagane zgody udzielone
              </CardTitle>
              <CardDescription>
                Twoja organizacja jest zgodna z RODO. Możesz w pełni korzystać
                z platformy. Ostatni audyt: 1.04.2026.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-3">
        {CONSENTS.map((c) => (
          <Card key={c.id} elevation="subtle">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-fluid-base">
                      {c.scope}
                    </CardTitle>
                    {c.required ? (
                      <Badge tone="info">Wymagana</Badge>
                    ) : (
                      <Badge tone="neutral">Opcjonalna</Badge>
                    )}
                    <Badge tone={c.granted ? "success" : "warning"} withDot>
                      {c.granted ? "Udzielona" : "Nie udzielona"}
                    </Badge>
                  </div>
                  <CardDescription>{c.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-fluid-xs text-ink-500">
                  {c.granted
                    ? `Udzielona przez ${c.signed_by} · ${c.signed_at}`
                    : "Możesz udzielić zgody w każdej chwili."}
                </span>
                <div className="flex gap-2">
                  {c.granted ? (
                    <Button size="sm" variant="ghost">
                      <Download className="size-4" />
                      Pobierz dowód
                    </Button>
                  ) : null}
                  {c.required ? null : (
                    <Button size="sm" variant={c.granted ? "secondary" : "success"}>
                      {c.granted ? "Wycofaj" : "Udziel zgody"}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <FileText className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-lg">
            Polityka prywatności i regulamin
          </CardTitle>
          <CardDescription>
            Aktualne wersje dokumentów obowiązujących Twoją organizację.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <a href="/polityka-prywatnosci">Polityka prywatności (v3.2)</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/rodo">Polityka RODO (v2.4)</a>
          </Button>
          <Button asChild variant="secondary">
            <a href="/regulamin">Regulamin (v4.0)</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
