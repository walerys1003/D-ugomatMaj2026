import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  FileText,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Scale,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata = {
  title: "Szczegoly wydarzenia - Dlugomat",
  description: "Pelne informacje o terminie sprawy: data, podstawa prawna, powiazane dokumenty.",
};

export const dynamic = "force-dynamic";

type Urgency = "low" | "medium" | "high";

const URGENCY_CARD: Record<Urgency, "warning" | "critical" | "normal"> = {
  low: "normal",
  medium: "warning",
  high: "critical",
};

/** Pilnosc na podstawie liczby dni do efektywnego terminu. */
function urgencyFor(effectiveEnd: string, completedAt: string | null): Urgency {
  if (completedAt) return "low";
  const ms = new Date(effectiveEnd).getTime() - Date.now();
  const days = ms / (1000 * 60 * 60 * 24);
  if (days <= 3) return "high";
  if (days <= 14) return "medium";
  return "low";
}

type Params = Promise<{ id: string }>;

export default async function SzczegolyWydarzeniaPage({ params }: { params: Params }) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/logowanie?next=/panel/kalendarz/${id}`);

  const { data: event } = await supabase
    .from("deadlines")
    .select(
      "id, case_id, kind, title, start_date, end_date, effective_end_date, legal_basis, completed_at, reminders_sent",
    )
    .eq("id", id)
    .single();

  if (!event) notFound();

  // Powiazana sprawa + dokumenty (jesli istnieje powiazanie).
  let caseLabel: string | null = null;
  let documents: { id: string; name: string }[] = [];
  if (event.case_id) {
    const [{ data: c }, { data: docs }] = await Promise.all([
      supabase.from("cases").select("id, title").eq("id", event.case_id).single(),
      supabase
        .from("documents")
        .select("id, type, status")
        .eq("case_id", event.case_id)
        .limit(10),
    ]);
    caseLabel = c?.title ?? event.case_id;
    documents = (docs ?? []).map((d) => ({
      id: d.id,
      name: `Dokument: ${d.type} (${d.status})`,
    }));
  }

  const startDate = new Date(event.start_date);
  const endDate = new Date(event.effective_end_date ?? event.end_date);
  const dateFmt = new Intl.DateTimeFormat("pl-PL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" });

  const urgency = urgencyFor(event.effective_end_date ?? event.end_date, event.completed_at);
  const remindersSent = Array.isArray(event.reminders_sent) ? event.reminders_sent : [];
  const isDone = !!event.completed_at;

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/panel/kalendarz"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do kalendarza
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <CalendarDays className="h-6 w-6 text-accent-600" aria-hidden />
            <Badge tone="info">{event.kind}</Badge>
            {caseLabel ? <Badge tone="neutral">Sprawa {caseLabel}</Badge> : null}
            {isDone ? (
              <Badge tone="success" withDot>
                Zakonczony
              </Badge>
            ) : null}
          </div>
          <h1 className="font-display text-3xl text-dlugomat-950 mb-2">{event.title}</h1>
        </header>

        {urgency === "high" && !isDone && (
          <Card urgency={URGENCY_CARD[urgency]} className="mb-6">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-medium text-dlugomat-950 mb-1">Termin krytyczny</p>
                  <p className="text-sm text-dlugomat-800">
                    Do uplywu terminu pozostalo mniej niz 3 dni. Podejmij dzialanie jak najszybciej.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                Termin
              </div>
              <div className="font-display text-xl text-dlugomat-950 capitalize">
                {dateFmt.format(endDate)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                Rozpoczecie
              </div>
              <div className="font-display text-xl text-dlugomat-950 capitalize">
                {dateFmt.format(startDate)} {timeFmt.format(startDate)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-2 flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5" aria-hidden />
                Podstawa prawna
              </div>
              <div className="text-sm text-dlugomat-950 leading-snug">
                {event.legal_basis ?? "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent-600" aria-hidden />
                  Powiazane dokumenty
                </CardTitle>
                <CardDescription>
                  {documents.length} {documents.length === 1 ? "dokument" : "dokumentow"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {documents.length > 0 ? (
                  <ul className="space-y-2">
                    {documents.map((doc) => (
                      <li key={doc.id}>
                        <Link
                          href={`/panel/dokumenty/${doc.id}`}
                          className="flex items-center justify-between gap-3 p-3 rounded-md border border-ink-200 bg-white hover:bg-dlugomat-50 focus-visible:shadow-shield-focus"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-dlugomat-600" aria-hidden />
                            <span className="text-sm text-dlugomat-900">{doc.name}</span>
                          </div>
                          <span className="text-xs text-accent-700">Otworz</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-dlugomat-500">Brak powiazanych dokumentow.</p>
                )}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-accent-600" aria-hidden />
                  Wyslane przypomnienia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {remindersSent.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {remindersSent.map((r, idx) => (
                      <li key={idx} className="flex items-center justify-between">
                        <span className="text-dlugomat-800">{r}</span>
                        <Badge tone="info">wyslano</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-dlugomat-500">Nie wyslano jeszcze przypomnien.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-2">
                {event.case_id ? (
                  <Button variant="primary" block asChild>
                    <Link href={`/panel/sprawy/${event.case_id}`}>Otworz sprawe</Link>
                  </Button>
                ) : null}
                <Button variant="ghost" block asChild>
                  <Link href="/panel/kalendarz">Wroc do kalendarza</Link>
                </Button>
              </CardContent>
            </Card>

            {isDone ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" aria-hidden />
                    <p className="text-sm text-dlugomat-800">Termin zostal oznaczony jako zakonczony.</p>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
