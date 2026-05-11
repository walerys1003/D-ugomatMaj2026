import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  FileText,
  Inbox,
  Wallet,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Dashboard — przeglad",
  robots: { index: false, follow: false },
};

const fmtPLN = new Intl.NumberFormat("pl-PL", {
  style: "currency",
  currency: "PLN",
  maximumFractionDigits: 0,
});

interface QuickAction {
  href: string;
  label: string;
  desc: string;
  tone: "primary" | "warning" | "danger";
}

const QUICK_ACTIONS: ReadonlyArray<QuickAction> = [
  { href: "/panel/skaner", label: "Skanuj pismo", desc: "OCR + analiza w 2 min", tone: "primary" },
  { href: "/panel/moje-pisma/nowe", label: "Wygeneruj pismo", desc: "Sprzeciw, zarzuty, wniosek", tone: "primary" },
  { href: "/panel/wsparcie", label: "Pytanie do prawnika", desc: "Odpowiedz w 24 h", tone: "warning" },
];

interface UrgentTask {
  id: string;
  title: string;
  due: string;
  case_id: string;
  hours_left: number;
}

const URGENT: ReadonlyArray<UrgentTask> = [
  { id: "u1", title: "Sprzeciw EPU — Bank PKO", due: "2026-05-12 23:59", case_id: "C-2026-0142", hours_left: 28 },
  { id: "u2", title: "Odpowiedz na zarzuty", due: "2026-05-21 23:59", case_id: "C-2026-0139", hours_left: 244 },
];

interface RecentActivity {
  id: string;
  when: string;
  text: string;
  icon: "file" | "msg" | "ok";
}

const RECENT: ReadonlyArray<RecentActivity> = [
  { id: "r1", when: "10 min temu", text: "Prawnik dodal komentarz do sprzeciwu", icon: "msg" },
  { id: "r2", when: "2 godz temu", text: "Wygenerowano pismo: Sprzeciw EPU", icon: "file" },
  { id: "r3", when: "Wczoraj", text: "Zaplacono rate 3/12 (780 PLN)", icon: "ok" },
  { id: "r4", when: "Wczoraj", text: "Nowy dokument w sprawie C-2026-0139", icon: "file" },
];

const ICON_MAP = { file: FileText, msg: Inbox, ok: CheckCircle2 };

export default function DashboardV2Page() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">Twoj panel</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">Dzien dobry, Anno.</h1>
        <p className="mt-1 text-sm text-iron-600">
          Masz {URGENT.length} pilnych zadan i 3 aktywne sprawy. Wszystko pod kontrola.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-4" aria-label="KPI dashboardu">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Aktywne sprawy</CardDescription>
              <Briefcase className="h-4 w-4 text-iron-500" aria-hidden />
            </div>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">3</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">2 w toku, 1 w oczekiwaniu</p>
          </CardContent>
        </Card>
        <Card urgency="warning">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Pilne terminy</CardDescription>
              <CalendarClock className="h-4 w-4 text-warn" aria-hidden />
            </div>
            <CardTitle className="font-display text-fluid-h3 text-warn">{URGENT.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">Najblizszy za 28 h</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Wydane w maju</CardDescription>
              <Wallet className="h-4 w-4 text-iron-500" aria-hidden />
            </div>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {fmtPLN.format(1808)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">2 pisma, 1 konsultacja, 1 rata</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardDescription>Lacznie zadluzenie</CardDescription>
              <FileText className="h-4 w-4 text-iron-500" aria-hidden />
            </div>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {fmtPLN.format(47230)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-iron-500">3 wierzycieli, harmonogram aktywny</p>
          </CardContent>
        </Card>
      </section>

      <section aria-labelledby="urgent-heading">
        <h2 id="urgent-heading" className="mb-3 flex items-center gap-2 text-sm font-medium text-iron-700">
          <AlertTriangle className="h-4 w-4 text-warn" aria-hidden />
          Pilne — wymaga akcji
        </h2>
        <div className="space-y-3">
          {URGENT.map((u) => (
            <Card key={u.id} urgency={u.hours_left < 48 ? "critical" : "warning"}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                <div>
                  <p className="font-medium text-dlugomat-950">{u.title}</p>
                  <p className="mt-1 text-xs text-iron-500">
                    Sprawa {u.case_id} · termin {u.due}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={u.hours_left < 48 ? "danger" : "warning"} withDot>
                    {u.hours_left} h
                  </Badge>
                  <Button variant="primary" size="sm" asChild>
                    <Link href={`/panel/sprawa/${u.case_id}`}>
                      Otworz sprawe
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2" aria-labelledby="recent-heading">
          <h2 id="recent-heading" className="mb-3 text-sm font-medium text-iron-700">
            Ostatnia aktywnosc
          </h2>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-iron-100">
                {RECENT.map((r) => {
                  const Icon = ICON_MAP[r.icon];
                  return (
                    <li key={r.id} className="flex items-center gap-3 px-5 py-3">
                      <Icon className="h-4 w-4 text-iron-500" aria-hidden />
                      <span className="flex-1 text-sm text-dlugomat-900">{r.text}</span>
                      <span className="text-xs text-iron-500">{r.when}</span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="quick-heading">
          <h2 id="quick-heading" className="mb-3 text-sm font-medium text-iron-700">
            Szybkie akcje
          </h2>
          <div className="space-y-3">
            {QUICK_ACTIONS.map((a) => (
              <Card key={a.href}>
                <CardContent className="p-4">
                  <p className="font-medium text-dlugomat-950">{a.label}</p>
                  <p className="mt-1 text-xs text-iron-500">{a.desc}</p>
                  <Button variant={a.tone === "primary" ? "primary" : "secondary"} size="sm" className="mt-3" asChild>
                    <Link href={a.href}>
                      Przejdz
                      <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
