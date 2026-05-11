import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Szablony rozmów AI | Długomat" };

interface ChatTemplate {
  id: string;
  title: string;
  description: string;
  category: "windykacja" | "egzekucja" | "umowy" | "prawo_pracy" | "konsument" | "rodzinne";
  initial_prompt: string;
  usage_count: number;
}

const CATEGORY_LABELS: Record<ChatTemplate["category"], string> = {
  windykacja: "Windykacja",
  egzekucja: "Egzekucja komornicza",
  umowy: "Umowy",
  prawo_pracy: "Prawo pracy",
  konsument: "Prawo konsumenckie",
  rodzinne: "Prawo rodzinne",
};

async function fetchTemplates(category?: string): Promise<ChatTemplate[]> {
  try {
    const qs = category ? `?category=${category}` : "";
    const res = await fetch(`/api/ai/templates${qs}`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.templates ?? [];
  } catch {
    return [];
  }
}

export default async function SzablonyPage({
  searchParams,
}: {
  searchParams: Promise<{ kategoria?: string }>;
}) {
  const sp = await searchParams;
  const templates = await fetchTemplates(sp.kategoria);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/ai-asystent" className="text-xs text-iron-500 hover:text-iron-700">
          ← AI Asystent
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Szablony rozmów
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Gotowe scenariusze rozmowy z asystentem — wybierz, by zacząć od optymalnego promptu.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/panel/ai-asystent/szablony"
          className={`text-sm px-3 py-1.5 rounded-full border transition ${
            !sp.kategoria
              ? "border-iron-900 bg-iron-900 text-iron-50"
              : "border-iron-300 text-iron-700 hover:border-iron-400"
          }`}
        >
          Wszystkie
        </Link>
        {Object.entries(CATEGORY_LABELS).map(([k, label]) => (
          <Link
            key={k}
            href={`/panel/ai-asystent/szablony?kategoria=${k}`}
            className={`text-sm px-3 py-1.5 rounded-full border transition ${
              sp.kategoria === k
                ? "border-iron-900 bg-iron-900 text-iron-50"
                : "border-iron-300 text-iron-700 hover:border-iron-400"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {templates.length === 0 ? (
        <Card elevation="subtle">
          <CardContent className="pt-6 text-sm text-iron-500">
            Brak szablonów w tej kategorii.
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {templates.map((t) => (
            <Card key={t.id} elevation="subtle">
              <CardHeader>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-iron-100 dark:bg-iron-800 text-iron-700 dark:text-iron-300">
                    {CATEGORY_LABELS[t.category]}
                  </span>
                  <span className="text-xs text-iron-500">{t.usage_count} użyć</span>
                </div>
                <CardTitle className="text-base">{t.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-iron-600 dark:text-iron-400 line-clamp-2">
                  {t.description}
                </p>
                <p className="text-xs italic text-iron-500 line-clamp-2">
                  "{t.initial_prompt}"
                </p>
                <form method="post" action={`/api/ai/templates/${t.id}/start`}>
                  <Button type="submit" variant="primary" className="w-full">
                    Rozpocznij rozmowę
                  </Button>
                </form>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
