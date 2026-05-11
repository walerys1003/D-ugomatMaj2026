import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Pause,
  TrendingDown,
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
  title: "Plan splaty — Dlugomat",
  description: "Szczegoly planu splaty z harmonogramem rat i postepem.",
};

type Installment = {
  id: string;
  no: number;
  dueDate: string;
  amount: number;
  paid: number;
  status: "paid" | "due" | "upcoming" | "overdue";
};

type PaymentPlan = {
  id: string;
  caseId: string;
  caseSignature: string;
  creditor: string;
  totalAmount: number;
  paidAmount: number;
  installmentsTotal: number;
  installmentsPaid: number;
  startedAt: string;
  endsAt: string;
  status: "active" | "paused" | "completed" | "broken";
  installments: Installment[];
};

const PLANS: Record<string, PaymentPlan> = {
  "ps-001": {
    id: "ps-001",
    caseId: "spr-001",
    caseSignature: "I Nc 4521/26",
    creditor: "Provident Polska S.A.",
    totalAmount: 10125.5,
    paidAmount: 3037.65,
    installmentsTotal: 12,
    installmentsPaid: 3,
    startedAt: "2026-03-15",
    endsAt: "2027-02-15",
    status: "active",
    installments: [
      { id: "i-1", no: 1, dueDate: "2026-03-15", amount: 843.79, paid: 843.79, status: "paid" },
      { id: "i-2", no: 2, dueDate: "2026-04-15", amount: 843.79, paid: 843.79, status: "paid" },
      { id: "i-3", no: 3, dueDate: "2026-05-15", amount: 843.79, paid: 1350.07, status: "paid" },
      { id: "i-4", no: 4, dueDate: "2026-06-15", amount: 843.79, paid: 0, status: "due" },
      { id: "i-5", no: 5, dueDate: "2026-07-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-6", no: 6, dueDate: "2026-08-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-7", no: 7, dueDate: "2026-09-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-8", no: 8, dueDate: "2026-10-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-9", no: 9, dueDate: "2026-11-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-10", no: 10, dueDate: "2026-12-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-11", no: 11, dueDate: "2027-01-15", amount: 843.79, paid: 0, status: "upcoming" },
      { id: "i-12", no: 12, dueDate: "2027-02-15", amount: 843.81, paid: 0, status: "upcoming" },
    ],
  },
};

const STATUS_TONE: Record<
  Installment["status"],
  "success" | "warning" | "neutral" | "danger"
> = {
  paid: "success",
  due: "warning",
  upcoming: "neutral",
  overdue: "danger",
};

const STATUS_LABEL: Record<Installment["status"], string> = {
  paid: "Oplacona",
  due: "Do zaplaty",
  upcoming: "Nadchodzi",
  overdue: "Zalegla",
};

const PLAN_STATUS_TONE: Record<
  PaymentPlan["status"],
  "success" | "warning" | "info" | "danger"
> = {
  active: "info",
  paused: "warning",
  completed: "success",
  broken: "danger",
};

const PLAN_STATUS_LABEL: Record<PaymentPlan["status"], string> = {
  active: "Aktywny",
  paused: "Wstrzymany",
  completed: "Zakonczony",
  broken: "Zerwany",
};

const fmtPLN = (v: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(v);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

async function loadPlan(id: string): Promise<PaymentPlan | null> {
  return PLANS[id] ?? PLANS["ps-001"] ?? null;
}

export default async function PaymentPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const plan = await loadPlan(id);
  if (!plan) return notFound();

  const progress = Math.round((plan.paidAmount / plan.totalAmount) * 100);
  const remaining = plan.totalAmount - plan.paidAmount;
  const nextInstallment = plan.installments.find(
    (i) => i.status === "due" || i.status === "overdue",
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/plan-splaty"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Plany splaty
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-slate-500">#{plan.id}</span>
              <Badge tone={PLAN_STATUS_TONE[plan.status]} withDot>
                {PLAN_STATUS_LABEL[plan.status]}
              </Badge>
            </div>
            <h1 className="mt-2 font-display text-3xl text-slate-900">
              {plan.creditor}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Sprawa {plan.caseSignature} · {fmtDate(plan.startedAt)} -{" "}
              {fmtDate(plan.endsAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Pause className="mr-1 h-4 w-4" />
              Wstrzymaj
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-1 h-4 w-4" />
              Harmonogram PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Postep
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {progress}%
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {plan.installmentsPaid} z {plan.installmentsTotal} rat
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Splacone
            </p>
            <p className="mt-2 font-display text-2xl text-emerald-700">
              {fmtPLN(plan.paidAmount)}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Pozostalo
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPLN(remaining)}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Nastepna rata
            </p>
            <p className="mt-2 font-display text-lg text-slate-900">
              {nextInstallment ? fmtDate(nextInstallment.dueDate) : "—"}
            </p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              {nextInstallment ? fmtPLN(nextInstallment.amount) : "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Postep splaty</CardTitle>
          <CardDescription>
            Pasek przedstawia kwote splacona vs. calkowite zobowiazanie
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-2 flex justify-between text-xs text-slate-500">
            <span>0 PLN</span>
            <span>{fmtPLN(plan.totalAmount)}</span>
          </div>
          <div
            className="h-3 w-full overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="h-full rounded-full bg-emerald-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {nextInstallment ? (
        <Card urgency="warning" className="mb-6">
          <CardContent className="flex items-start gap-4 py-5">
            <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-slate-900">
                Najblizsza rata: {fmtPLN(nextInstallment.amount)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Termin {fmtDate(nextInstallment.dueDate)}. Mozesz oplacic
                bezposrednio z konta lub ustawic zlecenie stale.
              </p>
              <div className="mt-3 flex gap-2">
                <Button variant="primary" size="sm">
                  Oplac teraz
                </Button>
                <Button variant="ghost" size="sm">
                  Ustaw zlecenie stale
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            Harmonogram rat
          </CardTitle>
          <CardDescription>
            {plan.installmentsTotal} rat po srednio{" "}
            {fmtPLN(plan.totalAmount / plan.installmentsTotal)}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Nr</th>
                <th className="px-6 py-3 font-medium">Termin</th>
                <th className="px-6 py-3 font-medium text-right">Kwota</th>
                <th className="px-6 py-3 font-medium text-right">Wplacono</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plan.installments.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-medium text-slate-900">
                    {inst.no}
                  </td>
                  <td className="px-6 py-3 text-slate-700">
                    {fmtDate(inst.dueDate)}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {fmtPLN(inst.amount)}
                  </td>
                  <td className="px-6 py-3 text-right text-slate-700">
                    {inst.paid > 0 ? fmtPLN(inst.paid) : "—"}
                  </td>
                  <td className="px-6 py-3">
                    <Badge tone={STATUS_TONE[inst.status]} withDot>
                      {STATUS_LABEL[inst.status]}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card elevation="subtle" className="mt-6">
        <CardContent className="flex items-start gap-4 py-5">
          <TrendingDown className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-slate-900">
              Renegocjacja warunkow planu
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Jesli nie jestes w stanie utrzymac rat, mozemy poprowadzic
              renegocjacje z wierzycielem. Statystycznie 64% rozmow konczy sie
              obnizeniem raty lub wydluzeniem okresu.
            </p>
            <div className="mt-3">
              <Button variant="ghost" size="sm">
                Rozpocznij renegocjacje
                <CheckCircle2 className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
