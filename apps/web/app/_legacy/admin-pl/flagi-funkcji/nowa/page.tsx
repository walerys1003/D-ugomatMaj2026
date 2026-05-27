import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Flag, Users, Percent, GitBranch, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Nowa flaga funkcji - Dlugomat Admin",
  description: "Utworz nowa flage funkcji z kontrolowanym rollout i wariantami A/B.",
};

const AUDIENCES = [
  { id: "all", label: "Wszyscy uzytkownicy", description: "Aktywuj dla calej bazy uzytkownikow" },
  { id: "beta", label: "Program beta", description: "Tylko uzytkownicy zapisani do programu beta (1240 osob)" },
  { id: "premium", label: "Plan premium", description: "Uzytkownicy z aktywna subskrypcja premium" },
  { id: "internal", label: "Zespol wewnetrzny", description: "Tylko pracownicy Dlugomat (42 osoby)" },
  { id: "segment", label: "Segment niestandardowy", description: "Zdefiniuj wlasna grupe na podstawie atrybutow" },
];

const ROLLOUT_PRESETS = [10, 25, 50, 75, 100];

export default function NowaFlagaFunkcjiPage() {
  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/admin/flagi-funkcji"
            className="inline-flex items-center gap-2 text-sm text-dlugomat-700 hover:text-dlugomat-900 focus-visible:shadow-shield-focus rounded-md"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Powrot do flag funkcji
          </Link>
        </div>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Flag className="h-6 w-6 text-accent-600" aria-hidden />
            <h1 className="font-display text-3xl text-dlugomat-950">Nowa flaga funkcji</h1>
          </div>
          <p className="text-dlugomat-700 max-w-2xl">
            Utworz kontrolowane wdrozenie funkcji z mozliwoscia stopniowego rollout, segmentacji i testow A/B.
          </p>
        </header>

        <form className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane podstawowe</CardTitle>
              <CardDescription>Identyfikator i opis flagi widoczny w kodzie i panelu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="ff-key" className="block text-sm font-medium text-dlugomat-900 mb-1">
                  Klucz flagi
                </label>
                <input
                  id="ff-key"
                  type="text"
                  placeholder="np. checkout_v2_enabled"
                  className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  aria-describedby="ff-key-hint"
                />
                <p id="ff-key-hint" className="mt-1 text-xs text-dlugomat-600">
                  Tylko male litery, cyfry i podkreslniki. Bedzie uzyty w kodzie jako getFlag(&quot;klucz&quot;).
                </p>
              </div>

              <div>
                <label htmlFor="ff-name" className="block text-sm font-medium text-dlugomat-900 mb-1">
                  Nazwa wyswietlana
                </label>
                <input
                  id="ff-name"
                  type="text"
                  placeholder="np. Nowy checkout v2"
                  className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                />
              </div>

              <div>
                <label htmlFor="ff-desc" className="block text-sm font-medium text-dlugomat-900 mb-1">
                  Opis biznesowy
                </label>
                <textarea
                  id="ff-desc"
                  rows={3}
                  placeholder="Co robi ta funkcja, dlaczego ja wdrazamy, kiedy planujemy pelne wlaczenie..."
                  className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none resize-none"
                />
              </div>

              <div>
                <label htmlFor="ff-owner" className="block text-sm font-medium text-dlugomat-900 mb-1">
                  Wlasciciel funkcji
                </label>
                <select
                  id="ff-owner"
                  className="w-full px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                >
                  <option>Zespol Produktu</option>
                  <option>Zespol Platnosci</option>
                  <option>Zespol AI</option>
                  <option>Zespol Compliance</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent-600" aria-hidden />
                Grupa docelowa
              </CardTitle>
              <CardDescription>Wybierz dla kogo flaga ma byc aktywna</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {AUDIENCES.map((aud, idx) => (
                  <label
                    key={aud.id}
                    htmlFor={`aud-${aud.id}`}
                    className="flex items-start gap-3 p-3 rounded-md border border-iron-300 cursor-pointer hover:bg-dlugomat-50 has-[:checked]:border-accent-500 has-[:checked]:bg-accent-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="audience"
                      id={`aud-${aud.id}`}
                      defaultChecked={idx === 1}
                      className="mt-1 h-4 w-4 text-accent-600 border-iron-400 focus-visible:shadow-shield-focus"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-dlugomat-950">{aud.label}</div>
                      <div className="text-sm text-dlugomat-700">{aud.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-accent-600" aria-hidden />
                Stopien rollout
              </CardTitle>
              <CardDescription>Procent uzytkownikow w grupie docelowej z aktywna flaga</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {ROLLOUT_PRESETS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="px-4 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-900 text-sm font-medium hover:bg-dlugomat-50 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  >
                    {p}%
                  </button>
                ))}
              </div>
              <div>
                <label htmlFor="ff-rollout" className="block text-sm font-medium text-dlugomat-900 mb-1">
                  Wartosc niestandardowa
                </label>
                <input
                  id="ff-rollout"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={25}
                  className="w-32 px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                />
                <span className="ml-2 text-sm text-dlugomat-700">% grupy docelowej</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-accent-600" aria-hidden />
                Warianty A/B
              </CardTitle>
              <CardDescription>Opcjonalnie podziel ruch na warianty do porownania</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    defaultValue="control"
                    className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    aria-label="Nazwa wariantu A"
                  />
                  <input
                    type="number"
                    defaultValue={50}
                    min={0}
                    max={100}
                    className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    aria-label="Procent wariantu A"
                  />
                  <Badge tone="neutral">Kontrolny</Badge>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <input
                    type="text"
                    defaultValue="variant_a"
                    className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    aria-label="Nazwa wariantu B"
                  />
                  <input
                    type="number"
                    defaultValue={50}
                    min={0}
                    max={100}
                    className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                    aria-label="Procent wariantu B"
                  />
                  <Badge tone="info">Testowy</Badge>
                </div>
              </div>
              <button
                type="button"
                className="mt-3 text-sm text-accent-700 hover:text-accent-900 font-medium focus-visible:shadow-shield-focus rounded-md"
              >
                + Dodaj kolejny wariant
              </button>
            </CardContent>
          </Card>

          <Card urgency="warning">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-warn shrink-0 mt-0.5" aria-hidden />
                <div>
                  <p className="font-medium text-dlugomat-950 mb-1">Zalecenie bezpieczenstwa</p>
                  <p className="text-sm text-dlugomat-800">
                    Nowe flagi powinny zaczynac od 5-10% rollout w grupie beta. Zmiana na 100% bez fazy testowej moze
                    wplynac na stabilnosc produktu i SLA.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-accent-600 shrink-0 mt-0.5" aria-hidden />
                <div className="flex-1">
                  <p className="text-sm text-dlugomat-800">
                    Po utworzeniu flagi mozna ja modyfikowac w panelu, zmieniajac procent rollout i grupy docelowe bez
                    nowego wdrozenia. Wszystkie zmiany sa rejestrowane w audycie.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-4 bg-white border-t border-iron-200 flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <Badge tone="neutral" withDot>
              Wszystkie zmiany audytowane
            </Badge>
            <div className="flex gap-3">
              <Button variant="ghost" asChild>
                <Link href="/admin/flagi-funkcji">Anuluj</Link>
              </Button>
              <Button variant="secondary">Zapisz jako szkic</Button>
              <Button variant="primary">Utworz flage</Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
