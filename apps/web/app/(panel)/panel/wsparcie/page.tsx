import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Wsparcie | Długomat" };

interface SupportTicket {
  id: string;
  subject: string;
  category: "billing" | "technical" | "legal" | "feature_request" | "other";
  status: "open" | "in_progress" | "waiting_user" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  created_at: string;
  updated_at: string;
  unread_replies: number;
}

const STATUS_BADGE: Record<SupportTicket["status"], string> = {
  open: "bg-warn-50 text-warn-700 border-warn-200",
  in_progress: "bg-accent-50 text-accent-700 border-accent-200",
  waiting_user: "bg-warn-50 text-warn-700 border-warn-200",
  resolved: "bg-accent-50 text-accent-700 border-accent-200",
  closed: "bg-ink-100 text-ink-600 border-ink-200",
};

const STATUS_LABEL: Record<SupportTicket["status"], string> = {
  open: "Nowe",
  in_progress: "W trakcie",
  waiting_user: "Oczekuje na Ciebie",
  resolved: "Rozwiązane",
  closed: "Zamknięte",
};

const CATEGORY_LABEL: Record<SupportTicket["category"], string> = {
  billing: "Rozliczenia",
  technical: "Techniczne",
  legal: "Prawne",
  feature_request: "Sugestia",
  other: "Inne",
};

async function fetchTickets(): Promise<SupportTicket[]> {
  try {
    const res = await fetch("/api/support/tickets", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.tickets ?? [];
  } catch {
    return [];
  }
}

const FAQ_ITEMS = [
  {
    q: "Jak zmienić plan subskrypcji?",
    a: "Wejdź w Organizacja → Rozliczenia → Zmień plan. Zmiana zostanie naliczona pro rata.",
  },
  {
    q: "Czy mogę eksportować swoje dane?",
    a: "Tak — w Ustawieniach jest pełny eksport GDPR (JSON + PDF) zgodny z art. 20 RODO.",
  },
  {
    q: "Jak Długomat liczy przedawnienie?",
    a: "Zgodnie z art. 118 KC i regułą końca roku kalendarzowego. Patrz dokumentacja i kalkulator.",
  },
  {
    q: "Czy AI Asystent jest bezpieczny dla danych klientów?",
    a: "Tak — dane są anonimizowane przed wysłaniem do LLM, retencja 0 dni u dostawcy modelu.",
  },
];

export default async function WsparciePage() {
  const tickets = await fetchTickets();
  const openCount = tickets.filter(
    (t) => t.status === "open" || t.status === "in_progress" || t.status === "waiting_user",
  ).length;

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">Pomoc</p>
          <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
            Wsparcie
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {openCount} aktywnych zgłoszeń · średni czas odpowiedzi: 2h w godzinach pracy
          </p>
        </div>
        <Link href="/panel/wsparcie/nowe">
          <Button variant="primary">+ Nowe zgłoszenie</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card elevation="subtle" className="md:col-span-2">
          <CardHeader>
            <CardTitle>Twoje zgłoszenia</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-sm text-ink-500">
                Brak zgłoszeń. Napotkałeś problem? Otwórz nowy ticket.
              </p>
            ) : (
              <ul className="divide-y divide-ink-100 dark:divide-ink-900">
                {tickets.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/panel/wsparcie/${t.id}`}
                      className="block py-3 hover:bg-ink-50 dark:hover:bg-ink-900 -mx-2 px-2 rounded-md transition"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                        <div className="font-medium text-ink-900 dark:text-ink-50 flex items-center gap-2">
                          {t.subject}
                          {t.unread_replies > 0 && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-accent-600 text-ink-50">
                              {t.unread_replies}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[t.status]}`}
                        >
                          {STATUS_LABEL[t.status]}
                        </span>
                      </div>
                      <div className="text-xs text-ink-500">
                        {CATEGORY_LABEL[t.category]} ·{" "}
                        {new Date(t.updated_at).toLocaleDateString("pl-PL")}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Kanały kontaktu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500 mb-0.5">
                E-mail
              </div>
              <a
                href="mailto:wsparcie@dlugomat.pl"
                className="text-accent-700 hover:text-accent-800"
              >
                wsparcie@dlugomat.pl
              </a>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500 mb-0.5">
                Telefon (Enterprise)
              </div>
              <div className="text-ink-900 dark:text-ink-50">+48 22 000 00 00</div>
              <div className="text-xs text-ink-500">Pn–Pt 9:00–17:00</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-ink-500 mb-0.5">
                Status systemu
              </div>
              <Link
                href="/status"
                className="text-accent-700 hover:text-accent-800 text-sm"
              >
                status.dlugomat.pl →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Najczęstsze pytania</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FAQ_ITEMS.map((f, i) => (
              <details
                key={i}
                className="rounded-lg border border-ink-200 dark:border-ink-800 px-4 py-3"
              >
                <summary className="text-sm font-medium text-ink-900 dark:text-ink-50 cursor-pointer">
                  {f.q}
                </summary>
                <p className="text-sm text-ink-600 dark:text-ink-400 mt-2">{f.a}</p>
              </details>
            ))}
          </div>
          <Link
            href="/dokumentacja"
            className="inline-flex items-center gap-1 text-sm text-accent-700 hover:text-accent-800 mt-4"
          >
            Pełna baza wiedzy →
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
