/**
 * Tier 35 — Marketplace partners directory.
 *
 * Lista zweryfikowanych partnerów (kancelarie, software houses, agencje).
 * Source: GET /api/marketplace/partners
 */
import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Partnerzy — Marketplace Długomat",
  description:
    "Zweryfikowane kancelarie i software houses oferujące rozwiązania na bazie Długomata. Sprawdzeni, certyfikowani, gotowi do współpracy.",
  alternates: { canonical: "/marketplace/partnerzy" },
};

export const revalidate = 600;

interface Partner {
  id: string;
  slug: string;
  name: string;
  type: "law_firm" | "software_house" | "consultancy" | "individual_lawyer";
  tagline: string;
  city: string;
  voivodeship: string;
  specializations: string[];
  certifications: string[];
  rating_avg: number;
  rating_count: number;
  cases_closed: number;
  logo_url: string | null;
  verified_since: string;
}

const TYPE_LABELS: Record<Partner["type"], string> = {
  law_firm: "Kancelaria prawna",
  software_house: "Software house",
  consultancy: "Doradztwo",
  individual_lawyer: "Radca prawny",
};

async function fetchPartners(): Promise<Partner[]> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "") ?? "";
  try {
    const res = await fetch(`${baseUrl}/api/marketplace/partners`, {
      next: { revalidate: 600, tags: ["marketplace:partners"] },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as { items?: Partner[] };
    return json.items ?? [];
  } catch {
    return [];
  }
}

export default async function PartnersPage() {
  const partners = await fetchPartners();

  // Group by voivodeship for geographic view
  const byVoivodeship = partners.reduce<Record<string, Partner[]>>((acc, p) => {
    (acc[p.voivodeship] ??= []).push(p);
    return acc;
  }, {});

  return (
    <div className="bg-white pb-20 dark:bg-dlugomat-950">
      <section className="container py-12 lg:py-20">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex items-center gap-2 text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
            <span className="h-px w-8 bg-dlugomat-600" />
            Sieć partnerska
          </p>
          <h1 className="font-display text-fluid-5xl font-bold leading-tight text-dlugomat-900 dark:text-iron-50">
            Zweryfikowani partnerzy
          </h1>
          <p className="mt-5 text-fluid-lg leading-relaxed text-iron-700 dark:text-iron-200">
            Kancelarie, radcowie prawni i software houses, którzy wdrażają Długomata
            u klientów. Każdy partner przeszedł audyt prawny i techniczny.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card elevation="flat">
            <CardContent className="p-5">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
                {partners.length}
              </p>
              <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
                Aktywnych partnerów
              </p>
            </CardContent>
          </Card>
          <Card elevation="flat">
            <CardContent className="p-5">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
                {Object.keys(byVoivodeship).length}
              </p>
              <p className="text-fluid-xs uppercase tracking-wide text-iron-500">Województw</p>
            </CardContent>
          </Card>
          <Card elevation="flat">
            <CardContent className="p-5">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
                {partners
                  .reduce((acc, p) => acc + p.cases_closed, 0)
                  .toLocaleString("pl-PL")}
              </p>
              <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
                Spraw zamkniętych
              </p>
            </CardContent>
          </Card>
          <Card elevation="flat">
            <CardContent className="p-5">
              <p className="font-display text-fluid-3xl font-bold text-dlugomat-900 dark:text-iron-50">
                {partners.length > 0
                  ? (
                      partners.reduce((acc, p) => acc + p.rating_avg, 0) / partners.length
                    ).toFixed(2)
                  : "—"}
              </p>
              <p className="text-fluid-xs uppercase tracking-wide text-iron-500">
                Średnia ocena
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container">
        {partners.length === 0 ? (
          <Card elevation="subtle" className="py-16 text-center">
            <CardContent>
              <p className="font-display text-fluid-xl text-iron-700">
                Brak zweryfikowanych partnerów
              </p>
              <p className="mt-2 text-fluid-sm text-iron-500">
                Sieć partnerska jest w fazie budowy. Wróć wkrótce.
              </p>
              <Button asChild variant="primary" className="mt-6">
                <Link href="/program-partnerski">Dołącz jako partner</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-12">
            {Object.entries(byVoivodeship)
              .sort(([a], [b]) => a.localeCompare(b, "pl"))
              .map(([voivodeship, items]) => (
                <div key={voivodeship}>
                  <h2 className="mb-4 font-display text-fluid-xl font-semibold text-dlugomat-900 dark:text-iron-50">
                    {voivodeship}
                    <span className="ml-3 text-fluid-base font-normal text-iron-500">
                      {items.length}
                    </span>
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {items.map((p) => (
                      <Card key={p.id} elevation="subtle" className="group transition-shadow hover:shadow-pop">
                        <Link
                          href={`/marketplace/partnerzy/${p.slug}`}
                          className="block p-5 focus-visible:shadow-shield-focus"
                        >
                          <div className="flex items-start gap-4">
                            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-iron-100 dark:bg-dlugomat-900">
                              {p.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.logo_url} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <span className="flex h-full w-full items-center justify-center font-display text-fluid-xl text-iron-400">
                                  {p.name.charAt(0)}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-display text-fluid-base font-semibold text-dlugomat-900 dark:text-iron-50">
                                {p.name}
                              </h3>
                              <p className="mt-0.5 text-fluid-xs text-iron-500">
                                {TYPE_LABELS[p.type]} · {p.city}
                              </p>
                            </div>
                          </div>
                          <p className="mt-3 line-clamp-2 text-fluid-sm text-iron-600 dark:text-iron-300">
                            {p.tagline}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1">
                            {p.specializations.slice(0, 3).map((s) => (
                              <Badge key={s} variant="outline" className="text-fluid-xs">
                                {s}
                              </Badge>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-iron-200 pt-3 text-fluid-xs text-iron-500 dark:border-dlugomat-800">
                            <span>
                              <span className="text-warn-500">★</span> {p.rating_avg.toFixed(1)}{" "}
                              <span className="text-iron-400">({p.rating_count})</span>
                            </span>
                            <span>{p.cases_closed.toLocaleString("pl-PL")} spraw</span>
                          </div>
                        </Link>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <section className="container mt-16">
        <Card elevation="pop" className="border-dlugomat-700/30 bg-dlugomat-50 dark:bg-dlugomat-900">
          <CardContent className="grid gap-6 p-10 lg:grid-cols-[2fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-fluid-2xl font-bold text-dlugomat-900 dark:text-iron-50">
                Jesteś kancelarią lub radcą prawnym?
              </h2>
              <p className="mt-3 text-fluid-base leading-relaxed text-iron-700 dark:text-iron-200">
                Dołącz do sieci partnerskiej Długomata. Bezpłatny audyt, certyfikat,
                widoczność w katalogu i automatyczne kierowanie leadów ze Twojego regionu.
              </p>
            </div>
            <Button asChild size="lg" variant="primary" className="w-full">
              <Link href="/program-partnerski">Zostań partnerem</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
