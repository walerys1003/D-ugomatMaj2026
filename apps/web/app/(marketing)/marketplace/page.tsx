/**
 * Tier 35 — Marketplace landing page.
 *
 * Publiczna strona z katalogiem integracji, szablonów pism, agentów AI
 * i usług partnerskich. Filtry: kategoria, typ, model cenowy, search.
 * Source: GET /api/marketplace/listings + /api/marketplace/featured.
 */
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  fetchListings,
  LISTING_CATEGORIES,
  KIND_LABELS,
  PRICE_MODEL_LABELS,
  type MarketplaceListing,
} from "@/lib/marketplace/listings";

export const metadata: Metadata = {
  title: "Marketplace integracji — Długomat",
  description:
    "Katalog wtyczek, integracji, agentów AI i szablonów pism certyfikowanych przez kancelarie. Rozszerz Długomata bez kodowania.",
  alternates: { canonical: "/marketplace" },
};

export const revalidate = 300;

function StarRating({ avg, count }: { avg: number; count: number }) {
  const full = Math.round(avg);
  return (
    <span className="inline-flex items-center gap-1 text-fluid-xs text-iron-600 dark:text-iron-300">
      <span aria-hidden className="text-warn-500">
        {"★".repeat(full)}
        <span className="text-iron-300 dark:text-dlugomat-700">{"★".repeat(5 - full)}</span>
      </span>
      <span>
        {avg.toFixed(1)} <span className="text-iron-400">({count})</span>
      </span>
    </span>
  );
}

