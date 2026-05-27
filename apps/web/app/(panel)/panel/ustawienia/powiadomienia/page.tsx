import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell, Mail, Smartphone, Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Ustawienia — Powiadomienia",
  robots: { index: false, follow: false },
};

interface NotificationChannel {
  key: "email" | "sms" | "push" | "inapp";
  label: string;
  icon: typeof Bell;
}

const CHANNELS: ReadonlyArray<NotificationChannel> = [
  { key: "email", label: "E-mail", icon: Mail },
  { key: "sms", label: "SMS", icon: Smartphone },
  { key: "push", label: "Push (przegladarka)", icon: Bell },
  { key: "inapp", label: "W aplikacji", icon: Megaphone },
];

interface NotificationRow {
  id: string;
  group: string;
  title: string;
  desc: string;
  recommended: boolean;
  channels: Record<NotificationChannel["key"], boolean>;
}

const ROWS: ReadonlyArray<NotificationRow> = [
  {
    id: "n1",
    group: "Sprawy i terminy",
    title: "Termin procesowy < 48 h",
    desc: "Przypomnienie o zblizajacym sie terminie sprzeciwu, zarzutow, odpowiedzi.",
    recommended: true,
    channels: { email: true, sms: true, push: true, inapp: true },
  },
  {
    id: "n2",
    group: "Sprawy i terminy",
    title: "Zmiana statusu sprawy",
    desc: "Aktualizacja postepowania, decyzja sadu, doreczenie pisma.",
    recommended: true,
    channels: { email: true, sms: false, push: true, inapp: true },
  },
  {
    id: "n3",
    group: "Sprawy i terminy",
    title: "Nowa wiadomosc od prawnika",
    desc: "Odpowiedz prawnika lub pracownika wsparcia.",
    recommended: true,
    channels: { email: true, sms: false, push: true, inapp: true },
  },
  {
    id: "n4",
    group: "Platnosci",
    title: "Rata harmonogramu zaplaty < 7 dni",
    desc: "Przypomnienie o nadchodzacej racie.",
    recommended: true,
    channels: { email: true, sms: false, push: false, inapp: true },
  },
  {
    id: "n5",
    group: "Platnosci",
    title: "Nieudana platnosc",
    desc: "Karta odrzucona, brak srodkow, blad bramki.",
    recommended: true,
    channels: { email: true, sms: true, push: true, inapp: true },
  },
  {
    id: "n6",
    group: "Marketing",
    title: "Newsletter Dlugomat (raz w miesiacu)",
    desc: "Nowe funkcje, case studies, przewodniki.",
    recommended: false,
    channels: { email: true, sms: false, push: false, inapp: false },
  },
  {
    id: "n7",
    group: "Marketing",
    title: "Promocje i kody rabatowe",
    desc: "Okazjonalne kupony, rabaty na pakiety.",
    recommended: false,
    channels: { email: false, sms: false, push: false, inapp: true },
  },
];

const GROUPS = ["Sprawy i terminy", "Platnosci", "Marketing"] as const;

export default function PowiadomieniaPage() {
  return (
    <div className="space-y-6">
      <Link href="/panel/ustawienia" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do ustawien
      </Link>

      <header>
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Ustawienia</p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
          <Bell className="h-7 w-7 text-dlugomat-700" aria-hidden />
          Powiadomienia
        </h1>
        <p className="mt-1 text-sm text-ink-600">
          Wybierz, ktore wydarzenia maja dotrzec i jakim kanalem. Krytyczne terminy zawsze trafia do skrzynki w aplikacji.
        </p>
      </header>

      <Card urgency="normal">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-dlugomat-900">Tryb skupienia (Do Not Disturb)</p>
              <p className="text-xs text-ink-500">Wycisza powiadomienia push i SMS w godzinach 22:00 — 07:00.</p>
            </div>
            <Button variant="secondary" size="sm">Wlaczone · 22:00–07:00</Button>
          </div>
        </CardContent>
      </Card>

      {GROUPS.map((group) => {
        const groupRows = ROWS.filter((r) => r.group === group);
        return (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{group}</CardTitle>
              <CardDescription>{groupRows.length} typow powiadomien</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead className="border-y border-ink-100 bg-ink-50/50 text-xs uppercase tracking-wide text-ink-600">
                  <tr>
                    <th className="px-5 py-2 text-left font-medium">Typ powiadomienia</th>
                    {CHANNELS.map((c) => {
                      const Icon = c.icon;
                      return (
                        <th key={c.key} className="px-2 py-2 text-center font-medium">
                          <span className="inline-flex items-center gap-1">
                            <Icon className="h-3 w-3" aria-hidden />
                            {c.label}
                          </span>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {groupRows.map((r) => (
                    <tr key={r.id}>
                      <td className="px-5 py-3">
                        <div className="flex items-start gap-2">
                          <div>
                            <p className="text-sm font-medium text-dlugomat-900">{r.title}</p>
                            <p className="mt-0.5 text-xs text-ink-500">{r.desc}</p>
                          </div>
                          {r.recommended && <Badge tone="info">Polecane</Badge>}
                        </div>
                      </td>
                      {CHANNELS.map((c) => (
                        <td key={c.key} className="px-2 py-3 text-center">
                          <label className="inline-flex cursor-pointer items-center">
                            <span className="sr-only">
                              {r.title} — {c.label}
                            </span>
                            <input
                              type="checkbox"
                              defaultChecked={r.channels[c.key]}
                              className="h-4 w-4 rounded border-ink-300 text-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
                            />
                          </label>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
      })}

      <div className="flex justify-end gap-2">
        <Button variant="secondary">Anuluj</Button>
        <Button variant="primary">Zapisz ustawienia</Button>
      </div>
    </div>
  );
}
