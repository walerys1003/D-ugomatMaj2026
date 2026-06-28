import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Video, CheckCircle2, Clock, Users } from "lucide-react";
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
  title: "Umow demo — Dlugomat",
  description:
    "Zarezerwuj 30-minutowe demo Dlugomat. Pokazujemy konkrety na Twoich danych. Bez prezentacji marketingowej, bez 'mozliwosci dyskusji'.",
  alternates: { canonical: "/kontakt/demo" },
};

const AGENDA = [
  { time: "0–5 min", title: "Krotkie poznanie", desc: "Twoja branza, skala spraw, glowne bole." },
  { time: "5–15 min", title: "Live demo na Twoich danych", desc: "Wgrywamy 1–2 Twoje pisma. Pokazujemy skaner, generator, workflow." },
  { time: "15–25 min", title: "Twoje pytania", desc: "Cennik, integracje, bezpieczenstwo, RODO, SLA. Bez wodolejstwa." },
  { time: "25–30 min", title: "Decyzja o nastepnym kroku", desc: "Trial, proof-of-concept, decyzja: 'tak / nie / pomysle'. Bez nacisku." },
];

const PREP_LIST = [
  "1–2 typowe pisma z Twojej praktyki (PDF lub zdjecie)",
  "Liczba spraw miesiecznie (rzedy wielkosci)",
  "Aktualne narzedzia (Excel, dedykowany system, papier)",
  "Tworca decyzji w wideokonferencji (jesli decyzja > 30 dni)",
];

const SLOTS = [
  { day: "Pn", date: "12 maja", times: ["09:00", "11:00", "14:00", "16:00"] },
  { day: "Wt", date: "13 maja", times: ["10:00", "13:00", "15:30"] },
  { day: "Sr", date: "14 maja", times: ["09:00", "11:00", "16:00"] },
  { day: "Cz", date: "15 maja", times: ["09:00", "13:30", "15:00"] },
  { day: "Pt", date: "16 maja", times: ["10:00", "14:00"] },
];

export default function KontaktDemoPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Link href="/kontakt" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="h-4 w-4" />
            Powrot do kontaktu
          </Link>
          <Badge tone="neutral" withDot className="mt-4 mb-2">
            <Video className="mr-1 h-3 w-3" />
            Demo dla firm
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-slate-900 sm:text-5xl">
            30 minut, ktore zmieniaja podejscie do windykacji.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Pokazujemy konkrety na Twoich pismach, nie slajdy. Po demo wiesz, czy Dlugomat
            ma sens dla Twojego biznesu. Bez handlowca w mailu.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-slate-700" />
                  Co zobaczysz w 30 minutach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {AGENDA.map((step, idx) => (
                    <li key={step.time} className="flex items-start gap-4">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-slate-900 font-mono text-xs text-white">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-display text-base text-slate-900">{step.title}</p>
                          <Badge tone="neutral">{step.time}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{step.desc}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  Co przygotowac przed demo
                </CardTitle>
                <CardDescription>To 5 minut Twojej pracy. Pozwala nam pokazac konkrety.</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {PREP_LIST.map((p) => (
                    <li key={p} className="flex items-start gap-3 text-sm">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-emerald-600" />
                      <span className="text-slate-700">{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card elevation="flat">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-slate-700" />
                  Kto prowadzi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  Demo prowadzi <strong>Katarzyna Lewandowska</strong> (Head of Customer Success) lub
                  <strong> Adw. Piotr Michalski</strong> (Head of Legal) — w zaleznosci od profilu Twojej firmy.
                  Zaden sprzedawca z prowizja. Zadnego pressure-sales.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card elevation="pop">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-slate-700" />
                Wybierz termin
              </CardTitle>
              <CardDescription>Wszystkie godziny w czasie polskim (CEST).</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {SLOTS.map((s) => (
                  <div key={s.date}>
                    <p className="font-display text-sm text-slate-900">
                      {s.day} · {s.date}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {s.times.map((t) => (
                        <button
                          key={t}
                          type="button"
                          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 font-mono text-xs text-slate-900 transition-colors hover:border-slate-900 hover:bg-slate-900 hover:text-white focus-visible:outline-none focus-visible:shadow-shield-focus"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-700">Imie i nazwisko</span>
                  <input
                    type="text"
                    required
                    className="h-10 rounded-md border border-slate-300 px-3"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-700">Sluzbowy e-mail</span>
                  <input
                    type="email"
                    required
                    className="h-10 rounded-md border border-slate-300 px-3"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-slate-700">Firma</span>
                  <input
                    type="text"
                    required
                    className="h-10 rounded-md border border-slate-300 px-3"
                  />
                </label>
                <Button variant="primary" block>
                  Rezerwuj termin
                </Button>
                <p className="text-center text-xs text-slate-500">
                  Bez karty, bez umowy, bez 'dlugiej rozmowy z handlowcem'.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
