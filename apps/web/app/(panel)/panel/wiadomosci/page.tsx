import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, MessageSquare, Search, Send, Paperclip, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Wiadomosci — panel",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface Thread {
  id: string;
  with: string;
  role: "Prawnik" | "Wsparcie" | "System";
  preview: string;
  last_at: string;
  unread: number;
  case_id: string | null;
}

function mapRole(raw: string): Thread["role"] {
  if (raw === "lawyer") return "Prawnik";
  if (raw === "system") return "System";
  return "Wsparcie";
}

function fmtWhen(iso: string): string {
  try {
    return new Intl.DateTimeFormat("pl-PL", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

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
}

export default async function WiadomosciPage() {
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/logowanie?next=/panel/wiadomosci");

  const { data: threadRows } = await supabase
    .from("message_threads")
    .select("id, subject, counterpart_role, counterpart_name, last_message_at, unread_count, case_id")
    .order("last_message_at", { ascending: false });

  const threads: Thread[] = (threadRows ?? []).map((t) => ({
    id: t.id,
    with: t.counterpart_name ?? t.subject ?? "Watek",
    role: mapRole(t.counterpart_role ?? "support"),
    preview: t.subject ?? "",
    last_at: t.last_message_at ? fmtWhen(t.last_message_at) : "",
    unread: t.unread_count ?? 0,
    case_id: t.case_id ?? null,
  }));

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);
  const activeThread = threads[0] ?? null;

  let activeMessages: Message[] = [];
  if (activeThread) {
    const { data: msgRows } = await supabase
      .from("messages")
      .select("id, sender, body, created_at")
      .eq("thread_id", activeThread.id)
      .order("created_at", { ascending: true });

    activeMessages = (msgRows ?? []).map((m) => ({
      id: m.id,
      from: m.sender === "user" ? ("me" as const) : ("them" as const),
      author: m.sender === "user" ? "Ty" : activeThread.with,
      body: m.body ?? "",
      at: m.created_at ? fmtWhen(m.created_at) : "",
    }));
  }

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
            {threads.length} watkow, {totalUnread} nieprzeczytanych.
          </p>
        </div>
      </header>

      {threads.length === 0 ? (
        <EmptyState
          title="Brak wiadomosci"
          description="Nie masz jeszcze zadnych watkow. Wiadomosci od prawnikow i wsparcia pojawia sie tutaj."
        />
      ) : (
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
                {threads.map((th, idx) => (
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
                    {activeThread?.with ?? "Watek"}
                  </CardTitle>
                  {activeThread?.case_id && <CardDescription>Sprawa {activeThread.case_id}</CardDescription>}
                </div>
                {activeThread && <Badge tone={ROLE_TONE[activeThread.role]} withDot>{activeThread.role}</Badge>}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3 overflow-y-auto lg:max-h-[480px]">
              {activeMessages.length === 0 ? (
                <p className="py-8 text-center text-sm text-ink-500">Brak wiadomosci w tym watku.</p>
              ) : (
                activeMessages.map((m) => (
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
                    <p className="mt-2 text-[10px] text-ink-500">{m.at}</p>
                  </div>
                ))
              )}
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
      )}
    </div>
  );
}
