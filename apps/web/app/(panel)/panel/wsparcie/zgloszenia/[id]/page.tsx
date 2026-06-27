import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Zgloszenie wsparcia — Dlugomat",
  description: "Watek zgloszenia z historia odpowiedzi.",
};

export const dynamic = "force-dynamic";

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

/** Etykieta i ton dla nadawcy wiadomosci. */
function senderMeta(sender: string): { label: string; tone: "neutral" | "info" | "success" } {
  const s = sender.toLowerCase();
  if (s === "user" || s === "client") return { label: "Ty", tone: "neutral" };
  if (s === "system") return { label: "System", tone: "neutral" };
  if (s === "lawyer" || s === "radca") return { label: "Prawnik", tone: "success" };
  return { label: "Wsparcie", tone: "info" };
}

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/logowanie?next=/panel/wsparcie/zgloszenia/${id}`);

  const { data: thread } = await supabase
    .from("message_threads")
    .select("id, case_id, subject, counterpart_role, counterpart_name, last_message_at, unread_count, created_at")
    .eq("id", id)
    .single();

  if (!thread) return notFound();

  const { data: messagesRaw } = await supabase
    .from("messages")
    .select("id, sender, body, created_at")
    .eq("thread_id", id)
    .order("created_at", { ascending: true });

  const messages = messagesRaw ?? [];
  const isUnread = (thread.unread_count ?? 0) > 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <Link href="/panel/wsparcie" className="text-sm text-slate-600 hover:text-slate-900">
          ← Moje zgloszenia
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">#{thread.id.slice(0, 8)}</span>
              <Badge tone={isUnread ? "warning" : "success"} withDot>
                {isUnread ? "Nowe odpowiedzi" : "Brak nowych"}
              </Badge>
              {thread.counterpart_role ? (
                <Badge tone="info">{thread.counterpart_role}</Badge>
              ) : null}
            </div>
            <h1 className="mt-2 font-display text-2xl text-slate-900">{thread.subject}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Rozmowca: {thread.counterpart_name ?? "—"}
            </p>
          </div>
          <div className="shrink-0 text-right text-sm">
            <p className="inline-flex items-center gap-1 text-slate-700">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              {thread.last_message_at ? fmtTime(thread.last_message_at) : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">Utworzono {fmtTime(thread.created_at)}</p>
          </div>
        </div>
      </div>

      <Card elevation="subtle" className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Konwersacja</CardTitle>
          <CardDescription>
            {messages.length} {messages.length === 1 ? "wiadomosc" : "wiadomosci"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">Ten watek nie zawiera jeszcze wiadomosci.</p>
          ) : (
            messages.map((msg) => {
              const meta = senderMeta(msg.sender);
              return (
                <article key={msg.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <header className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100">
                        <User className="h-3.5 w-3.5 text-slate-500" />
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{meta.label}</p>
                        <Badge tone={meta.tone}>{msg.sender}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">{fmtTime(msg.created_at)}</p>
                  </header>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {msg.body}
                  </p>
                </article>
              );
            })
          )}
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardContent className="py-5">
          <p className="text-sm text-slate-600">
            Aby dodac odpowiedz do tego zgloszenia, przejdz do{" "}
            <Link href="/panel/wiadomosci" className="text-accent-700 underline">
              centrum wiadomosci
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
