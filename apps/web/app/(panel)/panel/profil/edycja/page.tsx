import type { Metadata } from "next";
import Link from "next/link";
import { Info, Save, ShieldCheck, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Edycja profilu — Dlugomat",
  description: "Aktualizacja danych osobowych i kontaktowych konta.",
};

export default function EditProfilePage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/profil"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Profil
        </Link>
        <h1 className="mt-3 font-display text-3xl text-slate-900">
          Edycja profilu
        </h1>
        <p className="mt-2 text-slate-600">
          Aktualizuj swoje dane. Zmiany istotnych pol wymagaja potwierdzenia
          mailem.
        </p>
      </div>

      <form className="space-y-6">
        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4 text-slate-500" />
              Dane osobowe
            </CardTitle>
            <CardDescription>
              Imie, nazwisko i PESEL sluza do generowania pism procesowych
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Imie
                </label>
                <input
                  id="firstName"
                  type="text"
                  defaultValue="Anna"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Nazwisko
                </label>
                <input
                  id="lastName"
                  type="text"
                  defaultValue="Nowak"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
              <div>
                <label
                  htmlFor="pesel"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  PESEL
                </label>
                <input
                  id="pesel"
                  type="text"
                  defaultValue="••••••12345"
                  readOnly
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Zmiana PESEL wymaga kontaktu z biurem obslugi
                </p>
              </div>
              <div>
                <label
                  htmlFor="birthDate"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Data urodzenia
                </label>
                <input
                  id="birthDate"
                  type="date"
                  defaultValue="1985-04-12"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Adres korespondencyjny</CardTitle>
            <CardDescription>
              Adres uzywany do doreczania pism z sadu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label
                  htmlFor="street"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Ulica i numer
                </label>
                <input
                  id="street"
                  type="text"
                  defaultValue="ul. Marszalkowska 142/15"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
              <div>
                <label
                  htmlFor="postalCode"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Kod pocztowy
                </label>
                <input
                  id="postalCode"
                  type="text"
                  defaultValue="00-061"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Miasto
                </label>
                <input
                  id="city"
                  type="text"
                  defaultValue="Warszawa"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="text-base">Dane kontaktowe</CardTitle>
            <CardDescription>
              Adres email sluzy do logowania i powiadomien
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    defaultValue="anna.nowak@example.pl"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                  />
                  <Badge tone="success" withDot className="absolute right-2 top-2">
                    Potwierdzony
                  </Badge>
                </div>
              </div>
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-900"
                >
                  Telefon
                </label>
                <input
                  id="phone"
                  type="tel"
                  defaultValue="+48 600 100 200"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:shadow-shield-focus"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Zmiana numeru wymaga weryfikacji kodem SMS
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card urgency="normal">
          <CardContent className="flex items-start gap-3 py-5">
            <Info className="mt-0.5 h-4 w-4 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                Po zapisie niektore dane wymagaja potwierdzenia
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Zmiana email lub telefonu uruchomi proces weryfikacji. Do tego
                czasu obowiazuja dane dotychczasowe.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5" />
            Dane szyfrowane AES-256, zgodne z RODO
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" type="button">
              Anuluj
            </Button>
            <Button variant="primary" size="sm" type="submit">
              <Save className="mr-1 h-4 w-4" />
              Zapisz zmiany
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
