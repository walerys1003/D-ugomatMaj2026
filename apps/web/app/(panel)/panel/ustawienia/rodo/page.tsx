import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Download, History, Shield, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

import { DeleteAccountForm } from "./delete-form";

export const metadata: Metadata = {
  title: "Twoje dane (RODO) · Długomat",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * RODO dashboard — implementuje dwa kluczowe prawa:
 *   - art. 20 RODO: prawo do przenoszenia danych (eksport JSON)
 *   - art. 17 RODO: prawo do usunięcia ("prawo do bycia zapomnianym")
 *
 * Dodatkowo eksponuje informacje o przetwarzaniu (transparentność —
 * art. 13 RODO) z linkiem do polityki prywatności.
 */
export default async function RodoSettingsPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/logowanie?next=/panel/ustawienia/rodo");

  const { data: consents } = await supabase
    .from("consent_ledger")
    .select("id, purpose, granted, version, source, recorded_at")
    .order("recorded_at", { ascending: false })
    .limit(20);

  const consentRows = consents ?? [];
  const dateFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Ustawienia · RODO
        </p>
        <h1 className="text-fluid-3xl font-semibold text-ink-900">
          Twoje dane osobowe
        </h1>
        <p className="text-ink-600">
          Pełna kontrola nad danymi przetwarzanymi przez Długomat — pobieranie,
          usuwanie, transparentność.
        </p>
      </header>

      {/* Eksport danych — art. 20 RODO */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <Shield className="mt-1 h-5 w-5 text-shield-600" aria-hidden />
            <div className="flex-1">
              <CardTitle>Pobierz swoje dane</CardTitle>
              <CardDescription>
                Otrzymasz plik JSON ze wszystkimi danymi, które przetwarzamy:
                profil, sprawy, dokumenty, terminy, płatności, audyt zdarzeń.
                Format strukturalny — gotowy do przekazania innemu administratorowi
                (art. 20 RODO).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc space-y-1 pl-5 text-fluid-sm text-ink-700">
            <li>
              PESEL osób trzecich (np. współpozwanych) jest zaszyfrowany w bazie
              i w eksporcie zastąpiony etykietą <code>[encrypted_at_rest]</code>.
            </li>
            <li>
              Surowy tekst OCR jest skracany do 200 znaków — pełne pliki masz w
              sekcji „Skaner” w panelu.
            </li>
            <li>Limit: 2 eksporty na 5 minut (ochrona przed atakiem DoS).</li>
          </ul>
          <Button asChild variant="default">
            <a href="/api/rodo/export" download>
              <Download className="mr-2 h-4 w-4" />
              Pobierz dane (JSON)
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Polityka prywatności */}
      <Card>
        <CardHeader>
          <CardTitle>Co przetwarzamy i dlaczego?</CardTitle>
          <CardDescription>
            Pełna polityka prywatności opisuje cele, podstawy prawne, retencję,
            odbiorców danych i Twoje uprawnienia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="ghost">
            <a href="/polityka-prywatnosci">Otwórz politykę prywatności →</a>
          </Button>
        </CardContent>
      </Card>

      {/* Historia zgód — art. 7 ust. 1 RODO (rozliczalność) */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-3">
            <History className="mt-1 h-5 w-5 text-shield-600" aria-hidden />
            <div className="flex-1">
              <CardTitle>Historia Twoich zgód</CardTitle>
              <CardDescription>
                Rejestr wyrażonych i wycofanych zgód na przetwarzanie danych
                (zasada rozliczalności — art. 7 ust. 1 RODO).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {consentRows.length === 0 ? (
            <p className="text-fluid-sm text-ink-500">
              Brak zarejestrowanych zgód. Zgody pojawią się tutaj po zaakceptowaniu
              odpowiednich celów przetwarzania.
            </p>
          ) : (
            <ul className="divide-y divide-ink-100">
              {consentRows.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-fluid-sm font-medium text-ink-900">
                      {c.purpose}
                    </p>
                    <p className="text-xs text-ink-500">
                      {dateFmt.format(new Date(c.recorded_at))}
                      {c.version ? ` · wersja ${c.version}` : ""}
                      {c.source ? ` · ${c.source}` : ""}
                    </p>
                  </div>
                  <Badge tone={c.granted ? "success" : "neutral"} withDot>
                    {c.granted ? "Udzielona" : "Wycofana"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Usunięcie konta — art. 17 RODO */}
      <Card className="border-temporal-amber-200">
        <CardHeader>
          <div className="flex items-start gap-3">
            <ShieldAlert
              className="mt-1 h-5 w-5 text-temporal-amber-600"
              aria-hidden
            />
            <div className="flex-1">
              <CardTitle>Usuń konto i dane</CardTitle>
              <CardDescription>
                Realizacja prawa do bycia zapomnianym (art. 17 RODO). Dokumenty,
                pliki OCR, terminy i powiadomienia zostaną trwale usunięte.
                Płatności pozostaną w bazie 5 lat (ustawa o rachunkowości art.
                71-74), ale dane osobowe (NIP, adres, nazwa firmy) zostaną
                usunięte natychmiast.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DeleteAccountForm />
        </CardContent>
      </Card>
    </div>
  );
}
