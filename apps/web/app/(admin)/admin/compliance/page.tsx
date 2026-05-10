/**
 * Tier 25 — Admin Compliance Dashboard.
 *
 * Strona serwerowa pokazująca:
 *   - Status DPIA / RoPA / SOC2
 *   - Lista zapisanych raportów (compliance_evidence)
 *   - Przyciski generowania (call /api/compliance/reports?kind=...)
 */
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { ComplianceReportsClient } from "@/components/admin/compliance/reports-client";

export const metadata: Metadata = {
  title: "Compliance — DPIA / RoPA / SOC2",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ComplianceDashboard() {
  const sb = await createServerSupabase();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/compliance");

  const { data: reports } = await sb
    .from("compliance_evidence")
    .select("*")
    .order("generated_at", { ascending: false })
    .limit(50);

  const counts = {
    dpia: reports?.filter((r: any) => r.kind === "dpia").length ?? 0,
    ropa: reports?.filter((r: any) => r.kind === "ropa").length ?? 0,
    soc2: reports?.filter((r: any) => r.kind === "soc2").length ?? 0,
    audit_integrity: reports?.filter((r: any) => r.kind === "audit_integrity").length ?? 0,
  };

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-iron-600 dark:text-iron-300">
            Raporty regulacyjne: DPIA · RoPA · SOC2 · łańcuch audytu.
          </p>
        </div>
        <Link href="/admin" className="text-dlugomat-600 hover:underline text-sm">
          ← Panel admina
        </Link>
      </header>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard label="DPIA" count={counts.dpia} hint="Data Protection Impact Assessment" />
        <KpiCard label="RoPA" count={counts.ropa} hint="Record of Processing Activities" />
        <KpiCard label="SOC 2" count={counts.soc2} hint="Trust Services Criteria evidence" />
        <KpiCard
          label="Audit Chain"
          count={counts.audit_integrity}
          hint="HMAC chain integrity reports"
        />
      </section>

      <ComplianceReportsClient initialReports={(reports ?? []) as any} />
    </main>
  );
}

function KpiCard({ label, count, hint }: { label: string; count: number; hint: string }) {
  return (
    <div className="rounded-lg border border-iron-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
      <div className="text-sm text-iron-600 dark:text-iron-300">{label}</div>
      <div className="text-3xl font-bold mt-1">{count}</div>
      <div className="text-xs text-iron-500 mt-2">{hint}</div>
    </div>
  );
}
