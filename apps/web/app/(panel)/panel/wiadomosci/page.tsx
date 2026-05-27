import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MessageSquare, Search, Send, Paperclip, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Wiadomosci — panel",
  robots: { index: false, follow: false },
};

interface Thread {
  id: string;
  with: string;
  role: "Prawnik" | "Wsparcie" | "System";
  preview: string;
  last_at: string;
  unread: number;
  case_id: string | null;
}

const THREADS: ReadonlyArray<Thread> = [
  {
    id: "th1",
    with: "Adw. Anna Nowak",
    role: "Prawnik",
    preview: "Wyslalam projekt sprzeciwu, prosze przejrzec do jutra rano.",
    last_at: "2026-05-11 09:14",
    unread: 2,
    case_id: "C-2026-0142",
  },
  {
    id: "th2",
    with: "Wsparcie Dlugomat",
    role: "Wsparcie",
    preview: "Potwierdzamy wystawienie faktury FV/2026/05/0142. PDF w zalaczniku.",
    last_at: "2026-05-10 16:42",
    unread: 0,
    case_id: null,
  },
  {
    id: "th3",
    with: "Adw. Piotr Kowalski",
    role: "Prawnik",
    preview: "Termin rozprawy potwierdzony na 7 maja, godz. 13:30.",
    last_at: "2026-05-09 11:20",
    unread: 0,
    case_id: "C-2026-0139",
  },
  {
    id: "th4",
    with: "System Dlugomat",
    role: "System",
    preview: "Przypomnienie: termin sprzeciwu EPU mija za 3 dni.",
    last_at: "2026-05-08 08:00",
    unread: 1,
    case_id: "C-2026-0142",
  },
  {
    id: "th5",
    with: "Wsparcie Dlugomat",
    role: "Wsparcie",
    preview: "Zwrot oplaty sadowej zostal zaksiegowany na Twoim koncie.",
    last_at: "2026-04-28 14:55",
    unread: 0,
    case_id: null,
  },
];

const ROLE_TONE: Record<Thread["role"], "info" | "neutral" | "warning"> = {
  Prawnik: "info",
  Wsparcie: "neutral",
  System: "warning",
};

interface Message {
  id: string;
  from: "me" | "them";
  author: string;
  body: string;
  at: string;
  attachments?: ReadonlyArray<string>;
}

const ACTIVE_MESSAGES: ReadonlyArray<Message> = [
  {
    id: "m1",
    from: "them",
    author: "Adw. Anna Nowak",
    body: "Dzien dobry, zapoznalam sie z nakazem zaplaty. Sugeruje sprzeciw oparty na art. 506 KPC.",
    at: "2026-05-10 10:30",
  },
  {
    id: "m2",
    from: "me",
    author: "Ty",
    body: "Dziekuje. Jakie dokumenty bede potrzebowal?",
    at: "2026-05-10 10:45",
  },
  {
    id: "m3",
    from: "them",
    author: "Adw. Anna Nowak",
    body: "Wyciag z BIK, potwierdzenie wplaty z 2019 oraz korespondencja mailowa z bankiem. Wyslalam projekt sprzeciwu, prosze przejrzec do jutra rano.",
    at: "2026-05-11 09:14",
    attachments: ["sprzeciw_projekt_v1.pdf"],
  },
];

export default function WiadomosciPage() {
  const totalUnread = THREADS.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="space-y-6">
      <Link href="/panel" className="inline-flex items-center gap-2 text-sm text-ink-600 hover:text-dlugomat-900">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Powrot do panelu
      </Link>

      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-ink-500">Wiadomosci</p>
          <h1 className="font-display text-fluid-h1 text-dlugomat-950 flex items-center gap-3">
            <MessageSquare className="h-7 w-7 text-dlugomat-700" aria-hidden />
            Skrzynka odbiorcza
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            {THREADS.length} watkow, {totalUnread} nieprzeczytanych.
          </p>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="lg:max-h-[640px] lg:overflow-y-auto">
          <CardHeader>
            <label className="relative">
              <span className="sr-only">Szukaj watku</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" aria-hidden />
              <input
                type="search"
                placeholder="Szukaj..."
                className="h-9 w-full rounded-md border border-ink-200 pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-ink-100">
              {THREADS.map((th, idx) => (
                <li key={th.id}>
                  <button
                    type="button"
                    className={`w-full px-5 py-3 text-left transition-colors hover:bg-ink-50 focus-visible:outline-none focus-visible:shadow-shield-focus ${
                      idx === 0 ? "bg-ink-50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-dlugomat-900">{th.with}</p>
                      {th.unread > 0 && <Badge tone="info">{th.unread}</Badge>}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge tone={ROLE_TONE[th.role]}>{th.role}</Badge>
                      {th.case_id && <span className="font-mono text-[10px] text-ink-500">{th.case_id}</span>}
                    </div>
                    <p className="mt-1 line-clamp-1 text-xs text-ink-600">{th.preview}</p>
                    <p className="mt-1 text-[10px] text-ink-400">{th.last_at}</p>
                  </button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5 text-dlugomat-700" aria-hidden />
                  Adw. Anna Nowak
                </CardTitle>
                <CardDescription>Sprawa C-2026-0142 · Sprzeciw EPU</CardDescription>
              </div>
              <Badge tone="info" withDot>Prawnik</Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-3 overflow-y-auto lg:max-h-[480px]">
            {ACTIVE_MESSAGES.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-lg border p-3 ${
                  m.from === "me"
                    ? "ml-auto border-dlugomat-200 bg-dlugomat-50/50"
                    : "border-ink-200 bg-white"
                }`}
              >
                <p className="text-xs font-medium text-dlugomat-900">{m.author}</p>
                <p className="mt-1 text-sm text-dlugomat-800">{m.body}</p>
                {m.attachments && (
                  <ul className="mt-2 space-y-1">
                    {m.attachments.map((a) => (
                      <li key={a} className="flex items-center gap-1 text-xs text-dlugomat-700">
                        <Paperclip className="h-3 w-3" aria-hidden />
                        <span className="underline">{a}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-[10px] text-ink-500">{m.at}</p>
              </div>
            ))}
          </CardContent>
          <div className="border-t border-ink-100 p-4">
            <div className="flex items-end gap-2">
              <textarea
                rows={2}
                placeholder="Napisz odpowiedz..."
                className="flex-1 resize-none rounded-md border border-ink-200 p-2 text-sm focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
              <Button variant="secondary" size="sm" aria-label="Dodaj zalacznik">
                <Paperclip className="h-4 w-4" aria-hidden />
              </Button>
              <Button variant="primary">
                <Send className="mr-2 h-4 w-4" aria-hidden />
                Wyslij
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
