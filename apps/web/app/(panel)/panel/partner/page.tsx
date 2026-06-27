import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = { title: "Panel partnera | Długomat" };

export const dynamic = "force-dynamic";

interface PartnerOverview {
  partner_name: string;
  revenue_share_percent: number;
  mtd_commission_pln: number;
  ytd_commission_pln: number;
  active_referrals: number;
  pending_leads: number;
  conversion_rate_percent: number;
  next_payout_amount: number;
}

export default async function PartnerPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/partner");

  const { data: account } = await supabase
    .from("affiliate_accounts")
    .select("id, display_name, commission_first_payment_pct, status")
    .eq("user_id", user.id)
    .maybeSingle();

  let o: PartnerOverview | null = null;
  if (account) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString();

    const [commAll, referrals, pendingPayouts] = await Promise.all([
      supabase
        .from("affiliate_commissions")
        .select("amount_grosze, status, created_at")
        .eq("affiliate_id", account.id),
      supabase
        .from("affiliate_referrals")
        .select("status")
        .eq("affiliate_id", account.id),
      supabase
        .from("affiliate_payouts")
        .select("amount_grosze, status")
        .eq("affiliate_id", account.id)
        .eq("status", "pending"),
    ]);

    const comms = commAll.data ?? [];
    const refs = referrals.data ?? [];
    const mtd =
      comms
        .filter((c) => c.created_at >= startOfMonth)
        .reduce((s, c) => s + (c.amount_grosze ?? 0), 0) / 100;
    const ytd =
      comms
        .filter((c) => c.created_at >= startOfYear)
        .reduce((s, c) => s + (c.amount_grosze ?? 0), 0) / 100;
    const activeReferrals = refs.filter((r) => r.status === "converted").length;
    const totalRefs = refs.length;
    const conversion = totalRefs > 0 ? Math.round((activeReferrals / totalRefs) * 100) : 0;
    const nextPayout =
      (pendingPayouts.data ?? []).reduce((s, p) => s + (p.amount_grosze ?? 0), 0) / 100;

    o = {
      partner_name: account.display_name,
      revenue_share_percent: account.commission_first_payment_pct,
      mtd_commission_pln: mtd,
      ytd_commission_pln: ytd,
      active_referrals: activeReferrals,
      pending_leads: refs.filter((r) => r.status === "signed_up").length,
      conversion_rate_percent: conversion,
      next_payout_amount: nextPayout,
    };
  }

  if (!o) {
    return (
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <Card elevation="subtle">
          <CardContent className="pt-6 space-y-3">
            <h1 className="font-display text-2xl font-semibold text-ink-900 dark:text-ink-50">
              Witaj w programie partnerskim
            </h1>
            <p className="text-sm text-ink-600 dark:text-ink-400">
              Nie jesteś jeszcze partnerem Długomat. Dołącz do programu i zarabiaj
              30–50% z każdej subskrypcji.
            </p>
            <Link href="/program-resellerski">
              <Button variant="primary">Aplikuj jako partner</Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">Panel partnera</p>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
          {o.partner_name}
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {o.revenue_share_percent}% prowizji od pierwszej płatności
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Prowizja MTD" value={`${o.mtd_commission_pln.toLocaleString("pl-PL")} zł`} highlight />
        <Stat label="Prowizja YTD" value={`${o.ytd_commission_pln.toLocaleString("pl-PL")} zł`} />
        <Stat label="Aktywni klienci" value={o.active_referrals.toString()} />
        <Stat label="Konwersja" value={`${o.conversion_rate_percent}%`} />
      </div>

      <Card elevation="pop">
        <CardHeader>
          <CardTitle>Najbliższa wypłata</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <div className="font-display text-3xl font-semibold text-accent-700">
                {o.next_payout_amount.toLocaleString("pl-PL")} zł
              </div>
              <div className="text-sm text-ink-500 mt-1">
                Suma oczekujących wypłat
              </div>
            </div>
            <Link href="/panel/partner/wyplaty">
              <Button variant="secondary">Historia wypłat</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-4">
        <PartnerLink
          href="/panel/partner/leady"
          title="Leady"
          desc={`${o.pending_leads} oczekuje na kontakt`}
        />
        <PartnerLink
          href="/panel/partner/materialy"
          title="Materiały marketingowe"
          desc="Banery, landing, prezentacje"
        />
        <PartnerLink
          href="/panel/partner/wyplaty"
          title="Wypłaty"
          desc="Pobierz faktury i raporty"
        />
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Card elevation="subtle">
      <CardContent className="pt-5">
        <div className="text-xs uppercase tracking-wider text-ink-500 mb-1">{label}</div>
        <div
          className={`font-display text-2xl font-semibold ${
            highlight ? "text-accent-700" : "text-ink-900 dark:text-ink-50"
          }`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}

function PartnerLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href}>
      <Card elevation="subtle" className="hover:border-accent-400 transition cursor-pointer h-full">
        <CardHeader>
          <CardTitle className="text-base">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-ink-600 dark:text-ink-400">{desc}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
