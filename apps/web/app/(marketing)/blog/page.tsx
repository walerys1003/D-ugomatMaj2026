import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Tag, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Blog Dlugomat — legaltech i windykacja w Polsce",
  description:
    "Praktyczne artykuly o prawie windykacyjnym, przedawnieniu, EPU i obronie konsumenta. Pisane przez prawnikow.",
  alternates: { canonical: "/blog" },
};

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "EPU" | "Komornik" | "Przedawnienie" | "Konsument" | "Legaltech";
  author: string;
  author_role: string;
  date: string;
  read_min: number;
  featured: boolean;
}

const CATEGORY_TONE: Record<BlogPost["category"], "info" | "warning" | "success" | "danger" | "neutral"> = {
  EPU: "info",
  Komornik: "warning",
  Przedawnienie: "success",
  Konsument: "danger",
  Legaltech: "neutral",
};

const POSTS: ReadonlyArray<BlogPost> = [
  {
    slug: "epu-2026-co-zmienia-nowelizacja",
    title: "EPU 2026 — co zmienia majowa nowelizacja",
    excerpt: "Nowelizacja KPC z maja 2026 wprowadza obowiazek elektronicznej akceptacji nakazu. Analizujemy 5 kluczowych zmian.",
    category: "EPU",
    author: "Adw. Tomasz Kowalski",
    author_role: "Of Counsel",
    date: "2026-05-10",
    read_min: 8,
    featured: true,
  },
  {
    slug: "przedawnienie-roszczen-2026",
    title: "Przedawnienie roszczen — kompletny przewodnik 2026",
    excerpt: "Art. 118 KC w praktyce. Kiedy 3 lata, kiedy 6, kiedy 10. Z przykladami z orzecznictwa SN.",
    category: "Przedawnienie",
    author: "Dr Magdalena Wisniewska",
    author_role: "Senior Counsel",
    date: "2026-05-06",
    read_min: 12,
    featured: true,
  },
  {
    slug: "egzekucja-z-wynagrodzenia-limity",
    title: "Egzekucja z wynagrodzenia — limity kwot wolnych",
    excerpt: "Kwota minimalna, dodatki, premie. Co komornik moze zajac, a czego nie. Wraz z kalkulatorem.",
    category: "Komornik",
    author: "Adw. Piotr Michalski",
    author_role: "Head of Legal",
    date: "2026-05-02",
    read_min: 9,
    featured: false,
  },
  {
    slug: "klauzule-abuzywne-bik",
    title: "Klauzule abuzywne w umowach kredytowych",
    excerpt: "Klauzule walutowe, zmienne oprocentowanie, ubezpieczenie pomostowe. Co mozesz wykorzystac.",
    category: "Konsument",
    author: "Dr Magdalena Wisniewska",
    author_role: "Senior Counsel",
    date: "2026-04-28",
    read_min: 14,
    featured: false,
  },
  {
    slug: "ai-w-prawie-co-juz-dziala",
    title: "AI w prawie — co juz dziala, a co jeszcze nie",
    excerpt: "Raport po roku uzywania AI do analizy pism prawnych. Statystyki, ograniczenia, perspektywy.",
    category: "Legaltech",
    author: "Walery Kostrzewa",
    author_role: "CEO",
    date: "2026-04-22",
    read_min: 6,
    featured: false,
  },
  {
    slug: "sprzeciw-od-nakazu-krok-po-kroku",
    title: "Sprzeciw od nakazu zaplaty — krok po kroku",
    excerpt: "Co napisac, gdzie zlozyc, jakie terminy. Praktyczny przewodnik z przykladowym wzorem.",
    category: "EPU",
    author: "Adw. Tomasz Kowalski",
    author_role: "Of Counsel",
    date: "2026-04-18",
    read_min: 10,
    featured: false,
  },
  {
    slug: "biuro-rachunkowe-windykacja-poradnik",
    title: "Windykacja dla biur rachunkowych — co warto wiedziec",
    excerpt: "Jak biuro moze pomoc klientowi z zaleglymi naleznosciami. Bez wchodzenia w role prawnika.",
    category: "Legaltech",
    author: "Barbara Wojcik",
    author_role: "Product Manager",
    date: "2026-04-14",
    read_min: 7,
    featured: false,
  },
];

export default function BlogHubPage() {
  const featured = POSTS.filter((p) => p.featured);
  const others = POSTS.filter((p) => !p.featured);

  return (
    <div className="bg-background">
      <section className="border-b border-iron-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <Badge tone="neutral" withDot className="mb-4">
            <BookOpen className="mr-1 h-3 w-3" />
            Blog
          </Badge>
          <h1 className="font-display text-4xl tracking-tight text-dlugomat-950 sm:text-5xl">
            Wiedza prawna w pigulce.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-iron-600">
            Praktyczne artykuly o EPU, komorniku, przedawnieniu i obronie konsumenta. Pisane przez
            prawnikow, weryfikowane przez redakcje.
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-12">
          <h2 className="font-display text-2xl text-dlugomat-950">Wyrozniony</h2>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {featured.map((p) => (
              <Card key={p.slug} elevation="pop" urgency="success">
                <CardHeader>
                  <Badge tone={CATEGORY_TONE[p.category]} withDot>
                    {p.category}
                  </Badge>
                  <CardTitle className="mt-3 text-2xl">{p.title}</CardTitle>
                  <CardDescription className="text-base">{p.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-iron-500">
                    <span>
                      {p.author} · {p.author_role}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden />
                      {p.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden />
                      {p.read_min} min
                    </span>
                  </div>
                  <Button asChild variant="primary" size="sm" className="mt-5">
                    <Link href={`/blog/${p.slug}`}>
                      Czytaj artykul
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="font-display text-2xl text-dlugomat-950">Wszystkie wpisy</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <Card key={p.slug} elevation="subtle">
              <CardHeader>
                <Badge tone={CATEGORY_TONE[p.category]}>{p.category}</Badge>
                <CardTitle className="mt-3 text-lg">
                  <Link href={`/blog/${p.slug}`} className="hover:underline">
                    {p.title}
                  </Link>
                </CardTitle>
                <CardDescription>{p.excerpt}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-2 text-xs text-iron-500">
                  <span>{p.author}</span>
                  <span>·</span>
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.read_min} min</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-iron-200 bg-white p-8 text-center">
          <h2 className="font-display text-2xl text-dlugomat-950">Subskrybuj newsletter</h2>
          <p className="mt-2 text-iron-600">
            Co dwa tygodnie wybor 3 najwazniejszych zmian w prawie windykacyjnym.
          </p>
          <form className="mx-auto mt-6 flex max-w-md gap-2">
            <label className="flex-1">
              <span className="sr-only">Email</span>
              <input
                type="email"
                required
                placeholder="twoj.email@firma.pl"
                className="h-10 w-full rounded-md border border-iron-200 px-3 text-sm focus-visible:outline-none focus-visible:shadow-shield-focus"
              />
            </label>
            <Button type="submit" variant="primary">
              Zapisz sie
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
}
