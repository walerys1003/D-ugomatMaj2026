import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Domeny | Organizacja | Długomat" };

interface DomainRow {
  id: string;
  domain: string;
  status: "verified" | "pending" | "failed";
  txt_record: string;
  verified_at?: string;
}

async function fetchDomains(): Promise<DomainRow[]> {
  try {
    const res = await fetch("/api/orgs/domains", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.domains ?? [];
  } catch {
    return [];
  }
}

const STATUS_BADGE: Record<DomainRow["status"], string> = {
  verified: "bg-accent-50 text-accent-700 border-accent-200",
  pending: "bg-warn-50 text-warn-700 border-warn-200",
  failed: "bg-danger-50 text-danger-700 border-danger-200",
};

const STATUS_LABEL: Record<DomainRow["status"], string> = {
  verified: "Zweryfikowana",
  pending: "Oczekuje",
  failed: "Niepowodzenie",
};

export default async function DomenyPage() {
  const domains = await fetchDomains();

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
      <div>
        <Link href="/panel/organizacja" className="text-xs text-ink-500 hover:text-ink-700">
          ← Organizacja
        </Link>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50 mt-2">
          Domeny firmowe
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Zweryfikuj domeny, aby uzyskać automatyczne dołączanie e-maili firmowych do organizacji.
        </p>
      </div>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Dodaj domenę</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            method="post"
            action="/api/orgs/domains"
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              name="domain"
              required
              placeholder="firma.pl"
              className="flex-1 rounded-lg border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-900 px-3 py-2 focus:outline-none focus-visible:shadow-shield-focus"
            />
            <Button type="submit" variant="primary">
              Dodaj
            </Button>
          </form>
          <p className="text-xs text-ink-500 mt-2">
            Po dodaniu zobaczysz rekord TXT, który należy umieścić w DNS.
          </p>
        </CardContent>
      </Card>

      <Card elevation="subtle">
        <CardHeader>
          <CardTitle>Twoje domeny</CardTitle>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <p className="text-sm text-ink-500">Brak dodanych domen.</p>
          ) : (
            <ul className="space-y-3">
              {domains.map((d) => (
                <li
                  key={d.id}
                  className="rounded-lg border border-ink-200 dark:border-ink-800 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="font-mono text-sm font-medium text-ink-900 dark:text-ink-50">
                      {d.domain}
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_BADGE[d.status]}`}
                    >
                      {STATUS_LABEL[d.status]}
                    </span>
                  </div>
                  {d.status !== "verified" && (
                    <div className="text-xs text-ink-600 dark:text-ink-400">
                      Rekord TXT:{" "}
                      <code className="font-mono px-1.5 py-0.5 rounded bg-ink-100 dark:bg-ink-800">
                        {d.txt_record}
                      </code>
                    </div>
                  )}
                  {d.verified_at && (
                    <div className="text-xs text-ink-500">
                      Zweryfikowano: {new Date(d.verified_at).toLocaleDateString("pl-PL")}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
