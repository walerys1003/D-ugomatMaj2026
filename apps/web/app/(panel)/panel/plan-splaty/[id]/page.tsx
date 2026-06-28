import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Download,
  TrendingDown,
  CheckCircle2,
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
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Plan splaty — Dlugomat",
  description: "Szczegoly planu splaty z historia wplat i postepem.",
};

export const dynamic = "force-dynamic";

type PayStatus = "paid" | "pending" | "failed" | "refunded";

const STATUS_TONE: Record<PayStatus, "success" | "warning" | "neutral" | "danger"> = {
  paid: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
};

const STATUS_LABEL: Record<PayStatus, string> = {
  paid: "Oplacona",
  pending: "Oczekuje",
  failed: "Nieudana",
  refunded: "Zwrocona",
};

function normalizeStatus(s: string): PayStatus {
  const v = s.toLowerCase();
  if (v.includes("paid") || v.includes("succ") || v.includes("complete")) return "paid";
  if (v.includes("refund")) return "refunded";
  if (v.includes("fail") || v.includes("cancel")) return "failed";
  return "pending";
}

const fmtPLN = (v: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(v);

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("pl-PL", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(iso))
    : "—";

export default async function PaymentPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/sign-in?next=/panel/plan-splaty/${id}`);

  // [id] = identyfikator sprawy. Plan splaty = sprawa + historia jej platnosci.
  const { data: kase } = await supabase
    .from("cases")
    .select(
      "id, title, sygnatura, powod_nazwa, kwota_glowna, kwota_odsetki, kwota_koszty, kwota_razem, status, created_at",
    )
    .eq("id", id)
    .single();

  if (!kase) return notFound();

  const { data: paymentsRaw } = await supabase
    .from("payments")
    .select("id, amount, currency, status, product_name, created_at, paid_at")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const payments = (paymentsRaw ?? []).map((p) => ({
    id: p.id,
    amount: (p.amount ?? 0) / 100, // grosze -> PLN
    status: normalizeStatus(p.status),
    productName: p.product_name,
    createdAt: p.created_at,
    paidAt: p.paid_at,
  }));

  const totalAmount =
    (kase.kwota_razem ??
      (kase.kwota_glowna ?? 0) + (kase.kwota_odsetki ?? 0) + (kase.kwota_koszty ?? 0)) || 0;
  const paidAmount = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + p.amount, 0);
  const remaining = Math.max(totalAmount - paidAmount, 0);
  const progress = totalAmount > 0 ? Math.round((paidAmount / totalAmount) * 100) : 0;
  const creditor = kase.powod_nazwa ?? kase.title ?? "Wierzyciel";

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
              <span className="font-mono text-sm text-slate-500">#{kase.id.slice(0, 8)}</span>
              <Badge tone="info" withDot>
                {kase.status}
              </Badge>
            </div>
            <h1 className="mt-2 font-display text-3xl text-slate-900">{creditor}</h1>
            <p className="mt-1 text-sm text-slate-600">
              {kase.sygnatura ? `Sprawa ${kase.sygnatura} · ` : ""}
              Utworzono {fmtDate(kase.created_at)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link href={`/panel/sprawy/${kase.id}`}>
                <Download className="mr-1 h-4 w-4" />
                Otworz sprawe
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Postep</p>
            <p className="mt-2 font-display text-2xl text-slate-900">{progress}%</p>
            <p className="mt-1 text-xs text-slate-500">
              {payments.filter((p) => p.status === "paid").length} wplat
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Splacone</p>
            <p className="mt-2 font-display text-2xl text-emerald-700">{fmtPLN(paidAmount)}</p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Pozostalo</p>
            <p className="mt-2 font-display text-2xl text-slate-900">{fmtPLN(remaining)}</p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Zobowiazanie</p>
            <p className="mt-2 font-display text-lg text-slate-900">{fmtPLN(totalAmount)}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
              <Clock className="h-3 w-3" />
              wg danych sprawy
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
            <span>{fmtPLN(totalAmount)}</span>
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

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-slate-500" />
            Historia wplat
          </CardTitle>
          <CardDescription>
            {payments.length} {payments.length === 1 ? "platnosc" : "platnosci"} powiazanych ze sprawa
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Pozycja</th>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium text-right">Kwota</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    Brak zarejestrowanych platnosci dla tej sprawy.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-slate-900">{p.productName}</td>
                    <td className="px-6 py-3 text-slate-700">
                      {fmtDate(p.paidAt ?? p.createdAt)}
                    </td>
                    <td className="px-6 py-3 text-right text-slate-700">{fmtPLN(p.amount)}</td>
                    <td className="px-6 py-3">
                      <Badge tone={STATUS_TONE[p.status]} withDot>
                        {STATUS_LABEL[p.status]}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card elevation="subtle" className="mt-6">
        <CardContent className="flex items-start gap-4 py-5">
          <TrendingDown className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-medium text-slate-900">Renegocjacja warunkow</p>
            <p className="mt-1 text-sm text-slate-600">
              Jesli nie jestes w stanie utrzymac biezacych zobowiazan, mozemy pomoc
              przeprowadzic renegocjacje z wierzycielem.
            </p>
            <div className="mt-3">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/panel/wsparcie">
                  Skontaktuj sie ze wsparciem
                  <CheckCircle2 className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
