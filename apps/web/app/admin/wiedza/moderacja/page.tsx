import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Check, X, Clock, Eye, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wiedza — Moderacja",
  robots: { index: false, follow: false },
};

interface KBItem {
  id: string;
  title: string;
  author: string;
  category: "Przedawnienie" | "EPU" | "Komornik" | "Ugoda" | "Inne";
  status: "draft" | "review" | "approved" | "rejected";
  submitted_at: string;
  reviewer: string | null;
  ai_flag: "ok" | "needs_review" | "factual_risk";
  word_count: number;
}

const ITEMS: ReadonlyArray<KBItem> = [
  { id: "kb1", title: "Przedawnienie roszczen z umowy kredytu konsumenckiego", author: "Adw. P. Kowalski", category: "Przedawnienie", status: "review", submitted_at: "2026-05-10 14:22", reviewer: "Adw. A. Nowak", ai_flag: "ok", word_count: 1840 },
  { id: "kb2", title: "Jak skutecznie wniesc sprzeciw w EPU", author: "Adw. A. Nowak", category: "EPU", status: "approved", submitted_at: "2026-05-09 11:00", reviewer: "Adw. M. Lewandowski", ai_flag: "ok", word_count: 2310 },
  { id: "kb3", title: "Wniosek o rozlozenie zadluzenia komorniczego na raty", author: "M. Pietrzak", category: "Komornik", status: "review", submitted_at: "2026-05-09 09:45", reviewer: null, ai_flag: "needs_review", word_count: 980 },
  { id: "kb4", title: "Ugoda pozasadowa — wzor i argumenty", author: "Adw. P. Kowalski", category: "Ugoda", status: "draft", submitted_at: "2026-05-08 16:10", reviewer: null, ai_flag: "ok", word_count: 1240 },
  { id: "kb5", title: "Zarzuty od nakazu zaplaty w postepowaniu zwyklym", author: "K. Lewandowska", category: "EPU", status: "rejected", submitted_at: "2026-05-07 19:30", reviewer: "Adw. A. Nowak", ai_flag: "factual_risk", word_count: 760 },
  { id: "kb6", title: "Skarga na czynnosci komornika — przewodnik", author: "Adw. M. Lewandowski", category: "Komornik", status: "approved", submitted_at: "2026-05-06 10:00", reviewer: "Adw. A. Nowak", ai_flag: "ok", word_count: 1950 },
];

const STATUS_TONE: Record<KBItem["status"], "neutral" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  review: "warning",
  approved: "success",
  rejected: "danger",
};

const STATUS_LABEL: Record<KBItem["status"], string> = {
  draft: "Szkic",
  review: "Do przegladu",
  approved: "Zatwierdzone",
  rejected: "Odrzucone",
};

const FLAG_TONE: Record<KBItem["ai_flag"], "info" | "warning" | "danger"> = {
  ok: "info",
  needs_review: "warning",
  factual_risk: "danger",
};

const FLAG_LABEL: Record<KBItem["ai_flag"], string> = {
  ok: "AI: OK",
  needs_review: "AI: Sprawdz",
  factual_risk: "AI: Ryzyko faktow",
};

export default function ModeracjaWiedzaPage() {
  const reviewCount = ITEMS.filter((i) => i.status === "review").length;
  const draftCount = ITEMS.filter((i) => i.status === "draft").length;
  const approvedCount = ITEMS.filter((i) => i.status === "approved").length;
  const riskCount = ITEMS.filter((i) => i.ai_flag === "factual_risk").length;

  return (
    <div className="space-y-6">
      <Link href="/admin/wiedza" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do bazy wiedzy
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Baza wiedzy</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <BookOpen className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Moderacja artykulow
        </h1>
        <p className="mt-1 text-sm text-iron-600">
          Kolejka publikacji prawniczych. AI flaguje ryzyka faktow przed przegladem.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI moderacji">
        <Card urgency={reviewCount > 0 ? "warning" : "none"}>
          <CardHeader>
            <CardDescription>Do przegladu</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-warn">{reviewCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500 flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              Czeka na decyzje
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Szkice</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{draftCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency="success">
          <CardHeader>
            <CardDescription>Zatwierdzone (30 dni)</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{approvedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency={riskCount > 0 ? "critical" : "none"}>
          <CardHeader>
            <CardDescription>Ryzyko faktow</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-danger">{riskCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              Wymaga senior reviewu
            </p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Kolejka artykulow</CardTitle>
          <CardDescription>Sortowane od najstarszych zgloszen</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-iron-100 bg-iron-50/50 text-xs uppercase tracking-wide text-iron-600">
              <tr>
                <th className="px-5 py-2 text-left font-medium">Tytul / autor</th>
                <th className="px-5 py-2 text-left font-medium">Kategoria</th>
                <th className="px-5 py-2 text-left font-medium">Status</th>
                <th className="px-5 py-2 text-left font-medium">AI</th>
                <th className="px-5 py-2 text-left font-medium">Reviewer</th>
                <th className="px-5 py-2 text-right font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-100">
              {ITEMS.map((i) => (
                <tr key={i.id}>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium text-dlugomat-900">{i.title}</p>
                    <p className="mt-0.5 text-xs text-iron-500">
                      {i.author} · {i.submitted_at} · {i.word_count} slow
                    </p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone="neutral">{i.category}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={STATUS_TONE[i.status]} withDot>{STATUS_LABEL[i.status]}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge tone={FLAG_TONE[i.ai_flag]}>{FLAG_LABEL[i.ai_flag]}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-iron-600">{i.reviewer ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <div className="inline-flex gap-1">
                      <Button variant="ghost" size="sm" aria-label="Podglad">
                        <Eye className="h-4 w-4" aria-hidden />
                      </Button>
                      {i.status === "review" && (
                        <>
                          <Button variant="success" size="sm" aria-label="Zatwierdz">
                            <Check className="h-4 w-4" aria-hidden />
                          </Button>
                          <Button variant="danger" size="sm" aria-label="Odrzuc">
                            <X className="h-4 w-4" aria-hidden />
                          </Button>
                        </>
                      )}
                    </div>
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
