import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Materiały | Partner | Długomat" };

interface PartnerAsset {
  id: string;
  kind: "banner" | "landing" | "presentation" | "email_template" | "case_study" | "logo";
  title: string;
  description: string;
  format: string;
  size_kb?: number;
  download_url: string;
  preview_url?: string;
}

interface PartnerLinks {
  referral_link: string;
  utm_params: string;
  qr_code_url: string;
}

async function fetchAssets(): Promise<PartnerAsset[]> {
  try {
    const res = await fetch("/api/partner/assets", { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return data.assets ?? [];
  } catch {
    return [];
  }
}

async function fetchLinks(): Promise<PartnerLinks | null> {
  try {
    const res = await fetch("/api/partner/links", { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as PartnerLinks;
  } catch {
    return null;
  }
}

const KIND_LABELS: Record<PartnerAsset["kind"], string> = {
  banner: "Baner",
  landing: "Landing",
  presentation: "Prezentacja",
  email_template: "Szablon e-mail",
  case_study: "Case study",
  logo: "Logo",
};

const KIND_GROUPS: Array<{ key: PartnerAsset["kind"]; title: string }> = [
  { key: "banner", title: "Banery i kreacje" },
  { key: "landing", title: "Landingi co-branded" },
  { key: "presentation", title: "Prezentacje" },
  { key: "email_template", title: "Szablony e-mail" },
  { key: "case_study", title: "Case studies" },
  { key: "logo", title: "Logo i identyfikacja" },
];

export default async function MaterialyPage() {
  const [assets, links] = await Promise.all([fetchAssets(), fetchLinks()]);

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div>
        <Link href="/panel/partner" className="text-xs text-iron-500 hover:text-iron-700">
          ← Panel partnera
        </Link>
        <h1 className="font-display text-3xl font-semibold text-iron-900 dark:text-iron-50 mt-2">
          Materiały marketingowe
        </h1>
        <p className="text-sm text-iron-500 mt-1">
          Wszystko, czego potrzebujesz, aby promować Długomat — gotowe do pobrania.
        </p>
      </div>

      {links && (
        <Card elevation="pop">
          <CardHeader>
            <CardTitle>Twój link partnerski</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <code className="block font-mono text-xs px-3 py-2 rounded-md bg-iron-100 dark:bg-iron-800 break-all">
              {links.referral_link}
            </code>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" type="button">
                Skopiuj link
              </Button>
              <a href={links.qr_code_url} download>
                <Button variant="secondary">Pobierz QR</Button>
              </a>
              <Link href="/panel/partner/leady">
                <Button variant="ghost">Zobacz leady</Button>
              </Link>
            </div>
            <p className="text-xs text-iron-500">
              UTM: <code className="font-mono">{links.utm_params}</code>
            </p>
          </CardContent>
        </Card>
      )}

      {KIND_GROUPS.map((group) => {
        const groupAssets = assets.filter((a) => a.kind === group.key);
        if (groupAssets.length === 0) return null;
        return (
          <section key={group.key} className="space-y-3">
            <h2 className="font-display text-xl font-semibold text-iron-900 dark:text-iron-50">
              {group.title}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groupAssets.map((a) => (
                <Card key={a.id} elevation="subtle">
                  {a.preview_url && (
                    <div className="aspect-video bg-iron-100 dark:bg-iron-800 overflow-hidden rounded-t-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={a.preview_url}
                        alt={a.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-base">{a.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-iron-600 dark:text-iron-400 line-clamp-2">
                      {a.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-iron-500">
                      <span className="uppercase">
                        {a.format}
                        {a.size_kb ? ` · ${Math.round(a.size_kb / 1024 * 10) / 10} MB` : ""}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-iron-100 dark:bg-iron-800">
                        {KIND_LABELS[a.kind]}
                      </span>
                    </div>
                    <a href={a.download_url} download className="block">
                      <Button variant="secondary" className="w-full">
                        Pobierz
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      })}

      {assets.length === 0 && (
        <Card elevation="subtle">
          <CardContent className="pt-6">
            <p className="text-sm text-iron-500">
              Materiały będą dostępne wkrótce — w międzyczasie skorzystaj z linku
              partnerskiego powyżej.
            </p>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
