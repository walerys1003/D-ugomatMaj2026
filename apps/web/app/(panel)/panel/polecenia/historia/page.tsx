import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, Clock, Download, Share2, Wallet, XCircle } from "lucide-react";
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
import { listReferralStats } from "@/lib/referrals/referral-actions";

export const metadata: Metadata = {
  title: "Historia polecen — Dlugomat",
  description: "Pelna historia zaproszen, prowizji i wyplat.",
};

export const dynamic = "force-dynamic";

function mapConvStatus(status: string): Referral["status"] {
  switch (status) {
    case "paid":
    case "approved":
      return "converted";
    case "pending":
      return "registered";
    case "rejected":
      return "expired";
    default:
      return "invited";
  }
}

type Referral = {
  id: string;
  email: string;
  invitedAt: string;
  status: "invited" | "registered" | "converted" | "expired";
  reward: number;
  paidOut: boolean;
};

type Payout = {
  id: string;
  date: string;
  amount: number;
  method: "transfer" | "voucher";
  status: "paid" | "pending" | "rejected";
};

const STATUS_LABEL: Record<Referral["status"], string> = {
  invited: "Zaproszony",
  registered: "Zarejestrowany",
  converted: "Aktywny klient",
  expired: "Wygasl",
};

const STATUS_TONE: Record<
  Referral["status"],
  "neutral" | "info" | "success" | "warning"
> = {
  invited: "neutral",
  registered: "info",
  converted: "success",
  expired: "warning",
};

const PAYOUT_TONE: Record<Payout["status"], "success" | "warning" | "danger"> = {
  paid: "success",
  pending: "warning",
  rejected: "danger",
};

const PAYOUT_LABEL: Record<Payout["status"], string> = {
  paid: "Wyplacono",
  pending: "Oczekuje",
  rejected: "Odrzucono",
};

const fmtPLN = (v: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN" }).format(v);

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));

export default async function ReferralHistoryPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/polecenia/historia");

  const stats = await listReferralStats(user.id);

  const REFERRALS: Referral[] = stats.recentConversions.map((c) => ({
    id: c.id,
    email: `Konwersja ${c.code}`,
    invitedAt: c.created_at,
    status: mapConvStatus(c.status),
    reward: c.reward_grosze / 100,
    paidOut: c.status === "paid",
  }));

  const PAYOUTS: Payout[] = [];

  const earned =
    (stats.totals.pending_grosze +
      stats.totals.approved_grosze +
      stats.totals.paid_grosze) /
    100;
  const paid = stats.totals.paid_grosze / 100;
  const pending = earned - paid;
  const converted = REFERRALS.filter((r) => r.status === "converted").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/polecenia"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Program polecen
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Historia polecen
            </h1>
            <p className="mt-2 text-slate-600">
              {REFERRALS.length} zaproszen · {converted} aktywnych klientow
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Download className="mr-1 h-4 w-4" />
              CSV
            </Button>
            <Button variant="primary" size="sm">
              <Share2 className="mr-1 h-4 w-4" />
              Zapros osobe
            </Button>
          </div>
        </div>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Zarobione
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPLN(earned)}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Wyplacone
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPLN(paid)}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Do wyplaty
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {fmtPLN(pending)}
            </p>
          </CardContent>
        </Card>
        <Card elevation="subtle">
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Aktywnych
            </p>
            <p className="mt-2 font-display text-2xl text-slate-900">
              {converted}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle>Zaproszenia</CardTitle>
          <CardDescription>
            Status kazdej osoby ktora zaprosiles
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Zaproszono</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Prowizja</th>
                <th className="px-6 py-3 font-medium text-right">Wyplata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {REFERRALS.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {r.email}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {fmtDate(r.invitedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={STATUS_TONE[r.status]} withDot>
                      {STATUS_LABEL[r.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {r.reward > 0 ? fmtPLN(r.reward) : "—"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {r.paidOut ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Wyplacone
                      </span>
                    ) : r.reward > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                        <Clock className="h-3.5 w-3.5" />
                        Oczekuje
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                        <XCircle className="h-3.5 w-3.5" />
                        Brak
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {REFERRALS.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-slate-500">
                    Brak zaproszen. Udostepnij swoj link, aby zaczac zarabiac.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Historia wyplat</CardTitle>
          <CardDescription>
            Wyplaty realizujemy w pierwszy roboczy dzien miesiaca
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Data</th>
                <th className="px-6 py-3 font-medium">Metoda</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium text-right">Kwota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PAYOUTS.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-slate-700">{fmtDate(p.date)}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 text-slate-700">
                      <Wallet className="h-4 w-4 text-slate-400" />
                      {p.method === "transfer" ? "Przelew" : "Voucher"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={PAYOUT_TONE[p.status]} withDot>
                      {PAYOUT_LABEL[p.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-900">
                    {fmtPLN(p.amount)}
                  </td>
                </tr>
              ))}
              {PAYOUTS.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                    Brak wyplat. Wyplaty pojawia sie po zatwierdzeniu prowizji.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
