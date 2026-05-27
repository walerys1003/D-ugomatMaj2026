import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatStream } from "@/components/ai/chat-stream";

export const metadata: Metadata = {
  title: "AI Asystent prawny | Długomat",
  description: "Asystent prawny z cytowaniami z bazy orzeczniczej i aktów prawnych.",
};

const QUICK_PROMPTS = [
  "Jakie są przesłanki przedawnienia roszczenia z umowy najmu?",
  "Czy mogę odwołać się od nakazu zapłaty w postępowaniu upominawczym?",
  "Jak wygląda procedura zwolnienia z kosztów sądowych?",
  "Jakie dokumenty są potrzebne do wniosku o ogłoszenie upadłości konsumenckiej?",
];

export default function AiAsystentPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">Asystent AI</p>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
          AI Asystent prawny
        </h1>
        <p className="text-sm text-ink-500 mt-1">
          Pyta — odpowiadamy z cytowaniami z bazy orzeczniczej, ustaw i wzorcami pism.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_300px] gap-6">
        <div>
          <ChatStream
            placeholder="Zadaj pytanie prawne (np. o przedawnienie, egzekucję, koszty sądowe)..."
          />
          <p className="text-xs text-ink-500 mt-2">
            Odpowiedzi mają charakter informacyjny i nie zastępują porady prawnika.
            Wersjonowanie promptów, bezpieczeństwo i RODO — patrz{" "}
            <Link href="/dokumentacja/ai" className="text-accent-700 hover:text-accent-800">
              dokumentacja AI
            </Link>
            .
          </p>
        </div>

        <aside className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Szybkie pytania</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {QUICK_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left text-sm text-ink-700 dark:text-ink-300 rounded-md border border-ink-200 dark:border-ink-800 px-3 py-2 hover:border-accent-400 hover:text-accent-700 transition focus:outline-none focus-visible:shadow-shield-focus"
                >
                  {p}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="text-base">Powiązane</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Link
                href="/panel/ai-asystent/szablony"
                className="block text-accent-700 hover:text-accent-800"
              >
                → Szablony rozmów
              </Link>
              <Link
                href="/panel/baza-orzecznicza"
                className="block text-accent-700 hover:text-accent-800"
              >
                → Baza orzecznicza
              </Link>
              <Link
                href="/panel/dokumenty"
                className="block text-accent-700 hover:text-accent-800"
              >
                → Twoje dokumenty
              </Link>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
