import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Megaphone, Plus, Pin, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Komunikaty systemowe",
  robots: { index: false, follow: false },
};

interface Announcement {
  id: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  audience: "wszyscy" | "kancelarie" | "kandydaci" | "B2B";
  status: "draft" | "scheduled" | "live" | "archived";
  publish_at: string;
  views: number;
  pinned: boolean;
}

const SEVERITY_TONE: Record<Announcement["severity"], "info" | "warning" | "danger"> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

const STATUS_TONE: Record<Announcement["status"], "neutral" | "info" | "success" | "neutral"> = {
  draft: "neutral",
  scheduled: "info",
  live: "success",
  archived: "neutral",
};

const STATUS_LABEL: Record<Announcement["status"], string> = {
  draft: "Szkic",
  scheduled: "Zaplanowany",
  live: "Opublikowany",
  archived: "Zarchiwizowany",
};

const ANNOUNCEMENTS: ReadonlyArray<Announcement> = [
  {
    id: "anc-118",
    title: "Plan prac konserwacyjnych 15.05.2026",
    body: "Krotka przerwa w dostepie do skanera dokumentow miedzy 02:00 a 02:30. Pozostale funkcje pracuja bez zmian.",
    severity: "info",
    audience: "wszyscy",
    status: "scheduled",
    publish_at: "2026-05-13 09:00",
    views: 0,
    pinned: true,
  },
  {
    id: "anc-117",
    title: "Nowy moduł: harmonogram splat v2",
    body: "Wprowadzilismy zmieniony modul harmonogramow z eksportem do Excel i podpisanym PDF. Wiecej w changelogu.",
    severity: "info",
    audience: "kandydaci",
    status: "live",
    publish_at: "2026-05-09 12:00",
    views: 4280,
    pinned: false,
  },
  {
    id: "anc-116",
    title: "Aktualizacja DPA dla klientow Enterprise",
    body: "Zmodyfikowalismy umowe powierzenia danych w sekcji 6.4 (transfer EU). Klienci Enterprise — sprawdzcie mail.",
    severity: "warning",
    audience: "B2B",
    status: "live",
    publish_at: "2026-05-04 10:00",
    views: 312,
    pinned: false,
  },
  {
    id: "anc-115",
    title: "Awaria webhookow HubSpot — rozwiazana",
    body: "W godzinach 14:22-14:30 webhook HubSpot nie odbieral zdarzen. Ponowilismy 1 240 zdarzen. Brak utraty danych.",
    severity: "critical",
    audience: "kancelarie",
    status: "archived",
    publish_at: "2026-05-02 15:00",
    views: 89,
    pinned: false,
  },
  {
    id: "anc-114",
    title: "Webinar: jak skanować nakaz EPU w 2 minuty",
    body: "Zapraszamy na webinar 12.05 o 18:00. Pokazemy nowe funkcje skanera oraz integracje z e-Doreczeniami.",
    severity: "info",
    audience: "wszyscy",
    status: "draft",
    publish_at: "—",
    views: 0,
    pinned: false,
  },
];

export default function KomunikatyPage() {
  const live = ANNOUNCEMENTS.filter((a) => a.status === "live").length;
  const scheduled = ANNOUNCEMENTS.filter((a) => a.status === "scheduled").length;
  const drafts = ANNOUNCEMENTS.filter((a) => a.status === "draft").length;
  const totalViews = ANNOUNCEMENTS.reduce((s, a) => s + a.views, 0);

  return (
    <div className="space-y-6">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-iron-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu admina
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Admin / Komunikaty</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <Megaphone className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Komunikaty systemowe
          </h1>
          <p className="mt-1 text-sm text-iron-600">
            Anonse w aplikacji, planowane konserwacje, alerty bezpieczenstwa.
          </p>
        </div>
        <Button variant="primary">
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowy komunikat
        </Button>
      </header>

      <section className="grid gap-4 lg:grid-cols-4">
        <Card urgency="success">
          <CardHeader>
            <CardDescription>Opublikowane</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-accent-700">{live}</CardTitle>
          </CardHeader>
        </Card>
        <Card urgency="normal">
          <CardHeader>
            <CardDescription>Zaplanowane</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{scheduled}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Szkice</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">{drafts}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Wyswietlenia lacznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {totalViews.toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Wszystkie komunikaty</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-iron-100">
            {ANNOUNCEMENTS.map((a) => (
              <li key={a.id} className="px-5 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {a.pinned && <Pin className="h-4 w-4 fill-warn text-warn" aria-hidden />}
                      <span className="font-mono text-xs text-iron-500">{a.id}</span>
                      <Badge tone={SEVERITY_TONE[a.severity]} withDot>
                        {a.severity}
                      </Badge>
                      <Badge tone={STATUS_TONE[a.status]}>
                        {STATUS_LABEL[a.status]}
                      </Badge>
                      <Badge tone="neutral">Audytorium: {a.audience}</Badge>
                    </div>
                    <h3 className="mt-2 font-medium text-dlugomat-950">{a.title}</h3>
                    <p className="mt-1 text-sm text-iron-700">{a.body}</p>
                    <p className="mt-2 text-xs text-iron-500">
                      Publikacja: {a.publish_at}
                      {a.views > 0 && (
                        <>
                          {" · "}
                          <Eye className="mr-0.5 inline h-3 w-3" aria-hidden />
                          {a.views.toLocaleString("pl-PL")} wyswietlen
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edytuj</Button>
                    <Button variant="secondary" size="sm">Podglad</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
