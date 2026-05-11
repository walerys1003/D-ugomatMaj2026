import * as React from "react";
import Link from "next/link";
import { FileText, Inbox, KeyRound, Link2, ScanLine, Search } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

/**
 * Tier 29 — preset EmptyStates dla najczęstszych "pustych" widoków w panelu.
 */

export function EmptyCases() {
  return (
    <EmptyState
      icon={<FileText className="h-5 w-5" />}
      title="Twoja pierwsza sprawa czeka"
      description="Wybierz kreator dopasowany do Twojej sytuacji albo zeskanuj pismo — AI zrobi resztę."
      action={
        <div className="flex flex-wrap gap-2 justify-center">
          <Button asChild>
            <Link href="/panel/sprawy/nowa">Wybierz kreator</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/panel/skaner">
              <ScanLine className="h-4 w-4" />
              Skanuj pismo
            </Link>
          </Button>
        </div>
      }
    />
  );
}

export function EmptySearchResults({ query }: { query?: string }) {
  return (
    <EmptyState
      icon={<Search className="h-5 w-5" />}
      title="Brak wyników"
      description={
        query
          ? `Nie znaleźliśmy nic dla "${query}". Spróbuj innych słów kluczowych.`
          : "Spróbuj innych słów kluczowych."
      }
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Inbox className="h-5 w-5" />}
      title="Brak nowych powiadomień"
      description="Tu pojawią się alerty o terminach, dokumentach i płatnościach."
    />
  );
}

export function EmptyApiKeys() {
  return (
    <EmptyState
      icon={<KeyRound className="h-5 w-5" />}
      title="Brak kluczy API"
      description="Wygeneruj klucz, aby zintegrować Długomat z Zapier, Make lub własnym kodem."
    />
  );
}

export function EmptyIntegrations() {
  return (
    <EmptyState
      icon={<Link2 className="h-5 w-5" />}
      title="Brak połączonych usług"
      description="Połącz Google Calendar, Microsoft 365 lub inne narzędzia, by synchronizować terminy procesowe."
    />
  );
}
