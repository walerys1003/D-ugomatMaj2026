import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Leady | Partner | Długomat" };

interface Lead {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  status: "new" | "contacted" | "qualified" | "converted" | "lost";
  expected_plan: "starter" | "growth" | "enterprise";
  estimated_mrr_pln: number;
  source: "referral_link" | "manual" | "campaign";
  created_at: string;
  last_activity_at?: string;
  notes?: string;
}

async function fetchLeads(status?: string): Promise<Lead[]> {
  try {
    const qs = status ? `?status=${status}` : "";
    const res = await fetch(`/api/partner/leads${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.leads ?? [];
  } catch {
    return [];
  }
}

const STATUS_BADGE: Record<Lead["status"], string> = {
  new: "bg-accent-50 text-accent-700 border-accent-200",
  contacted: "bg-warn-50 text-warn-700 border-warn-200",
  qualified: "bg-warn-50 text-warn-700 border-warn-200",
  converted: "bg-accent-50 text-accent-700 border-accent-200",
  lost: "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_LABEL: Record<Lead["status"], string> = {
  new: "Nowy",
  contacted: "Skontaktowany",
  qualified: "Zakwalifikowany",
  converted: "Skonwertowany",
  lost: "Utracony",
};

const FILTER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "", label: "Wszystkie" },
  { value: "new", label: "Nowe" },
  { value: "contacted", label: "Skontaktowane" },
  { value: "qualified", label: "Zakwalifikowane" },
  { value: "converted", label: "Skonwertowane" },
  { value: "lost", label: "Utracone" },
];

export default async function LeadyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const leads = await fetchLeads(sp.status);
  const newCount = leads.filter((l) => l.status === "new").length;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/partner" className="text-xs text-ink-500 hover:text-ink-700">
          ← Panel partnera
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Leady
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          {leads.length} leadów w widoku · {newCount} oczekuje na pierwszy kontakt
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map((opt) => {
          const active = (sp.status ?? "") === opt.value;
          const href = opt.value
            ? `/panel/partner/leady?status=${opt.value}`
            : "/panel/partner/leady";
          return (
            <Link
              key={opt.value || "all"}
              href={href}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                active
                  ? "border-ink-900 dark:border-ink-50 bg-ink-900 dark:bg-ink-50 text-ink-50 dark:text-ink-900"
                  : "border-ink-300 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-ink-400"
              }`}
            >
              {opt.label}
            </Link>
          );
        })}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Lista leadów</CardTitle>
        </CardHeader>
        <CardContent>
          {leads.length === 0 ? (
            <div className="space-y-3 text-sm text-ink-500">
              <p>Brak leadów w tym widoku.</p>
              <Link href="/panel/partner/materialy">
                <Button variant="secondary">Pobierz link partnerski</Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-ink-200 dark:border-ink-800 text-xs uppercase tracking-wider text-ink-500">
                    <th className="py-2 pr-3">Firma / kontakt</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Plan</th>
                    <th className="py-2 pr-3">Szac. MRR</th>
                    <th className="py-2 pr-3">Źródło</th>
                    <th className="py-2 pr-3">Aktywność</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-ink-100 dark:border-ink-900">
                      <td className="py-3 pr-3">
                        <div className="font-medium text-ink-900 dark:text-ink-50">
                          {l.company_name}
                        </div>
                        <div className="text-xs text-ink-500">
                          {l.contact_name} · {l.contact_email}
                        </div>
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[l.status]}`}
                        >
                          {STATUS_LABEL[l.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-3 capitalize text-ink-700 dark:text-ink-300">
                        {l.expected_plan}
                      </td>
                      <td className="py-3 pr-3 font-medium text-ink-900 dark:text-ink-50">
                        {l.estimated_mrr_pln.toLocaleString("pl-PL")} zł
                      </td>
                      <td className="py-3 pr-3 text-xs text-ink-500 font-mono">
                        {l.source}
                      </td>
                      <td className="py-3 pr-3 text-ink-500 text-xs">
                        {l.last_activity_at
                          ? new Date(l.last_activity_at).toLocaleDateString("pl-PL")
                          : new Date(l.created_at).toLocaleDateString("pl-PL")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
