import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, CalendarDays, FileText, Gavel, Mail, Phone, Scale, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Szczegoly sprawy — Dlugomat",
  description: "Pelny widok sprawy: chronologia, dokumenty, wierzyciel, akcje.",
};

type CaseDetail = {
  id: string;
  signature: string;
  title: string;
  status: "active" | "negotiation" | "court" | "closed";
  urgency: "critical" | "warning" | "normal";
  creditor: {
    name: string;
    type: string;
    representative: string;
    phone: string;
    email: string;
  };
  debt: {
    principal: number;
    interest: number;
    costs: number;
    total: number;
    currency: "PLN";
  };
  nextDeadline: { date: string; description: string };
  court: string;
  caseNumber: string;
};

const CASES: Record<string, CaseDetail> = {
  "spr-001": {
    id: "spr-001",
    signature: "I Nc 4521/26",
    title: "Nakaz zaplaty — Provident Polska S.A.",
    status: "court",
    urgency: "critical",
    creditor: {
      name: "Provident Polska S.A.",
      type: "Pozyczkodawca",
      representative: "Kancelaria Adwokacka Kowalski i Wspolnicy",
      phone: "+48 22 555 11 22",
      email: "kontakt@kancelaria-kowalski.pl",
    },
    debt: {
      principal: 8400,
      interest: 1245.5,
      costs: 480,
      total: 10125.5,
      currency: "PLN",
    },
    nextDeadline: { date: "2026-05-19", description: "Sprzeciw od nakazu zaplaty" },
    court: "Sad Rejonowy dla Warszawy-Mokotowa",
    caseNumber: "I Nc 4521/26",
  },
};

const fmtPLN = (v: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(v);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

const STATUS_LABEL: Record<CaseDetail["status"], string> = {
  active: "Aktywna",
  negotiation: "Negocjacje",
  court: "Postepowanie sadowe",
  closed: "Zakonczona",
};

const STATUS_TONE: Record<CaseDetail["status"], "neutral" | "info" | "warning" | "success"> = {
  active: "info",
  negotiation: "warning",
  court: "warning",
  closed: "success",
};

async function loadCase(id: string): Promise<CaseDetail | null> {
  return CASES[id] ?? null;
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const caseData = await loadCase(id);
  if (!caseData) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/sprawy"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Wszystkie sprawy
        </Link>
        <div className="mt-4 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[caseData.status]} withDot>
                {STATUS_LABEL[caseData.status]}
              </Badge>
              <span className="text-sm text-slate-500">{caseData.signature}</span>
            </div>
            <h1 className="mt-2 font-display text-3xl text-slate-900">
              {caseData.title}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm">
              Eksport PDF
            </Button>
            <Button variant="primary" size="sm">
              Akcja w sprawie
            </Button>
          </div>
        </div>
      </div>

      {caseData.urgency === "critical" ? (
        <Card urgency="critical" className="mb-8">
          <CardContent className="flex items-start gap-4 py-5">
            <AlertTriangle className="mt-1 h-5 w-5 text-rose-600" />
            <div>
              <p className="font-medium text-slate-900">
                Termin sprzeciwu uplywa za 8 dni
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Brak reakcji oznacza uprawomocnienie nakazu i mozliwosc komornika.
                Skorzystaj z generatora sprzeciwu lub umow konsultacje.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" size="sm">
                  Generuj sprzeciw
                </Button>
                <Button variant="ghost" size="sm">
                  Konsultacja prawnika
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card elevation="subtle" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Kwota zadluzenia</CardTitle>
            <CardDescription>Rozbicie roszczenia wierzyciela</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-slate-500">Naleznosc glowna</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {fmtPLN(caseData.debt.principal)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Odsetki</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {fmtPLN(caseData.debt.interest)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Koszty</dt>
                <dd className="mt-1 font-medium text-slate-900">
                  {fmtPLN(caseData.debt.costs)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Razem</dt>
                <dd className="mt-1 font-display text-xl text-slate-900">
                  {fmtPLN(caseData.debt.total)}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Najblizszy termin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CalendarDays className="h-5 w-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900">
                  {fmtDate(caseData.nextDeadline.date)}
                </p>
                <p className="text-sm text-slate-600">
                  {caseData.nextDeadline.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card elevation="subtle" className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Wierzyciel</CardTitle>
            <CardDescription>{caseData.creditor.type}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="font-medium text-slate-900">{caseData.creditor.name}</p>
            <p className="text-slate-600">
              Reprezentowany przez: {caseData.creditor.representative}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <span className="inline-flex items-center gap-2 text-slate-700">
                <Phone className="h-4 w-4 text-slate-400" />
                {caseData.creditor.phone}
              </span>
              <span className="inline-flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-slate-400" />
                {caseData.creditor.email}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle>Sad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="inline-flex items-center gap-2 text-slate-700">
              <Gavel className="h-4 w-4 text-slate-400" />
              {caseData.court}
            </p>
            <p className="inline-flex items-center gap-2 text-slate-700">
              <Scale className="h-4 w-4 text-slate-400" />
              Sygn. {caseData.caseNumber}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href={`/panel/sprawy/${caseData.id}/chronologia`}
          className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
        >
          <CalendarDays className="mb-2 h-5 w-5 text-slate-500" />
          <p className="font-medium text-slate-900">Chronologia</p>
          <p className="text-sm text-slate-600">Pelna oś zdarzeń sprawy</p>
        </Link>
        <Link
          href={`/panel/sprawy/${caseData.id}/dokumenty`}
          className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
        >
          <FileText className="mb-2 h-5 w-5 text-slate-500" />
          <p className="font-medium text-slate-900">Dokumenty</p>
          <p className="text-sm text-slate-600">12 plików w sprawie</p>
        </Link>
        <Link
          href={`/panel/wsparcie/zglos?case=${caseData.id}`}
          className="rounded-lg border border-slate-200 bg-white p-4 transition hover:border-slate-300"
        >
          <Shield className="mb-2 h-5 w-5 text-slate-500" />
          <p className="font-medium text-slate-900">Konsultacja</p>
          <p className="text-sm text-slate-600">Umow rozmowe z prawnikiem</p>
        </Link>
      </div>
    </div>
  );
}
