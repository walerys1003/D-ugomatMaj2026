import type { Metadata } from "next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Zespol firmy - panel firmy | Dlugomat",
  description: "Zarzadzanie uzytkownikami firmy: role, uprawnienia, zaproszenia, audyt logowan.",
};

const team = [
  { name: "Anna Nowak", email: "anna.nowak@firma.pl", role: "Wlasciciel", lastSeen: "11.05.2026 09:24", mfa: true, cases: 24 },
  { name: "Piotr Kowalski", email: "p.kowalski@firma.pl", role: "Manager portfela", lastSeen: "11.05.2026 08:51", mfa: true, cases: 142 },
  { name: "Magdalena Wisniewska", email: "m.wisniewska@firma.pl", role: "Analityk", lastSeen: "10.05.2026 17:14", mfa: true, cases: 0 },
  { name: "Tomasz Lewandowski", email: "t.lewandowski@firma.pl", role: "Operator", lastSeen: "10.05.2026 16:02", mfa: false, cases: 87 },
  { name: "Karolina Mazur", email: "k.mazur@firma.pl", role: "Operator", lastSeen: "09.05.2026 12:48", mfa: true, cases: 56 },
  { name: "Robert Krol", email: "r.krol@firma.pl", role: "Ksiegowosc", lastSeen: "08.05.2026 09:12", mfa: true, cases: 0 },
];

const roleTone: Record<string, "neutral" | "info" | "success" | "warning" | "danger"> = {
  Wlasciciel: "info",
  "Manager portfela": "info",
  Analityk: "neutral",
  Operator: "neutral",
  Ksiegowosc: "neutral",
};

const pending = [
  { email: "nowy.uzytkownik@firma.pl", role: "Operator", invited: "10.05.2026" },
  { email: "audytor@firma.pl", role: "Analityk", invited: "08.05.2026" },
];

export default function FirmaZespolPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Panel firmy - administracja
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Zespol firmy</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Zarzadzaj rolami i uprawnieniami uzytkownikow w organizacji. Wymuszaj MFA, deleguj sprawy
            do operatorow i kontroluj dostepy do raportow finansowych.
          </p>
        </div>
        <Button variant="primary" size="md">Zapros uzytkownika</Button>
      </header>

      <section aria-label="Statystyki zespolu" className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Uzytkownikow aktywnych</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">6</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">MFA wlaczone</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">5 / 6</p>
          <Badge tone="warning" className="mt-3">1 wymaga aktywacji</Badge>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Zaproszenia oczekujace</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">2</p>
        </Card>
        <Card elevation="subtle" className="p-5">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Limit planu</p>
          <p className="mt-2 font-display text-2xl text-dlugomat-900">15 osob</p>
        </Card>
      </section>

      <section aria-label="Lista zespolu">
        <Card elevation="subtle" className="overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-dlugomat-50 text-xs uppercase tracking-wide text-dlugomat-500">
              <tr>
                <th className="px-6 py-3">Uzytkownik</th>
                <th className="px-6 py-3">Rola</th>
                <th className="px-6 py-3">Sprawy</th>
                <th className="px-6 py-3">MFA</th>
                <th className="px-6 py-3">Ostatnia aktywnosc</th>
                <th className="px-6 py-3 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dlugomat-100">
              {team.map((u) => (
                <tr key={u.email} className="text-dlugomat-700">
                  <td className="px-6 py-3">
                    <div className="font-medium text-dlugomat-900">{u.name}</div>
                    <div className="text-xs text-dlugomat-500">{u.email}</div>
                  </td>
                  <td className="px-6 py-3">
                    <Badge tone={roleTone[u.role] ?? "neutral"}>{u.role}</Badge>
                  </td>
                  <td className="px-6 py-3 font-mono">{u.cases}</td>
                  <td className="px-6 py-3">
                    {u.mfa ? <Badge tone="success">aktywne</Badge> : <Badge tone="warning">wylaczone</Badge>}
                  </td>
                  <td className="px-6 py-3 text-xs">{u.lastSeen}</td>
                  <td className="px-6 py-3 text-right">
                    <button type="button" className="text-xs font-medium text-accent-600 hover:underline">
                      Edytuj
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {pending.length > 0 ? (
        <section aria-label="Zaproszenia oczekujace">
          <Card elevation="subtle" className="p-6">
            <h2 className="font-display text-lg text-dlugomat-900">Zaproszenia oczekujace</h2>
            <ul className="mt-4 space-y-3 text-sm">
              {pending.map((p) => (
                <li key={p.email} className="flex items-center justify-between rounded-md bg-dlugomat-50 px-4 py-3">
                  <div>
                    <div className="font-medium text-dlugomat-900">{p.email}</div>
                    <div className="text-xs text-dlugomat-500">
                      Rola: {p.role} - wyslano {p.invited}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">Ponow</Button>
                    <Button variant="ghost" size="sm">Anuluj</Button>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
