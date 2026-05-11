import type { Metadata } from "next";
import { Download, FileSignature, ShieldCheck } from "lucide-react";

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
  title: "Umowy · Partner · Długomat",
  description:
    "Dokumenty programu partnerskiego: ramowa umowa, DPA, regulamin prowizji, NDA.",
};

type Doc = {
  id: string;
  name: string;
  version: string;
  signed_at: string | null;
  expires_at?: string | null;
  status: "obowiązuje" | "do podpisu" | "wygasły";
  size_kb: number;
};

const DOCS: Doc[] = [
  {
    id: "agr_ramowa",
    name: "Umowa partnerska (ramowa)",
    version: "v3.2",
    signed_at: "2025-09-18",
    expires_at: "2027-09-18",
    status: "obowiązuje",
    size_kb: 612,
  },
  {
    id: "agr_dpa",
    name: "DPA — Umowa o przetwarzaniu danych",
    version: "v2.0",
    signed_at: "2025-09-18",
    status: "obowiązuje",
    size_kb: 248,
  },
  {
    id: "agr_prowizje",
    name: "Regulamin prowizji",
    version: "v4.1",
    signed_at: "2026-04-01",
    status: "obowiązuje",
    size_kb: 184,
  },
  {
    id: "agr_nda",
    name: "NDA — Umowa o poufności",
    version: "v1.4",
    signed_at: null,
    status: "do podpisu",
    size_kb: 96,
  },
];

const STATUS_TONE: Record<Doc["status"], "success" | "warning" | "danger"> = {
  obowiązuje: "success",
  "do podpisu": "warning",
  wygasły: "danger",
};

export default function PartnerUmowyPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Partner · Prawo
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Umowy
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Aktualna wersja każdego dokumentu programu partnerskiego.
          Po zmianie warunków otrzymasz powiadomienie e-mail i okno 14 dni
          na akceptację nowej wersji.
        </p>
      </header>

      <Card elevation="subtle" urgency="success">
        <CardHeader>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
            >
              <ShieldCheck className="size-5" />
            </span>
            <div>
              <CardTitle className="text-fluid-base">
                Twój status: aktywny partner Tier Growth
              </CardTitle>
              <CardDescription>
                Wszystkie wymagane dokumenty są podpisane. Następna weryfikacja
                automatyczna: 18.09.2026.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card elevation="subtle" className="overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full text-fluid-sm">
            <thead className="border-b border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-900/40">
              <tr className="text-left text-iron-600 dark:text-iron-300">
                <th className="px-5 py-3 font-semibold">Dokument</th>
                <th className="px-5 py-3 font-semibold">Wersja</th>
                <th className="px-5 py-3 font-semibold">Podpisana</th>
                <th className="px-5 py-3 font-semibold">Wygasa</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100 dark:divide-dlugomat-800">
              {DOCS.map((d) => (
                <tr key={d.id}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <FileSignature
                        aria-hidden
                        className="size-4 text-dlugomat-600"
                      />
                      <span className="font-semibold text-iron-900 dark:text-iron-50">
                        {d.name}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-fluid-xs text-iron-500">
                    {d.version}
                  </td>
                  <td className="px-5 py-3 text-fluid-xs text-iron-500">
                    {d.signed_at ?? "—"}
                  </td>
                  <td className="px-5 py-3 text-fluid-xs text-iron-500">
                    {d.expires_at ?? "bezterminowo"}
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[d.status]} withDot>
                      {d.status}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    {d.signed_at ? (
                      <Button size="sm" variant="ghost">
                        <Download className="size-4" />
                        Pobierz
                      </Button>
                    ) : (
                      <Button size="sm" variant="success">
                        Podpisz teraz
                      </Button>
                    )}
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
