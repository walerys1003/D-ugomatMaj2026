/**
 * Tier 35 — Marketplace listing detail page.
 *
 * Szczegóły pojedynczej pozycji: opis, galeria, recenzje, "Zainstaluj".
 * Source: GET /api/marketplace/listings?slug=... + /api/marketplace/reviews.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchListingBySlug,
  KIND_LABELS,
  PRICE_MODEL_LABELS,
} from "@/lib/marketplace/listings";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await fetchListingBySlug(slug);
  if (!l) return { title: "Pozycja nie znaleziona — Długomat" };
  return {
    title: `${l.title} — Marketplace Długomat`,
    description: l.tagline,
    alternates: { canonical: `/marketplace/${slug}` },
    openGraph: {
      title: l.title,
      description: l.tagline,
      images: l.cover_image_url ? [{ url: l.cover_image_url }] : undefined,
    },
  };
}

export const revalidate = 300;

export default async function ListingDetailPage({ params }: Props) {
  const { slug } = await params;
  const l = await fetchListingBySlug(slug);
  if (!l) notFound();

  return (
    <article className="bg-white pb-20 dark:bg-dlugomat-950">
      {/* Header */}
      <header className="container py-10 lg:py-14">
        <nav aria-label="Okruszki" className="mb-6 text-fluid-xs text-ink-500">
          <Link href="/marketplace" className="hover:text-dlugomat-700">
            Marketplace
          </Link>
          <span className="mx-2 text-ink-300">/</span>
          <span className="text-ink-700 dark:text-ink-200">{l.title}</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[2fr_1fr] lg:gap-16">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge variant="outline">{KIND_LABELS[l.kind]}</Badge>
              {l.vendor.verified && (
                <Badge className="bg-dlugomat-700 text-white">Zweryfikowany partner</Badge>
              )}
              {l.processes_pii && (
                <Badge variant="outline" className="border-warn-500 text-warn-600">
                  Przetwarza dane osobowe
                </Badge>
              )}
            </div>
            <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-ink-50">
              {l.title}
            </h1>
            <p className="mt-4 text-fluid-lg leading-relaxed text-ink-700 dark:text-ink-200">
              {l.tagline}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-y-4 border-y border-ink-200 py-6 text-fluid-sm dark:border-dlugomat-800 md:grid-cols-4">
              <div>
                <dt className="text-ink-500">Dostawca</dt>
                <dd className="mt-1 font-semibold text-dlugomat-900 dark:text-ink-50">
                  {l.vendor.name}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Instalacje</dt>
                <dd className="mt-1 font-semibold text-dlugomat-900 dark:text-ink-50">
                  {l.install_count.toLocaleString("pl-PL")}
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Ocena</dt>
                <dd className="mt-1 font-semibold text-dlugomat-900 dark:text-ink-50">
                  {l.rating_avg.toFixed(1)} / 5 ({l.rating_count})
                </dd>
              </div>
              <div>
                <dt className="text-ink-500">Cena</dt>
                <dd className="mt-1 font-semibold text-dlugomat-900 dark:text-ink-50">
                  {PRICE_MODEL_LABELS[l.price_model]}
                  {l.price_pln != null && l.price_pln > 0 && ` · ${l.price_pln} zł`}
                </dd>
              </div>
            </dl>
          </div>

          <aside className="lg:sticky lg:top-24">
            <Card elevation="pop" className="overflow-hidden">
              {l.cover_image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.cover_image_url} alt="" className="aspect-video w-full object-cover" />
              )}
              <CardContent className="space-y-4 p-6">
                <form action="/api/marketplace/plugins/install" method="POST">
                  <input type="hidden" name="listing_id" value={l.id} />
                  <Button type="submit" variant="success" size="lg" className="w-full">
                    Zainstaluj
                  </Button>
                </form>
                {l.documentation_url && (
                  <Button asChild variant="ghost" className="w-full">
                    <Link href={l.documentation_url}>Dokumentacja</Link>
                  </Button>
                )}
                {l.changelog_url && (
                  <Button asChild variant="link" className="w-full">
                    <Link href={l.changelog_url}>Historia zmian</Link>
                  </Button>
                )}
                <p className="text-center text-fluid-xs text-ink-500">
                  Instalacja wymaga aktywnego konta. Bez zobowiązań — odinstaluj
                  w dowolnym momencie z panelu.
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
      </header>

      {/* Description */}
      <section className="container mt-8 grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2 className="font-display text-fluid-2xl font-semibold">Opis</h2>
          <div
            className="text-ink-700 dark:text-ink-200"
            dangerouslySetInnerHTML={{ __html: l.description_md }}
          />

          {l.gallery.length > 0 && (
            <>
              <h2 className="mt-12 font-display text-fluid-2xl font-semibold">Galeria</h2>
              <div className="not-prose grid gap-4 md:grid-cols-2">
                {l.gallery.map((url, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={i}
                    src={url}
                    alt={`${l.title} screenshot ${i + 1}`}
                    className="rounded-lg border border-ink-200 dark:border-dlugomat-800"
                    loading="lazy"
                  />
                ))}
              </div>
            </>
          )}

          <h2 className="mt-12 font-display text-fluid-2xl font-semibold">Bezpieczeństwo i RODO</h2>
          <ul>
            <li>
              <strong>Przetwarzanie danych osobowych:</strong> {l.processes_pii ? "TAK — z DPA" : "NIE"}
            </li>
            <li>
              <strong>Hosting:</strong> wyłącznie UE (zgodnie z polityką Długomata)
            </li>
            <li>
              <strong>Audyt bezpieczeństwa:</strong> wymagany dla zweryfikowanych partnerów
            </li>
          </ul>
        </div>

        <aside className="space-y-6">
          <Card elevation="subtle">
            <CardContent className="space-y-3 p-6">
              <h3 className="font-display text-fluid-lg font-semibold text-dlugomat-900 dark:text-ink-50">
                Tagi
              </h3>
              <div className="flex flex-wrap gap-2">
                {l.tags.map((t) => (
                  <Badge key={t} variant="outline">
                    {t}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardContent className="space-y-3 p-6">
              <h3 className="font-display text-fluid-lg font-semibold text-dlugomat-900 dark:text-ink-50">
                Wsparcie
              </h3>
              <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
                Problemy z {l.title}? Skontaktuj się bezpośrednio z dostawcą lub przez nasz support.
              </p>
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link href={`/kontakt?listing=${l.slug}`}>Skontaktuj się</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </article>
  );
}
