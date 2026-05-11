import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Video, Headphones, GraduationCap, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Edukacja — Dlugomat Academy",
  description:
    "Bezplatne materialy edukacyjne: kursy online, webinary, podcasty, ebooki. Wiedza prawnicza dla osob fizycznych i firm.",
  alternates: { canonical: "/edukacja" },
};

interface Course {
  slug: string;
  title: string;
  level: "podstawowy" | "sredni" | "zaawansowany";
  format: "kurs" | "webinar" | "podcast" | "ebook";
  duration: string;
  free: boolean;
  topic: string;
}

const FORMAT_ICON = {
  kurs: GraduationCap,
  webinar: Video,
  podcast: Headphones,
  ebook: FileText,
};

const FORMAT_LABEL = {
  kurs: "Kurs online",
  webinar: "Webinar",
  podcast: "Podcast",
  ebook: "Ebook",
};

const LEVEL_TONE: Record<Course["level"], "info" | "warning" | "danger"> = {
  podstawowy: "info",
  sredni: "warning",
  zaawansowany: "danger",
};

const COURSES: ReadonlyArray<Course> = [
  { slug: "abc-dluznika", title: "ABC dluznika — start w 60 minut", level: "podstawowy", format: "kurs", duration: "60 min", free: true, topic: "Podstawy" },
  { slug: "sprzeciw-od-epu", title: "Jak napisac sprzeciw od EPU", level: "sredni", format: "kurs", duration: "90 min", free: true, topic: "EPU" },
  { slug: "przedawnienie-praktyka", title: "Przedawnienie roszczen w praktyce", level: "zaawansowany", format: "kurs", duration: "2 godz", free: false, topic: "Przedawnienie" },
  { slug: "webinar-zmiany-2026", title: "Zmiany w prawie cywilnym 2026", level: "sredni", format: "webinar", duration: "75 min", free: true, topic: "Aktualnosci" },
  { slug: "webinar-komornik-2025", title: "Egzekucja z wynagrodzenia w 2025", level: "sredni", format: "webinar", duration: "60 min", free: true, topic: "Komornik" },
  { slug: "podcast-bik", title: "Podcast: jak wyczyscic BIK", level: "podstawowy", format: "podcast", duration: "32 min", free: true, topic: "BIK" },
  { slug: "podcast-ai-prawo", title: "Podcast: AI w prawie i co dalej", level: "sredni", format: "podcast", duration: "47 min", free: true, topic: "Legaltech" },
  { slug: "ebook-konsument", title: "Ebook: konsument vs windykator", level: "podstawowy", format: "ebook", duration: "48 stron", free: true, topic: "Konsument" },
  { slug: "ebook-kancelaria", title: "Ebook: jak zdigitalizowac kancelarie", level: "sredni", format: "ebook", duration: "84 stron", free: false, topic: "B2B" },
];

const STATS = [
  { label: "Materialow lacznie", value: COURSES.length.toString() },
  { label: "Darmowych", value: COURSES.filter((c) => c.free).toString() },
  { label: "Uczestnikow w 2025", value: "18 240" },
  { label: "Sredni czas ukonczenia", value: "78%" },
];

export default function EdukacjaPage() {
  return (
    <div className="bg-background">
      <section className="border-b border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <GraduationCap className="mr-1 h-3 w-3" />
            Dlugomat Academy
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-dlugomat-950 sm:text-5xl">
            Wiedza prawnicza w przystepnej formie.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-iron-600">
            Kursy online, webinary, podcasty i ebooki. Wiekszosc bezplatna, wszystko po polsku,
            prowadzone przez praktykow prawa.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <Card key={s.label} elevation="subtle">
              <CardContent className="p-6">
                <p className="font-display text-3xl text-dlugomat-950">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-iron-500">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-2xl text-dlugomat-950">Wszystkie materialy</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.map((c) => {
            const Icon = FORMAT_ICON[c.format];
            return (
              <Card key={c.slug} elevation="subtle" urgency={c.free ? "success" : "none"}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-dlugomat-50">
                      <Icon className="h-5 w-5 text-dlugomat-700" aria-hidden />
                    </div>
                    {c.free ? (
                      <Badge tone="success" withDot>Darmowy</Badge>
                    ) : (
                      <Badge tone="warning">Premium</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-3 text-base">
                    <Link href={`/edukacja/${c.slug}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </CardTitle>
                  <CardDescription>
                    <span className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge tone="neutral">{FORMAT_LABEL[c.format]}</Badge>
                      <Badge tone={LEVEL_TONE[c.level]}>{c.level}</Badge>
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-iron-500">
                      {c.topic} · {c.duration}
                    </p>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/edukacja/${c.slug}`}>
                        Otworz
                        <ArrowRight className="ml-1 h-3 w-3" aria-hidden />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-dlugomat-700" aria-hidden />
                Bezplatny newsletter edukacyjny
              </CardTitle>
              <CardDescription>
                Co tydzien jeden temat + checklist. 12 000 subskrybentow.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="flex gap-2">
                <label className="flex-1">
                  <span className="sr-only">Email</span>
                  <input
                    type="email"
                    required
                    placeholder="twoj.email@example.pl"
                    className="h-10 w-full rounded-md border border-iron-200 px-3 text-sm focus-visible:outline-none focus-visible:shadow-shield-focus"
                  />
                </label>
                <Button type="submit" variant="primary">Zapisz</Button>
              </form>
            </CardContent>
          </Card>

          <Card elevation="subtle" urgency="normal">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Video className="h-5 w-5 text-dlugomat-700" aria-hidden />
                Webinar w czwartek
              </CardTitle>
              <CardDescription>
                "Sprzeciw od EPU — 5 najczestszych bledow" — 12.05.2026 o 18:00.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="primary" block>
                <Link href="/edukacja/webinar-12-05-2026">
                  Zarejestruj sie
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
