import type { Metadata } from "next";
import Link from "next/link";
import {
  Archive,
  Banknote,
  FileText,
  Mail,
  Send,
  Users,
  Zap,
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
  title: "Operacje masowe · Admin · Długomat",
};

type Op = {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  scope: string;
  cta: string;
  href: string;
  risk: "low" | "medium" | "high";
};

const OPERATIONS: Op[] = [
  {
    id: "bulk-letter",
    icon: FileText,
    title: "Masowa generacja pism",
    description:
      "Wygeneruj sprzeciwy/odpowiedzi dla segmentu spraw. Workery skalowane do 10k pism/h.",
    scope: "Sprawy",
    cta: "Wybierz segment",
    href: "/admin/operacje-masowe/pisma",
    risk: "medium",
  },
  {
    id: "bulk-invite",
    icon: Users,
    title: "Masowe zaproszenia użytkowników",
    description:
      "CSV z adresami e-mail → pre-utworzenie kont + e-mail z linkiem aktywacyjnym.",
    scope: "Użytkownicy",
    cta: "Wgraj listę",
    href: "/admin/operacje-masowe/zaproszenia",
    risk: "low",
  },
  {
    id: "bulk-billing",
    icon: Banknote,
    title: "Masowe fakturowanie B2B",
    description:
      "Wygenerowanie faktur cyklicznych dla wszystkich klientów Enterprise na koniec okresu.",
    scope: "Płatności",
    cta: "Uruchom cykl",
    href: "/admin/operacje-masowe/fakturowanie",
    risk: "high",
  },
  {
    id: "bulk-email",
    icon: Mail,
    title: "Kampania e-mail segmentowa",
    description:
      "Wyślij komunikat do wybranego segmentu (np. inactive 30d). Soft-throttle 1k/min.",
    scope: "Komunikacja",
    cta: "Utwórz kampanię",
    href: "/admin/kampanie",
    risk: "medium",
  },
  {
    id: "bulk-export",
    icon: Archive,
    title: "Eksport masowy spraw",
    description:
      "ZIP z PDF-ami + CSV manifestu. Maks. 50k spraw na zlecenie, podpisany URL ważny 24h.",
    scope: "Sprawy",
    cta: "Zlecenie eksportu",
    href: "/admin/eksport-danych",
    risk: "low",
  },
  {
    id: "bulk-resend",
    icon: Send,
    title: "Retry wszystkich nieudanych webhooków",
    description:
      "Wymuszenie ponowienia dostarczenia dla całej kolejki DLQ. Backoff zachowany.",
    scope: "Integracje",
    cta: "Wymuś retry",
    href: "/admin/dlq",
    risk: "medium",
  },
];

const RISK_TONE: Record<Op["risk"], "success" | "warning" | "danger"> = {
  low: "success",
  medium: "warning",
  high: "danger",
};

const RISK_LABEL: Record<Op["risk"], string> = {
  low: "Niskie ryzyko",
  medium: "Średnie ryzyko",
  high: "Wysokie ryzyko",
};

export default function OperacjeMasowePage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Skala
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Operacje masowe
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Wszystkie akcje wykonywane na wielu rekordach jednocześnie.
          Każda operacja masowa wymaga potwierdzenia przez 2 administratorów
          (zasada 4 oczu) i wpada do dziennika audytu.
        </p>
      </header>

      <Card elevation="subtle" urgency="warning">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-warn-100 text-warn-600 dark:bg-warn-500/15"
            >
              <Zap className="size-5" />
            </span>
            <div>
              <CardTitle className="text-fluid-base">
                Zasady operacji masowych
              </CardTitle>
              <CardDescription>
                Każda operacja generuje dry-run report (PDF + CSV) przed
                wykonaniem. Operator zatwierdza, drugi admin potwierdza,
                dopiero wtedy uruchamiamy worker.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {OPERATIONS.map((op) => {
          const Icon = op.icon;
          return (
            <Card key={op.id} elevation="subtle" className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <span
                    aria-hidden
                    className="grid size-10 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
                  >
                    <Icon className="size-5" />
                  </span>
                  <Badge tone={RISK_TONE[op.risk]} withDot>
                    {RISK_LABEL[op.risk]}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-fluid-lg">{op.title}</CardTitle>
                <CardDescription>{op.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto flex items-center justify-between">
                <span className="text-fluid-xs text-iron-500">
                  Zakres: {op.scope}
                </span>
                <Button asChild size="sm" variant="secondary">
                  <Link href={op.href}>{op.cta} →</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