function ListingCard({ l }: { l: MarketplaceListing }) {
  return (
    <Card
      elevation="subtle"
      className="group relative flex h-full flex-col overflow-hidden transition-shadow duration-base hover:shadow-pop"
    >
      <Link
        href={`/marketplace/${l.slug}`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:shadow-shield-focus"
        aria-label={`Otwórz ${l.title}`}
      />
      <div className="aspect-[16/9] w-full overflow-hidden bg-iron-50 dark:bg-dlugomat-900">
        {l.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={l.cover_image_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-slow group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-iron-300 dark:text-dlugomat-700">
            <span className="font-display text-fluid-4xl">{l.title.charAt(0)}</span>
          </div>
        )}
      </div>
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="font-medium">
            {KIND_LABELS[l.kind]}
          </Badge>
          {l.vendor.verified && (
            <Badge variant="default" className="bg-dlugomat-700 text-white">
              Zweryfikowany partner
            </Badge>
          )}
          {l.price_model === "free" && (
            <Badge variant="default" className="bg-accent-600 text-white">
              Bezpłatne
            </Badge>
          )}
        </div>
        <h3 className="font-display text-fluid-lg leading-tight text-dlugomat-900 dark:text-iron-50">
          {l.title}
        </h3>
        <p className="line-clamp-2 text-fluid-sm text-iron-600 dark:text-iron-300">{l.tagline}</p>

        <div className="mt-auto flex items-center justify-between border-t border-iron-200 pt-3 dark:border-dlugomat-800">
          <span className="text-fluid-xs text-iron-500 dark:text-iron-400">{l.vendor.name}</span>
          <StarRating avg={l.rating_avg} count={l.rating_count} />
        </div>
        <div className="flex items-center justify-between text-fluid-xs text-iron-500 dark:text-iron-400">
          <span>
            {PRICE_MODEL_LABELS[l.price_model]}
            {l.price_pln != null && l.price_pln > 0 && (
              <span className="ml-1 font-semibold text-dlugomat-900 dark:text-iron-50">
                · {l.price_pln} zł
              </span>
            )}
          </span>
          <span>{l.install_count.toLocaleString("pl-PL")} instalacji</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; kind?: string; sort?: string; q?: string }>;
}) {
  const params = await searchParams;
  const listings = await fetchListings({
    category: params.category,
    kind: params.kind as never,
    sort: (params.sort as never) ?? "popular",
    search: params.q,
  });

  const featured = listings.filter((l) => l.install_count > 100).slice(0, 3);
  const rest = listings.filter((l) => !featured.includes(l));

  return (
    <div className="bg-gradient-to-b from-iron-50 to-white pb-20 dark:from-dlugomat-950 dark:to-dlugomat-900">
      <section className="container py-12 lg:py-20">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
            <span className="h-px w-8 bg-dlugomat-600 dark:bg-dlugomat-400" />
            Marketplace
          </p>
          <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-iron-50">
            Wszystko, czego Twoja kancelaria potrzebuje — w jednym miejscu.
          </h1>
          <p className="mt-5 text-fluid-lg leading-relaxed text-iron-700 dark:text-iron-200">
            Zweryfikowane integracje z e-Sądem, ePUAP, księgowością i CRM-ami. Agenty AI
            wyspecjalizowane w upadłości, cesji i BIK. Szablony pism certyfikowane przez
            radców prawnych. Aktywuj jednym kliknięciem.
          </p>
        </div>

        {/* Filtry kategorii */}
        <nav aria-label="Kategorie marketplace" className="mt-10 flex flex-wrap gap-2">
          <Link
            href="/marketplace"
            className={`rounded-full border px-4 py-2 text-fluid-sm font-medium transition-colors ${
              !params.category
                ? "border-dlugomat-700 bg-dlugomat-700 text-white"
                : "border-iron-200 bg-white text-iron-700 hover:border-dlugomat-300 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-iron-200"
            }`}
          >
            Wszystkie
          </Link>
          {LISTING_CATEGORIES.map((c) => (
            <Link
              key={c.key}
              href={`/marketplace?category=${c.key}`}
              className={`rounded-full border px-4 py-2 text-fluid-sm font-medium transition-colors ${
                params.category === c.key
                  ? "border-dlugomat-700 bg-dlugomat-700 text-white"
                  : "border-iron-200 bg-white text-iron-700 hover:border-dlugomat-300 dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:text-iron-200"
              }`}
            >
              {c.label}
            </Link>
          ))}
        </nav>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="container py-8">
          <h2 className="mb-6 font-display text-fluid-2xl font-semibold text-dlugomat-900 dark:text-iron-50">
            Polecane przez zespół Długomata
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        </section>
      )}

      {/* Wszystkie */}
      <section className="container py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-fluid-2xl font-semibold text-dlugomat-900 dark:text-iron-50">
            {params.category
              ? LISTING_CATEGORIES.find((c) => c.key === params.category)?.label ?? "Kategoria"
              : "Wszystkie pozycje"}
            <span className="ml-3 text-fluid-base font-normal text-iron-500">
              {rest.length + featured.length}
            </span>
          </h2>
          <div className="flex items-center gap-2 text-fluid-sm">
            <span className="text-iron-500">Sortuj:</span>
            <Link
              href={`/marketplace?${new URLSearchParams({ ...params, sort: "popular" } as never).toString()}`}
              className={params.sort === "popular" || !params.sort ? "font-semibold text-dlugomat-700" : "text-iron-600 hover:text-dlugomat-700"}
            >
              Popularne
            </Link>
            <span aria-hidden className="text-iron-300">·</span>
            <Link
              href={`/marketplace?${new URLSearchParams({ ...params, sort: "newest" } as never).toString()}`}
              className={params.sort === "newest" ? "font-semibold text-dlugomat-700" : "text-iron-600 hover:text-dlugomat-700"}
            >
              Najnowsze
            </Link>
            <span aria-hidden className="text-iron-300">·</span>
            <Link
              href={`/marketplace?${new URLSearchParams({ ...params, sort: "rating" } as never).toString()}`}
              className={params.sort === "rating" ? "font-semibold text-dlugomat-700" : "text-iron-600 hover:text-dlugomat-700"}
            >
              Najwyżej oceniane
            </Link>
          </div>
        </div>

        {rest.length === 0 && featured.length === 0 ? (
          <Card elevation="subtle" className="py-16 text-center">
            <CardContent>
              <p className="font-display text-fluid-xl text-iron-700 dark:text-iron-200">
                Brak pozycji w tej kategorii
              </p>
              <p className="mt-2 text-fluid-sm text-iron-500">Pracujemy nad nowymi integracjami. Wróć wkrótce.</p>
              <Button asChild variant="primary" className="mt-6">
                <Link href="/marketplace">Pokaż wszystkie</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rest.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        )}
      </section>

      {/* CTA dla partnerów */}
      <section className="container mt-16">
        <Card elevation="pop" className="overflow-hidden border-dlugomat-700/30 bg-gradient-to-br from-dlugomat-900 to-dlugomat-700 text-iron-50">
          <CardContent className="grid gap-8 p-10 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <p className="mb-3 text-fluid-xs font-semibold uppercase tracking-wider text-accent-300">
                Dla deweloperów i kancelarii
              </p>
              <h2 className="font-display text-fluid-3xl font-bold leading-tight">
                Zbuduj integrację. Zarobisz na każdej instalacji.
              </h2>
              <p className="mt-4 max-w-xl text-fluid-base leading-relaxed text-iron-100/90">
                Wystawiamy publiczne API, SDK i Zapier blueprint. Revenue share 70/30
                (Ty / Długomat) dla wszystkich płatnych pozycji. Marketplace dystrybuuje
                Twój produkt do 200 000+ użytkowników.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild size="lg" variant="success" className="w-full">
                <Link href="/program-partnerski">Dołącz jako partner</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="w-full border border-iron-50/30 text-iron-50 hover:bg-iron-50/10">
                <Link href="/api/docs/openapi">Dokumentacja API</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
