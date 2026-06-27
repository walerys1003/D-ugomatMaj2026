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
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import { ComplianceReportsClient } from "@/components/admin/compliance/reports-client";

export const metadata: Metadata = {
  title: "Compliance — DPIA / RoPA / SOC2",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ComplianceDashboard() {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/admin/compliance");

  // Audyt 2026-06-27 (iter. 38): komponent oczekuje kształtu Report
  // (generated_by/summary/payload), a tabela compliance_evidence ma
  // data/format i nie ma generated_by/summary. Mapujemy zamiast `as any`.
  // Pomijamy rekordy o kind=iso27001 (poza unią obsługiwaną przez UI).
  const { data: reportsRaw } = await sb
    .from("compliance_evidence")
    .select("id, kind, generated_at, data")
    .order("generated_at", { ascending: false })
    .limit(50);
  const reports = (reportsRaw ?? [])
    .filter((r): r is typeof r & { kind: "dpia" | "ropa" | "soc2" | "audit_integrity" } =>
      r.kind === "dpia" || r.kind === "ropa" || r.kind === "soc2" || r.kind === "audit_integrity")
    .map((r) => ({
      id: r.id,
      kind: r.kind,
      generated_at: r.generated_at,
      generated_by: null,
      summary: (r.data ?? null) as Record<string, unknown> | null,
      payload: (r.data ?? null) as Record<string, unknown> | null,
    }));

  const counts = {
    dpia: reports.filter((r) => r.kind === "dpia").length,
    ropa: reports.filter((r) => r.kind === "ropa").length,
    soc2: reports.filter((r) => r.kind === "soc2").length,
    audit_integrity: reports.filter((r) => r.kind === "audit_integrity").length,
  };

  return (
    <main className="container py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
          <p className="text-ink-600 dark:text-ink-300">
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

      <ComplianceReportsClient initialReports={reports} />
    </main>
  );
}

function KpiCard({ label, count, hint }: { label: string; count: number; hint: string }) {
  return (
    <div className="rounded-lg border border-ink-200 dark:border-dlugomat-800 p-4 bg-white dark:bg-dlugomat-900">
      <div className="text-sm text-ink-600 dark:text-ink-300">{label}</div>
      <div className="text-3xl font-bold mt-1">{count}</div>
      <div className="text-xs text-ink-500 mt-2">{hint}</div>
    </div>
  );
}
