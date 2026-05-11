import type { Metadata } from "next";
import { CheckCircle2, Shield, Sparkles, Wrench, ZapOff } from "lucide-react";

import { RELEASE_HISTORY, type ReleaseNote } from "@/lib/launch/release-notes";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Changelog · Długomat",
  description: "Najnowsze zmiany, funkcje i poprawki w Długomat.",
};

const TYPE_META: Record<
  ReleaseNote["changes"][number]["type"],
  { label: string; icon: any; tone: "info" | "success" | "warning" | "neutral" }
> = {
  feature: { label: "Nowość", icon: Sparkles, tone: "info" },
  fix: { label: "Poprawka", icon: Wrench, tone: "neutral" },
  improvement: { label: "Ulepszenie", icon: CheckCircle2, tone: "success" },
  security: { label: "Bezpieczeństwo", icon: Shield, tone: "warning" },
  breaking: { label: "Breaking", icon: ZapOff, tone: "warning" },
};

export default function ChangelogPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12">
      <header>
        <h1 className="text-fluid-3xl font-bold text-iron-900 dark:text-white">Changelog</h1>
        <p className="mt-2 text-fluid-base text-iron-600 dark:text-iron-300">
          Wszystkie zmiany w Długomacie — funkcje, poprawki, bezpieczeństwo.
        </p>
      </header>

      <div className="flex flex-col gap-12">
        {RELEASE_HISTORY.map((release) => (
          <article key={release.version} className="border-l-2 border-dlugomat-200 pl-6 dark:border-dlugomat-700">
            <header className="mb-4 flex items-baseline gap-3">
              <h2 className="text-fluid-2xl font-bold text-iron-900 dark:text-white">
                {release.version}
              </h2>
              <time className="text-fluid-sm text-iron-500">
                {new Date(release.date).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </header>

            {release.highlights.length > 0 && (
              <ul className="mb-4 flex flex-col gap-1 rounded-lg bg-dlugomat-50 p-4 dark:bg-dlugomat-950">
                {release.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-fluid-sm text-iron-800 dark:text-iron-200">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-dlugomat-600" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}

            <ul className="flex flex-col gap-2">
              {release.changes.map((c, i) => {
                const meta = TYPE_META[c.type];
                const Icon = meta.icon;
                return (
                  <li key={i} className="flex items-start gap-3 text-fluid-sm">
                    <Badge tone={meta.tone} withDot>
                      <Icon className="h-3 w-3" />
                      {meta.label}
                    </Badge>
                    <span className="flex-1 text-iron-700 dark:text-iron-300">{c.description}</span>
                  </li>
                );
              })}
            </ul>

            {release.migration_notes && (
              <p className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-fluid-sm text-amber-900 dark:bg-amber-950 dark:text-amber-100">
                <strong>Migracja:</strong> {release.migration_notes}
              </p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
