import * as React from "react";
import Link from "next/link";
import {
  Download,
  FileArchive,
  Shield,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Mail,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Eksport danych RODO - Dlugomat",
  description: "Pobierz pelny eksport swoich danych zgodnie z art. 20 RODO (prawo do przenoszenia danych).",
};

type DataCategory = {
  id: string;
  label: string;
  description: string;
  size: string;
  records: number;
  default: boolean;
};

const CATEGORIES: DataCategory[] = [
  {
    id: "profil",
    label: "Dane profilowe",
    description: "Imie, nazwisko, dane kontaktowe, adres, PESEL",
    size: "12 KB",
    records: 1,
    default: true,
  },
  {
    id: "sprawy",
    label: "Sprawy i postepowania",
    description: "Wszystkie Twoje sprawy, statusy, wierzyciele",
    size: "340 KB",
    records: 3,
    default: true,
  },
  {
    id: "platnosci",
    label: "Historia platnosci",
    description: "Wszystkie wplaty, raty, faktury, potwierdzenia",
    size: "1.2 MB",
    records: 87,
    default: true,
  },
  {
    id: "dokumenty",
    label: "Dokumenty",
    description: "Wszystkie pisma, zalaczniki, podpisy elektroniczne",
    size: "42 MB",
    records: 124,
    default: true,
  },
  {
    id: "wiadomosci",
    label: "Wiadomosci i czat",
    description: "Korespondencja z doradcami, prawnikami, windykatorami",
    size: "890 KB",
    records: 234,
    default: false,
  },
  {
    id: "audyt",
    label: "Log audytowy",
    description: "Historia logowan, zmian, dostepow do danych",
    size: "560 KB",
    records: 1340,
    default: false,
  },
];

const PREVIOUS_EXPORTS = [
  { id: "exp-001", date: "2026-04-15T10:23:00", size: "44.8 MB", format: "ZIP/JSON", status: "ready" as const },
  { id: "exp-002", date: "2026-01-08T16:45:00", size: "38.2 MB", format: "ZIP/JSON", status: "expired" as const },
];

const FORMATS = [
  { id: "json", label: "JSON (zalecany)", description: "Strukturalny format do importu w innych systemach" },
  { id: "csv", label: "CSV", description: "Tabelaryczne dane do arkuszy kalkulacyjnych" },
  { id: "pdf", label: "PDF", description: "Czytelny raport do druku i archiwizacji" },
];

export default function EksportRodoPage() {
  const dateFmt = new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const totalSize = CATEGORIES.filter((c) => c.default).reduce((acc, c) => {
    const num = parseFloat(c.size);
    const isMb = c.size.includes("MB");
    return acc + (isMb ? num * 1024 : num);
  }, 0);

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
                          {cat.records} rekordow - {cat.size}
                        </span>
                      </div>
                      <div className="text-sm text-dlugomat-700 mt-0.5">{cat.description}</div>
                    </div>
                  </label>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-md bg-dlugomat-50 border border-ink-200 flex items-center justify-between">
                <span className="text-sm text-dlugomat-800">Przewidywany rozmiar pakietu</span>
                <span className="font-medium text-dlugomat-950">{(totalSize / 1024).toFixed(1)} MB</span>
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
            <ul className="space-y-2">
              {PREVIOUS_EXPORTS.map((exp) => (
                <li
                  key={exp.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-md border border-ink-200 bg-white"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-dlugomat-600 shrink-0" aria-hidden />
                    <div>
                      <div className="text-sm font-medium text-dlugomat-950">
                        Pakiet {exp.format} - {exp.size}
                      </div>
                      <div className="text-xs text-dlugomat-600">{dateFmt.format(new Date(exp.date))}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {exp.status === "ready" ? (
                      <>
                        <Badge tone="success" withDot>
                          <CheckCircle2 className="h-3 w-3 mr-1" aria-hidden />
                          Dostepny
                        </Badge>
                        <Button variant="secondary" size="sm">
                          <Mail className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                          Wyslij ponownie
                        </Button>
                      </>
                    ) : (
                      <Badge tone="neutral">Wygasl</Badge>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
