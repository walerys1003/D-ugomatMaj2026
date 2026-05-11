import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MapPin, Building2, Clock, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Kontakt dla firm — Dlugomat",
  description:
    "Skontaktuj sie z zespolem sprzedazy B2B Dlugomat. Demo, wycena Enterprise, integracje. Odpowiadamy w 24 h roboczo.",
  alternates: { canonical: "/kontakt/firmy" },
};

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "Sprzedaz B2B",
    value: "sprzedaz@dlugomat.pl",
    desc: "Demo, wyceny, kontrakty enterprise. Odpowiedz w 24 h roboczo.",
    cta: "mailto:sprzedaz@dlugomat.pl",
  },
  {
    icon: Phone,
    label: "Infolinia B2B",
    value: "+48 22 123 45 67",
    desc: "Pn-Pt 9:00-17:00. Tylko klienci biznesowi.",
    cta: "tel:+48221234567",
  },
  {
    icon: Send,
    label: "Wsparcie techniczne",
    value: "support@dlugomat.pl",
    desc: "Integracje, API, problemy techniczne. SLA wedlug planu.",
    cta: "mailto:support@dlugomat.pl",
  },
];

const TOPICS = [
  { id: "demo", label: "Umow demo (60 min)", desc: "Pokazemy platforme na Twojej przykladowej sprawie." },
  { id: "enterprise", label: "Wycena Enterprise", desc: "Wlasciwy plan, SLA 99,95%, dedykowany CSM." },
  { id: "integracja", label: "Niestandardowa integracja", desc: "Salesforce custom, ERP, własny CRM." },
  { id: "rfp", label: "RFP / zapytanie ofertowe", desc: "Odpowiemy zgodnie z Twoim szablonem RFP." },
  { id: "compliance", label: "Compliance i audyt", desc: "Pytania o ISO 27001, RODO, DPA, audyty zewnetrzne." },
  { id: "partnerstwo", label: "Partnerstwo / odsprzedaz", desc: "Reseller, biuro rachunkowe, NGO." },
];

const OFFICE = {
  street: "Plac Europejski 1",
  city: "00-844 Warszawa",
  hours: "Pon-Pt 9:00-17:00",
  nip: "PL5252876543",
  krs: "0000934127",
};

const SLA_INFO = [
  { plan: "Pro", first_response: "24 h", coverage: "Pon-Pt 9-17" },
  { plan: "Kancelaria", first_response: "4 h", coverage: "Pon-Pt 9-17" },
  { plan: "Enterprise", first_response: "1 h", coverage: "Pon-Sob 8-20" },
];

export default function KontaktFirmyPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <Building2 className="mr-1 h-3 w-3" />
            Kontakt dla firm
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-dlugomat-950 sm:text-5xl">
            Porozmawiajmy o Twojej firmie.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-iron-600">
            Dedykowany kanal dla kancelarii, biur rachunkowych i organizacji enterprise.
            Bez chatbota, bez kolejki — od razu czlowiek z dzialu B2B.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 lg:grid-cols-3">
          {CONTACT_CHANNELS.map((c) => {
            const Icon = c.icon;
            return (
              <Card key={c.label} elevation="subtle">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-dlugomat-50">
                    <Icon className="h-6 w-6 text-dlugomat-700" aria-hidden />
                  </div>
                  <CardTitle className="mt-3 text-base">{c.label}</CardTitle>
                  <CardDescription>{c.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    href={c.cta}
                    className="font-mono text-sm text-dlugomat-900 underline underline-offset-4 hover:text-dlugomat-700"
                  >
                    {c.value}
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="grid gap-8 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Formularz kontaktowy B2B</CardTitle>
                <CardDescription>Odpowiadamy w ciagu 1 dnia roboczego.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-iron-700">Imie i nazwisko</span>
                      <input
                        type="text"
                        required
                        className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-iron-700">Firma</span>
                      <input
                        type="text"
                        required
                        className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-iron-700">Email sluzbowy</span>
                    <input
                      type="email"
                      required
                      className="h-10 rounded-md border border-iron-200 px-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-iron-700">Temat</span>
                    <select
                      required
                      className="h-10 rounded-md border border-iron-200 bg-white px-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                    >
                      <option value="">Wybierz temat...</option>
                      {TOPICS.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-iron-700">Wiadomosc</span>
                    <textarea
                      rows={5}
                      required
                      placeholder="Np. ile spraw miesiecznie, jakie potrzeby, jakie integracje..."
                      className="rounded-md border border-iron-200 p-3 focus-visible:outline-none focus-visible:shadow-shield-focus"
                    />
                  </label>
                  <label className="flex items-start gap-2 text-xs text-iron-600">
                    <input type="checkbox" required className="mt-0.5" />
                    <span>
                      Wyrazam zgode na przetwarzanie danych zgodnie z{" "}
                      <Link href="/rodo" className="underline">
                        polityka prywatnosci
                      </Link>
                      .
                    </span>
                  </label>
                  <Button type="submit" variant="primary" block>
                    Wyslij wiadomosc
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card elevation="subtle">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-dlugomat-700" aria-hidden />
                    Biuro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-iron-700">
                  <p className="font-medium text-dlugomat-900">Dlugomat sp. z o.o.</p>
                  <p>{OFFICE.street}</p>
                  <p>{OFFICE.city}</p>
                  <p className="flex items-center gap-2 pt-2 text-xs text-iron-500">
                    <Clock className="h-3 w-3" aria-hidden />
                    {OFFICE.hours}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2 border-t border-iron-100 pt-3 text-xs text-iron-500">
                    <div>
                      <p className="uppercase tracking-wide">NIP</p>
                      <p className="font-mono text-dlugomat-900">{OFFICE.nip}</p>
                    </div>
                    <div>
                      <p className="uppercase tracking-wide">KRS</p>
                      <p className="font-mono text-dlugomat-900">{OFFICE.krs}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card elevation="subtle">
                <CardHeader>
                  <CardTitle className="text-base">Czas odpowiedzi (SLA)</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-iron-100">
                      {SLA_INFO.map((s) => (
                        <tr key={s.plan}>
                          <td className="px-5 py-2 text-dlugomat-900">{s.plan}</td>
                          <td className="px-5 py-2 text-right font-mono text-accent-700">
                            {s.first_response}
                          </td>
                          <td className="px-5 py-2 text-right text-xs text-iron-500">
                            {s.coverage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-lg border border-iron-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-dlugomat-950">Klient indywidualny?</h2>
          <p className="mt-2 text-iron-600">
            Mamy dla Ciebie wlasny kanal — z krotszym czasem rejestracji.
          </p>
          <Button asChild variant="secondary" className="mt-6">
            <Link href="/kontakt">Kontakt dla osob indywidualnych</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
