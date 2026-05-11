import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Gavel,
  History,
  Pencil,
  Send,
  Sparkles,
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
  title: "Moje pismo — Dlugomat",
  description: "Pismo procesowe z historia wersji, statusem i akcjami.",
};

type Letter = {
  id: string;
  title: string;
  type: "sprzeciw" | "skarga" | "wezwanie" | "wniosek" | "pozew";
  status: "draft" | "review" | "ready" | "sent" | "delivered";
  caseId?: string;
  caseSignature?: string;
  court?: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  pages: number;
  source: "ai" | "template" | "manual";
  reviewer?: string;
};

type Section = { heading: string; body: string };

const LETTERS: Record<string, Letter> = {
  "pism-001": {
    id: "pism-001",
    title: "Sprzeciw od nakazu zaplaty",
    type: "sprzeciw",
    status: "review",
    caseId: "spr-001",
    caseSignature: "I Nc 4521/26",
    court: "Sad Rejonowy dla Warszawy-Mokotowa",
    deadline: "2026-05-19",
    createdAt: "2026-05-05T11:18:00",
    updatedAt: "2026-05-09T14:24:00",
    pages: 3,
    source: "ai",
    reviewer: "Mecenas Anna Kowalska",
  },
};

const SECTIONS: Section[] = [
  {
    heading: "Petitum",
    body:
      "Niniejszym wnosze sprzeciw od nakazu zaplaty z dnia 21 kwietnia 2026 roku, wydanego w sprawie o sygn. akt I Nc 4521/26.",
  },
  {
    heading: "Zarzuty",
    body:
      "1. Zarzut przedawnienia roszczenia (art. 118 KC). 2. Brak legitymacji czynnej powoda. 3. Nieprawidlowe naliczenie odsetek przekraczajacych stopy maksymalne.",
  },
  {
    heading: "Uzasadnienie",
    body:
      "Roszczenie objete nakazem zaplaty stalo sie wymagalne 14 listopada 2019 r. Termin przedawnienia (3 lata dla dzialalnosci gospodarczej) uplynal 14 listopada 2022 r. Pozew zlozony w 2026 r. dotyczy zatem roszczenia przedawnionego.",
  },
  {
    heading: "Wnioski dowodowe",
    body:
      "Wnosze o przeprowadzenie dowodu z dokumentu — umowy pozyczki z 2019 r. (zalacznik 1) oraz wezwania do zaplaty (zalacznik 2) na okolicznosc daty wymagalnosci roszczenia.",
  },
];

const VERSIONS = [
  { v: 3, at: "2026-05-09T14:24:00", by: "Mecenas Kowalska", note: "Korekta merytoryczna" },
  { v: 2, at: "2026-05-07T09:18:00", by: "Anna Nowak", note: "Korekta jezyka" },
  { v: 1, at: "2026-05-05T11:18:00", by: "System AI", note: "Pierwsza wersja" },
];

const STATUS_TONE: Record<
  Letter["status"],
  "neutral" | "info" | "warning" | "success"
> = {
  draft: "neutral",
  review: "warning",
  ready: "info",
  sent: "info",
  delivered: "success",
};

const STATUS_LABEL: Record<Letter["status"], string> = {
  draft: "Szkic",
  review: "W korekcie",
  ready: "Gotowe",
  sent: "Wyslane",
  delivered: "Doreczone",
};

const TYPE_LABEL: Record<Letter["type"], string> = {
  sprzeciw: "Sprzeciw",
  skarga: "Skarga",
  wezwanie: "Wezwanie",
  wniosek: "Wniosek",
  pozew: "Pozew",
};

const SOURCE_LABEL: Record<Letter["source"], string> = {
  ai: "Wygenerowane AI",
  template: "Z szablonu",
  manual: "Reczne",
};

const fmtTime = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));

async function loadLetter(id: string): Promise<Letter | null> {
  return LETTERS[id] ?? LETTERS["pism-001"] ?? null;
}

export default async function LetterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const letter = await loadLetter(id);
  if (!letter) return notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/panel/moje-pisma"
          className="text-sm text-slate-600 hover:text-slate-900"
        >
          ← Moje pisma
        </Link>
        <div className="mt-3 flex items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge tone={STATUS_TONE[letter.status]} withDot>
                {STATUS_LABEL[letter.status]}
              </Badge>
              <Badge tone="neutral">{TYPE_LABEL[letter.type]}</Badge>
              <Badge tone="info">
                <Sparkles className="mr-1 inline h-3 w-3" />
                {SOURCE_LABEL[letter.source]}
              </Badge>
            </div>
            <h1 className="mt-2 font-display text-3xl text-slate-900">
              {letter.title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {letter.court} · sygn. {letter.caseSignature}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Pencil className="mr-1 h-4 w-4" />
              Edytuj
            </Button>
            <Button variant="secondary" size="sm">
              <Download className="mr-1 h-4 w-4" />
              PDF
            </Button>
            <Button variant="primary" size="sm">
              <Send className="mr-1 h-4 w-4" />
              Wyslij do sadu
            </Button>
          </div>
        </div>
      </div>

      {letter.deadline ? (
        <Card urgency="warning" className="mb-6">
          <CardContent className="flex items-start gap-3 py-5">
            <Clock className="mt-0.5 h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-slate-900">
                Termin doreczenia do sadu: {fmtDate(letter.deadline)}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Pismo musi wplynac do sadu w terminie. Rekomendujemy nadanie
                listem poleconym co najmniej 3 dni przed.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-slate-500" />
                Tresc pisma
              </CardTitle>
              <CardDescription>
                {letter.pages} strony · stan z {fmtTime(letter.updatedAt)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <article className="space-y-5">
                {SECTIONS.map((s) => (
                  <section key={s.heading}>
                    <h3 className="font-display text-lg text-slate-900">
                      {s.heading}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-700">
                      {s.body}
                    </p>
                  </section>
                ))}
              </article>
            </CardContent>
          </Card>

          {letter.reviewer ? (
            <Card elevation="subtle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Gavel className="h-4 w-4 text-emerald-600" />
                  Korekta prawnika
                </CardTitle>
                <CardDescription>{letter.reviewer}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-700">
                  Pismo zostalo poddane korekcie merytorycznej. Zarzut
                  przedawnienia jest najmocniejszy — rekomenduje umieszczenie go
                  na pierwszym miejscu w sekcji &quot;Zarzuty&quot;. Tekst gotowy do
                  podpisu.
                </p>
                <div className="mt-3 inline-flex items-center gap-2 text-xs text-emerald-700">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Zatwierdzone do wyslania
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <Card elevation="subtle">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <History className="h-4 w-4 text-slate-500" />
              Historia wersji
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {VERSIONS.map((v) => (
                <li
                  key={v.v}
                  className="rounded-md border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-slate-700">
                      v{v.v}
                    </span>
                    <span className="text-xs text-slate-500">
                      {fmtTime(v.at)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {v.note}
                  </p>
                  <p className="text-xs text-slate-500">{v.by}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
