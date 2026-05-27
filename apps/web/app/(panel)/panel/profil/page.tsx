import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Camera,
  CheckCircle2,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";

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
  title: "Mój profil — Długomat",
  description: "Zarządzanie danymi profilu, kontaktu i komunikacji.",
};

interface Profile {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  voivodeship: string;
  company_name: string | null;
  nip: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  mfa_enabled: boolean;
  preferred_lang: "pl" | "en";
  preferred_contact: "email" | "phone" | "in_app";
  created_at: string;
}

const PROFILE: Profile = {
  full_name: "Anna Kowalska",
  email: "anna.kowalska@example.pl",
  phone: "+48 600 123 456",
  city: "Warszawa",
  voivodeship: "mazowieckie",
  company_name: null,
  nip: null,
  email_verified: true,
  phone_verified: true,
  mfa_enabled: true,
  preferred_lang: "pl",
  preferred_contact: "email",
  created_at: "2024-11-12",
};

const inputCls =
  "w-full rounded-md border border-iron-300 bg-white px-3 py-2 text-sm text-dlugomat-900 focus:border-dlugomat-700 focus-visible:outline-none focus-visible:shadow-shield-focus";

export default function ProfilPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-iron-500">
          Konto · profil
        </p>
        <h1 className="font-display text-fluid-h1 text-dlugomat-950">
          Twój profil
        </h1>
        <p className="max-w-2xl text-iron-600">
          Dane profilowe wykorzystywane są do uzupełniania pism oraz weryfikacji
          tożsamości. Wszystkie zmiany są audytowane.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Awatar i status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-dlugomat-100 text-dlugomat-700">
                <User className="h-12 w-12" aria-hidden />
                <button
                  type="button"
                  aria-label="Zmień awatar"
                  className="absolute -bottom-1 -right-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-iron-200 bg-white shadow-card focus-visible:outline-none focus-visible:shadow-shield-focus"
                >
                  <Camera className="h-4 w-4 text-dlugomat-700" aria-hidden />
                </button>
              </div>
              <p className="font-display text-lg text-dlugomat-950">{PROFILE.full_name}</p>
              <p className="text-sm text-iron-600">{PROFILE.email}</p>
            </div>

            <div className="space-y-2 border-t border-iron-100 pt-4">
              <StatusRow
                label="E-mail zweryfikowany"
                ok={PROFILE.email_verified}
              />
              <StatusRow
                label="Telefon zweryfikowany"
                ok={PROFILE.phone_verified}
              />
              <StatusRow label="MFA aktywne" ok={PROFILE.mfa_enabled} />
            </div>

            <p className="border-t border-iron-100 pt-3 text-xs text-iron-500">
              Konto utworzone: {PROFILE.created_at}
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dane osobowe</CardTitle>
            <CardDescription>
              Imię, nazwisko i kontakt — wykorzystywane w pismach prawnych
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 sm:grid-cols-2">
              <Field label="Imię i nazwisko" icon={User}>
                <input type="text" className={inputCls} defaultValue={PROFILE.full_name} />
              </Field>
              <Field label="Adres e-mail" icon={Mail}>
                <input type="email" className={inputCls} defaultValue={PROFILE.email} />
              </Field>
              <Field label="Numer telefonu" icon={Phone}>
                <input type="tel" className={inputCls} defaultValue={PROFILE.phone} />
              </Field>
              <Field label="Miasto" icon={MapPin}>
                <input type="text" className={inputCls} defaultValue={PROFILE.city} />
              </Field>
              <Field label="Województwo">
                <select className={inputCls} defaultValue={PROFILE.voivodeship}>
                  <option value="mazowieckie">mazowieckie</option>
                  <option value="malopolskie">małopolskie</option>
                  <option value="slaskie">śląskie</option>
                  <option value="wielkopolskie">wielkopolskie</option>
                  <option value="pomorskie">pomorskie</option>
                  <option value="dolnoslaskie">dolnośląskie</option>
                  <option value="lodzkie">łódzkie</option>
                </select>
              </Field>
              <Field label="Język interfejsu">
                <select className={inputCls} defaultValue={PROFILE.preferred_lang}>
                  <option value="pl">Polski</option>
                  <option value="en">English</option>
                </select>
              </Field>
              <div className="sm:col-span-2 flex justify-end gap-2 pt-2">
                <Button variant="ghost" type="reset">Anuluj</Button>
                <Button type="submit" variant="success">
                  <Save className="mr-2 h-4 w-4" aria-hidden />
                  Zapisz zmiany
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dane firmowe (opcjonalnie)</CardTitle>
          <CardDescription>
            Wypełnij, jeśli korzystasz z konta jako firma — faktury będą wystawiane
            na podane dane.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 sm:grid-cols-2">
            <Field label="Nazwa firmy" icon={Building2}>
              <input
                type="text"
                className={inputCls}
                defaultValue={PROFILE.company_name ?? ""}
                placeholder="np. Kowalska Consulting Sp. z o.o."
              />
            </Field>
            <Field label="NIP" hint="10 cyfr">
              <input
                type="text"
                className={inputCls}
                defaultValue={PROFILE.nip ?? ""}
                placeholder="1234567890"
                maxLength={10}
              />
            </Field>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencje komunikacji</CardTitle>
          <CardDescription>Jak chcesz odbierać powiadomienia od Długomat</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-2">
            <legend className="sr-only">Preferowany kanał kontaktu</legend>
            {[
              { value: "email", label: "E-mail", desc: "Powiadomienia o zmianach spraw, fakturach, deadlinach" },
              { value: "phone", label: "Telefon", desc: "Połączenie wyłącznie dla spraw pilnych (P1)" },
              { value: "in_app", label: "Tylko w aplikacji", desc: "Bez e-maili i SMS — wszystkie powiadomienia w panelu" },
            ].map((opt) => (
              <label
                key={opt.value}
                className="flex items-start gap-3 rounded-md border border-iron-200 p-3 cursor-pointer hover:bg-iron-50"
              >
                <input
                  type="radio"
                  name="preferred_contact"
                  value={opt.value}
                  defaultChecked={opt.value === PROFILE.preferred_contact}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-dlugomat-900">{opt.label}</p>
                  <p className="text-xs text-iron-500">{opt.desc}</p>
                </div>
              </label>
            ))}
          </fieldset>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bezpieczeństwo</CardTitle>
          <CardDescription>Hasło, MFA oraz aktywne sesje</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button variant="secondary" block asChild>
            <Link href="/panel/profil/haslo">Zmień hasło</Link>
          </Button>
          <Button variant="secondary" block asChild>
            <Link href="/panel/profil/mfa">
              <Shield className="mr-2 h-4 w-4" aria-hidden />
              Zarządzaj MFA
            </Link>
          </Button>
          <Button variant="ghost" block asChild>
            <Link href="/panel/aktywnosc">Historia logowań</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  hint,
  icon: Icon,
  children,
}: {
  label: string;
  hint?: string;
  // LucideIcon = ForwardRefExoticComponent<LucideProps & RefAttributes<SVGSVGElement>>
  // Bezpieczne rozluźnienie — wszystkie ikony lucide przyjmują className i aria-hidden.
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-iron-500">
        {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden /> : null}
        {label}
      </span>
      <div className="mt-1">{children}</div>
      {hint ? <span className="mt-1 block text-xs text-iron-500">{hint}</span> : null}
    </label>
  );
}

function StatusRow({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-iron-700">{label}</span>
      {ok ? (
        <Badge tone="success" withDot>
          <CheckCircle2 className="mr-1 h-3 w-3" aria-hidden />
          tak
        </Badge>
      ) : (
        <Badge tone="warning" withDot>
          nie
        </Badge>
      )}
    </div>
  );
}
