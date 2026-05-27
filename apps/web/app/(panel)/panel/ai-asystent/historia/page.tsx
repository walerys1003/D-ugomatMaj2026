import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, MessageSquare, Search } from "lucide-react";

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
  title: "Historia rozmów — AI asystent",
  description: "Wszystkie poprzednie rozmowy z asystentem prawnym Długomat.",
};

interface Conversation {
  id: string;
  title: string;
  topic: "BIK" | "Komornik" | "Bank" | "Upadłość" | "Inne";
  last_message_at: string;
  message_count: number;
  preview: string;
  pinned: boolean;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: "conv_001",
    title: "Korekta wpisu BIK — kredyt z 2019",
    topic: "BIK",
    last_message_at: "2026-05-10T16:24:00Z",
    message_count: 14,
    preview:
      "Rozumiem. W Twojej sytuacji warto złożyć wniosek o korektę powołując się na art. 105a Prawa bankowego...",
    pinned: true,
  },
  {
    id: "conv_002",
    title: "Egzekucja komornicza — zajęcie wynagrodzenia",
    topic: "Komornik",
    last_message_at: "2026-05-08T11:42:00Z",
    message_count: 22,
    preview:
      "Kwota wolna od egzekucji w 2026 wynosi 75% minimalnego wynagrodzenia, czyli...",
    pinned: true,
  },
  {
    id: "conv_003",
    title: "Reklamacja błędnej raty kredytu",
    topic: "Bank",
    last_message_at: "2026-05-05T09:18:00Z",
    message_count: 8,
    preview:
      "Bank ma 30 dni na odpowiedź. Jeśli nie zareaguje — możesz skierować sprawę do Rzecznika Finansowego...",
    pinned: false,
  },
  {
    id: "conv_004",
    title: "Upadłość konsumencka — czy się kwalifikuję?",
    topic: "Upadłość",
    last_message_at: "2026-04-28T14:05:00Z",
    message_count: 31,
    preview:
      "Aby ogłosić upadłość konsumencką musisz wykazać niewypłacalność trwającą co najmniej 3 miesiące...",
    pinned: false,
  },
  {
    id: "conv_005",
    title: "Negocjacje z firmą windykacyjną BestCollect",
    topic: "Inne",
    last_message_at: "2026-04-22T17:33:00Z",
    message_count: 11,
    preview:
      "Pamiętaj, że firma windykacyjna nie ma uprawnień komornika. Możesz wnioskować o ugodę...",
    pinned: false,
  },
  {
    id: "conv_006",
    title: "Przedawnienie długu z 2018 roku",
    topic: "Inne",
    last_message_at: "2026-04-12T10:48:00Z",
    message_count: 6,
    preview:
      "Standardowy termin przedawnienia roszczeń to 6 lat (art. 118 KC). W Twoim przypadku...",
    pinned: false,
  },
];

const TOPIC_TONE: Record<Conversation["topic"], "info" | "warning" | "neutral" | "danger" | "success"> = {
  BIK: "info",
  Komornik: "danger",
  Bank: "warning",
  Upadłość: "neutral",
  Inne: "success",
};

function fmtRelative(iso: string): string {
  const ts = new Date(iso).getTime();
  const now = new Date("2026-05-11T12:00:00Z").getTime();
  const diff = now - ts;
  const day = 24 * 60 * 60 * 1000;
  if (diff < day) return "dzisiaj";
  if (diff < 2 * day) return "wczoraj";
  if (diff < 7 * day) return `${Math.floor(diff / day)} dni temu`;
  return new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium" }).format(new Date(iso));
}

export default function AiAsystentHistoriaPage() {
  const pinned = CONVERSATIONS.filter((c) => c.pinned);
  const rest = CONVERSATIONS.filter((c) => !c.pinned);
  const totalMessages = CONVERSATIONS.reduce((s, c) => s + c.message_count, 0);

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-ink-500">
          AI asystent · historia
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Twoje rozmowy
        </h1>
        <p className="max-w-2xl text-ink-600">
          Wszystkie rozmowy z asystentem prawnym. Możesz wrócić do dowolnej,
          kontynuować lub przypiąć ją na górze listy.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Podsumowanie">
        <Card>
          <CardHeader>
            <CardDescription>Rozmowy łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {CONVERSATIONS.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Wiadomości łącznie</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {totalMessages.toLocaleString("pl-PL")}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Przypięte</CardDescription>
            <CardTitle className="font-display text-fluid-h3 text-dlugomat-950">
              {pinned.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>
            <Search className="mr-2 inline h-4 w-4" aria-hidden />
            Szukaj w historii
          </CardTitle>
          <CardDescription>Pełnotekstowe wyszukiwanie po treści wiadomości</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex gap-2">
            <input
              type="search"
              placeholder="np. komornik wynagrodzenie"
              className="flex-1 rounded-md border border-ink-300 bg-white px-3 py-2 text-sm focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus"
            />
            <Button type="submit">Szukaj</Button>
          </form>
        </CardContent>
      </Card>

      {pinned.length > 0 ? (
        <section aria-label="Przypięte rozmowy" className="space-y-3">
          <h2 className="font-display text-fluid-h4 text-dlugomat-950">Przypięte</h2>
          <ul className="space-y-3">
            {pinned.map((c) => (
              <li key={c.id}>
                <ConversationCard c={c} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section aria-label="Wszystkie rozmowy" className="space-y-3">
        <h2 className="font-display text-fluid-h4 text-dlugomat-950">Wszystkie</h2>
        <ul className="space-y-3">
          {rest.map((c) => (
            <li key={c.id}>
              <ConversationCard c={c} />
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-center">
        <Button variant="ghost" asChild>
          <Link href="/panel/ai-asystent">
            <MessageSquare className="mr-2 h-4 w-4" aria-hidden />
            Nowa rozmowa
          </Link>
        </Button>
      </div>
    </div>
  );
}

function ConversationCard({ c }: { c: Conversation }) {
  return (
    <Link
      href={`/panel/ai-asystent?conv=${c.id}`}
      className="group block rounded-lg border border-ink-200 bg-white p-5 shadow-card transition hover:shadow-pop focus-visible:outline-none focus-visible:shadow-shield-focus"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-dlugomat-950 group-hover:text-dlugomat-700">
              {c.title}
            </h3>
            <Badge tone={TOPIC_TONE[c.topic]} withDot>
              {c.topic}
            </Badge>
          </div>
          <p className="mt-2 line-clamp-2 text-sm text-ink-600">{c.preview}</p>
          <div className="mt-3 flex items-center gap-3 text-xs text-ink-500">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden />
              {fmtRelative(c.last_message_at)}
            </span>
            <span aria-hidden>·</span>
            <span>{c.message_count} wiadomości</span>
          </div>
        </div>
        <ArrowRight
          className="h-5 w-5 flex-shrink-0 text-ink-400 group-hover:text-dlugomat-700"
          aria-hidden
        />
      </div>
    </Link>
  );
}
