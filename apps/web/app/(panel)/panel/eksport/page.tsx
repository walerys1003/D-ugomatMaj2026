import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Download,
  FileArchive,
  Shield,
  Clock,
  AlertTriangle,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata = {
  title: "Eksport danych RODO - Dlugomat",
  description: "Pobierz pelny eksport swoich danych zgodnie z art. 20 RODO (prawo do przenoszenia danych).",
};

export const dynamic = "force-dynamic";

type DataCategory = {
  id: string;
  label: string;
  description: string;
  records: number;
  default: boolean;
};

const FORMATS = [
  { id: "json", label: "JSON (zalecany)", description: "Strukturalny format do importu w innych systemach" },
  { id: "csv", label: "CSV", description: "Tabelaryczne dane do arkuszy kalkulacyjnych" },
  { id: "pdf", label: "PDF", description: "Czytelny raport do druku i archiwizacji" },
];

async function countRows(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  table: string,
): Promise<number> {
  const { count } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from(table as any)
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export default async function EksportRodoPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/sign-in?next=/panel/eksport");

  const [casesCount, paymentsCount, documentsCount, messagesCount, auditCount] =
    await Promise.all([
      countRows(supabase, "cases"),
      countRows(supabase, "payments"),
      countRows(supabase, "documents"),
      countRows(supabase, "messages"),
      countRows(supabase, "security_events"),
    ]);

  const CATEGORIES: DataCategory[] = [
    {
      id: "profil",
      label: "Dane profilowe",
      description: "Imie, nazwisko, dane kontaktowe, adres",
      records: 1,
      default: true,
    },
    {
      id: "sprawy",
      label: "Sprawy i postepowania",
      description: "Wszystkie Twoje sprawy, statusy, wierzyciele",
      records: casesCount,
      default: true,
    },
    {
      id: "platnosci",
      label: "Historia platnosci",
      description: "Wszystkie wplaty, raty, faktury, potwierdzenia",
      records: paymentsCount,
      default: true,
    },
    {
      id: "dokumenty",
      label: "Dokumenty",
      description: "Wszystkie pisma, zalaczniki, podpisy elektroniczne",
      records: documentsCount,
      default: true,
    },
    {
      id: "wiadomosci",
      label: "Wiadomosci i czat",
      description: "Korespondencja z doradcami, prawnikami, windykatorami",
      records: messagesCount,
      default: false,
    },
    {
      id: "audyt",
      label: "Log audytowy",
      description: "Historia logowan, zmian, dostepow do danych",
      records: auditCount,
      default: false,
    },
  ];

  const totalRecords = CATEGORIES.filter((c) => c.default).reduce(
    (acc, c) => acc + c.records,
    0,
  );

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileArchive className="h-6 w-6 text-accent-600" aria-hidden />
            <h1 className="font-display text-3xl text-dlugomat-950">Eksport danych</h1>
          </div>
          <p className="text-dlugomat-700 max-w-2xl">
            Pobierz kompletny pakiet swoich danych osobowych zgodnie z art. 20 RODO. Mozesz uzyc go w innym systemie
            lub zachowac jako archiwum.
          </p>
        </header>

        <Card urgency="normal" className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-medium text-dlugomat-950 mb-1">Prawo do przenoszenia danych</p>
                <p className="text-sm text-dlugomat-800">
                  Zgodnie z art. 20 RODO masz prawo otrzymac swoje dane osobowe w strukturalnym, powszechnie uzywanym
                  formacie. Generowanie pakietu jest darmowe i moze byc wykonane raz na 90 dni.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-accent-600" aria-hidden />
                Kategorie danych do eksportu
              </CardTitle>
              <CardDescription>Wybierz, co ma znalezc sie w pakiecie</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {CATEGORIES.map((cat) => (
                  <label
                    key={cat.id}
                    htmlFor={`cat-${cat.id}`}
                    className="flex items-start gap-3 p-3 rounded-md border border-ink-300 cursor-pointer hover:bg-dlugomat-50 has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      id={`cat-${cat.id}`}
                      defaultChecked={cat.default}
                      className="mt-1 h-4 w-4 text-accent-600 border-ink-400 rounded focus-visible:shadow-shield-focus"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-dlugomat-950">{cat.label}</span>
                        <span className="text-xs text-dlugomat-600 shrink-0">
                          {cat.records} rekordow
                        </span>
                      </div>
                      <div className="text-sm text-dlugomat-700 mt-0.5">{cat.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-md bg-dlugomat-50 border border-ink-200 flex items-center justify-between">
                <span className="text-sm text-dlugomat-800">Laczna liczba rekordow</span>
                <span className="font-medium text-dlugomat-950">{totalRecords}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Format eksportu</CardTitle>
              <CardDescription>Wybierz format najlepiej dopasowany do Twoich potrzeb</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {FORMATS.map((fmt, idx) => (
                  <label
                    key={fmt.id}
                    htmlFor={`fmt-${fmt.id}`}
                    className="flex items-start gap-3 p-3 rounded-md border border-ink-300 cursor-pointer hover:bg-dlugomat-50 has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="format"
                      id={`fmt-${fmt.id}`}
                      defaultChecked={idx === 0}
                      className="mt-1 h-4 w-4 text-accent-600 border-ink-400 focus-visible:shadow-shield-focus"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-dlugomat-950">{fmt.label}</div>
                      <div className="text-sm text-dlugomat-700">{fmt.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card urgency="warning">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-medium text-dlugomat-950 mb-1">Bezpieczenstwo pakietu</p>
                  <p className="text-sm text-dlugomat-800">
                    Pakiet bedzie zaszyfrowany haslem. Wyslemy go na zweryfikowany email. Link do pobrania wygasa po
                    72 godzinach.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
            <Button variant="ghost" asChild>
              <Link href="/panel/ustawienia/rodo">Anuluj</Link>
            </Button>
            <Button variant="primary">
              <Download className="h-4 w-4 mr-2" aria-hidden />
              Generuj pakiet eksportu
            </Button>
          </div>
        </form>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent-600" aria-hidden />
              Poprzednie eksporty
            </CardTitle>
            <CardDescription>Historia wygenerowanych pakietow z ostatnich 12 miesiecy</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="py-6 text-center text-sm text-dlugomat-600">
              Nie masz jeszcze zadnych wygenerowanych pakietow. Po wygenerowaniu
              pojawia sie tutaj wraz z linkiem do pobrania.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
