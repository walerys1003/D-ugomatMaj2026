import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Moje zgłoszenia — Wsparcie",
  description: "Lista wszystkich Twoich zgłoszeń do działu wsparcia Długomat.",
};
export const dynamic = "force-dynamic";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

const STATUS_TONE: Record<string, "info" | "warning" | "danger" | "success" | "neutral"> = {
  open: "danger",
  in_progress: "warning",
  waiting_user: "info",
  waiting: "info",
  resolved: "success",
  closed: "neutral",
};

const STATUS_LABEL: Record<string, string> = {
  open: "nowe",
  in_progress: "w trakcie",
  waiting_user: "czeka na Ciebie",
  waiting: "czeka na Ciebie",
  resolved: "rozwiązane",
  closed: "zamknięte",
};

const PRIORITY_TONE: Record<string, "info" | "warning" | "danger"> = {
  low: "info",
  normal: "warning",
  high: "danger",
  urgent: "danger",
};

function fmtDate(iso: string): string {
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

async function fetchTickets(): Promise<Ticket[]> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/wsparcie/zgloszenia");
  const { data, error } = await sb
    .from("support_tickets")
    .select("id, subject, status, category, priority, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return [];
  return (data ?? []) as Ticket[];
}

export default async function WsparcieZgloszeniaPage() {
  const TICKETS = await fetchTickets();
  const open = TICKETS.filter((t) => t.status === "open" || t.status === "in_progress").length;
  const waiting = TICKETS.filter((t) => t.status === "waiting_user" || t.status === "waiting").length;
  const resolved = TICKETS.filter((t) => t.status === "resolved" || t.status === "closed").length;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
            Wsparcie · moje zgłoszenia
          </p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950">
            Twoje zgłoszenia
          </h1>
          <p className="max-w-2xl text-ink-600">
            Wszystkie Twoje zgłoszenia do działu wsparcia. Średni czas pierwszej
            odpowiedzi to 2 godziny w dni robocze.
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" aria-hidden />
          Nowe zgłoszenie
        </Button>
      </header>

      <nav aria-label="Widoki wsparcia" className="flex gap-1 rounded-md border border-ink-200 bg-ink-50 p-1 w-fit text-sm">
        <Link
          href="/panel/wsparcie"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Strona główna
        </Link>
        <span className="rounded bg-white px-3 py-1.5 font-semibold text-dlugomat-900 shadow-sm">
          Zgłoszenia
        </span>
        <Link
          href="/panel/wsparcie/baza-wiedzy"
          className="rounded px-3 py-1.5 text-ink-700 hover:bg-white focus-visible:outline-none focus-visible:shadow-shield-focus"
        >
          Baza wiedzy
        </Link>
      </nav>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Statystyki zgłoszeń">
        <Card urgency={open > 0 ? "warning" : "normal"}>
          <CardHeader>
            <CardDescription>Otwarte / w trakcie</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-warn">{open}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Czekają na Twoją odpowiedź</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-dlugomat-700">{waiting}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Rozwiązane / zamknięte</CardDescription>
            <CardTitle className="font-display text-fluid-h2 text-accent-700">{resolved}</CardTitle>
          </CardHeader>
        </Card>
      </section>

      {TICKETS.length === 0 ? (
        <Card>
          <CardHeader>
            <CardDescription>
              Nie masz jeszcze żadnych zgłoszeń. Jeśli napotkasz problem, otwórz
              nowe zgłoszenie — odpowiemy zwykle w ciągu 2 godzin w dni robocze.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <ul className="space-y-3" aria-label="Lista zgłoszeń">
          {TICKETS.map((t) => (
            <li key={t.id}>
              <Link
                href={`/panel/wsparcie/zgloszenia/${t.id}`}
                className="group block rounded-lg border border-ink-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-ink-500">
                        {t.id.slice(0, 8)}
                      </span>
                      <Badge tone={STATUS_TONE[t.status] ?? "neutral"} withDot>
                        {STATUS_LABEL[t.status] ?? t.status}
                      </Badge>
                      <Badge tone={PRIORITY_TONE[t.priority] ?? "info"}>
                        priorytet: {t.priority}
                      </Badge>
                      <Badge tone="neutral">{t.category}</Badge>
                    </div>
                    <h3 className="mt-2 font-semibold text-dlugomat-950 group-hover:text-dlugomat-700">
                      {t.subject}
                    </h3>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden />
                        Utworzone: {fmtDate(t.created_at)}
                      </span>
                      <span aria-hidden>·</span>
                      <span>Aktualizacja: {fmtDate(t.updated_at)}</span>
                    </div>
                  </div>
                  <ArrowRight
                    className="h-5 w-5 flex-shrink-0 text-ink-400 group-hover:text-dlugomat-700"
                    aria-hidden
                  />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
