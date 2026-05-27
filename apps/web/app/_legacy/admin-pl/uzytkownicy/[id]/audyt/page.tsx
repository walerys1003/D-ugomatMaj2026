import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, Filter, History } from "lucide-react";
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
  title: "Audyt uzytkownika — Admin Dlugomat",
  description: "Historia akcji uzytkownika z filtrami i eksportem.",
};

type AuditRow = {
  id: string;
  action: string;
  resource: string;
  ip: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  category: "auth" | "data" | "config" | "billing";
};

const ROWS: AuditRow[] = [
  {
    id: "au-9248",
    action: "user.role.update",
    resource: "anna.nowak@example.pl",
    ip: "85.219.44.18",
    timestamp: "2026-05-09T14:22:48",
    severity: "warning",
    category: "config",
  },
  {
    id: "au-9241",
    action: "session.login",
    resource: "session_8a4b2c",
    ip: "85.219.44.18",
    timestamp: "2026-05-09T08:14:02",
    severity: "info",
    category: "auth",
  },
  {
    id: "au-9223",
    action: "billing.invoice.download",
    resource: "fv-2026-04-128",
    ip: "188.146.22.4",
    timestamp: "2026-05-08T16:38:11",
    severity: "info",
    category: "billing",
  },
  {
    id: "au-9201",
    action: "user.password.change",
    resource: "usr-487",
    ip: "85.219.44.18",
    timestamp: "2026-05-06T11:02:55",
    severity: "warning",
    category: "auth",
  },
  {
    id: "au-9187",
    action: "case.document.upload",
    resource: "doc_4f8a2c",
    ip: "85.219.44.18",
    timestamp: "2026-05-05T09:48:24",
    severity: "info",
    category: "data",
  },
  {
    id: "au-9145",
    action: "user.mfa.disable",
    resource: "usr-487",
    ip: "37.47.181.92",
    timestamp: "2026-05-03T19:14:08",
    severity: "critical",
    category: "auth",
  },
  {
    id: "au-9102",
    action: "case.create",
    resource: "spr-001",
    ip: "85.219.44.18",
    timestamp: "2026-04-22T10:32:18",
    severity: "info",
    category: "data",
  },
];

const SEVERITY_TONE: Record<
  AuditRow["severity"],
  "info" | "warning" | "danger"
> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

const SEVERITY_LABEL: Record<AuditRow["severity"], string> = {
  info: "Info",
  warning: "Ostrzezenie",
  critical: "Krytyczne",
};

const CATEGORY_LABEL: Record<AuditRow["category"], string> = {
  auth: "Autoryzacja",
  data: "Dane",
  config: "Konfiguracja",
  billing: "Rozliczenia",
};

const FILTERS: Array<{ value: AuditRow["category"] | "all"; label: string }> = [
  { value: "all", label: "Wszystkie" },
  { value: "auth", label: "Autoryzacja" },
  { value: "data", label: "Dane" },
  { value: "config", label: "Konfiguracja" },
  { value: "billing", label: "Rozliczenia" },
];

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

export default async function UserAuditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!id) return notFound();

  const critical = ROWS.filter((r) => r.severity === "critical").length;
  const warnings = ROWS.filter((r) => r.severity === "warning").length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href={`/admin/uzytkownicy/${id}`}
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Profil uzytkownika
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <h1 className="font-display text-3xl text-slate-900">
              Audyt uzytkownika
            </h1>
            <p className="mt-2 text-slate-600">
              {ROWS.length} zdarzeń · {warnings} ostrzeżeń · {critical} krytycznych
            </p>
          </div>
          <Button variant="ghost" size="sm">
            <Download className="mr-1 h-4 w-4" />
            CSV
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300 focus-visible:shadow-shield-focus"
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            Chronologia akcji
          </CardTitle>
          <CardDescription>
            Najnowsze na gorze · pelna retencja 365 dni
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Akcja</th>
                <th className="px-6 py-3 font-medium">Zasob</th>
                <th className="px-6 py-3 font-medium">Kategoria</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">IP</th>
                <th className="px-6 py-3 font-medium text-right">Czas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ROWS.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/audyt/${r.id}`}
                      className="font-mono text-xs text-slate-900 hover:underline"
                    >
                      {r.action}
                    </Link>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">
                    {r.resource}
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone="neutral">{CATEGORY_LABEL[r.category]}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge tone={SEVERITY_TONE[r.severity]} withDot>
                      {SEVERITY_LABEL[r.severity]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-slate-700">
                    {r.ip}
                  </td>
                  <td className="px-6 py-4 text-right text-xs text-slate-600">
                    {fmtTime(r.timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
