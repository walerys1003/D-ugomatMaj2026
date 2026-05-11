import * as React from "react";
import Link from "next/link";
import { Bell, Mail, MessageSquare, Phone, Search, Plus, Edit3, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Szablony notyfikacji - Dlugomat Admin",
  description: "Biblioteka szablonow notyfikacji email, SMS, push i IVR.",
};

type Template = {
  id: string;
  name: string;
  channel: "email" | "sms" | "push" | "ivr";
  category: string;
  subject?: string;
  preview: string;
  variables: string[];
  lastEdit: string;
  usageCount: number;
  status: "active" | "draft" | "archived";
};

const TEMPLATES: Template[] = [
  {
    id: "t-001",
    name: "Powitanie nowego dluznika",
    channel: "email",
    category: "Onboarding",
    subject: "Witamy w Dlugomat - pierwsze kroki",
    preview: "Dzien dobry {imie}, dziekujemy za rejestracje. Twoj numer sprawy to {sprawa}...",
    variables: ["imie", "sprawa", "data_rejestracji"],
    lastEdit: "2026-05-09",
    usageCount: 1245,
    status: "active",
  },
  {
    id: "t-002",
    name: "Przypomnienie o racie",
    channel: "sms",
    category: "Platnosci",
    preview: "Dlugomat: Przypominamy o racie {kwota} PLN platnej do {data}. Szczegoly: {link}",
    variables: ["kwota", "data", "link"],
    lastEdit: "2026-05-07",
    usageCount: 8920,
    status: "active",
  },
  {
    id: "t-003",
    name: "Nowy dokument w sprawie",
    channel: "push",
    category: "Sprawy",
    preview: "Pojawil sie nowy dokument w sprawie {sprawa}. Kliknij aby zobaczyc.",
    variables: ["sprawa"],
    lastEdit: "2026-05-05",
    usageCount: 3450,
    status: "active",
  },
  {
    id: "t-004",
    name: "Pilna decyzja sadu",
    channel: "email",
    category: "Sprawy",
    subject: "Pilne: decyzja w sprawie {sprawa}",
    preview: "Otrzymalismy decyzje w Twojej sprawie. Termin reakcji: {termin}. Skontaktuj sie z nami...",
    variables: ["sprawa", "termin", "doradca"],
    lastEdit: "2026-05-03",
    usageCount: 234,
    status: "active",
  },
  {
    id: "t-005",
    name: "Potwierdzenie platnosci",
    channel: "email",
    category: "Platnosci",
    subject: "Potwierdzenie platnosci {kwota} PLN",
    preview: "Otrzymalismy Twoja platnosc {kwota} PLN z dnia {data}. Pozostalo: {pozostalo} PLN.",
    variables: ["kwota", "data", "pozostalo"],
    lastEdit: "2026-04-28",
    usageCount: 5670,
    status: "active",
  },
  {
    id: "t-006",
    name: "Polaczenie IVR - przypomnienie",
    channel: "ivr",
    category: "Platnosci",
    preview: "Dzien dobry, dzwonimy z Dlugomat. Przypominamy o racie platnej do konca tygodnia.",
    variables: ["imie", "kwota"],
    lastEdit: "2026-04-25",
    usageCount: 89,
    status: "draft",
  },
  {
    id: "t-007",
    name: "Zaproszenie do programu beta",
    channel: "email",
    category: "Marketing",
    subject: "Zostan beta testerem Dlugomat",
    preview: "Zapraszamy do programu beta nowych funkcji. Dostaniesz wczesny dostep do...",
    variables: ["imie"],
    lastEdit: "2026-04-20",
    usageCount: 1240,
    status: "archived",
  },
  {
    id: "t-008",
    name: "RODO - zmiana polityki",
    channel: "email",
    category: "Compliance",
    subject: "Wazna informacja o przetwarzaniu danych",
    preview: "Informujemy o aktualizacji polityki prywatnosci obowiazujacej od {data}...",
    variables: ["data", "link_polityka"],
    lastEdit: "2026-04-15",
    usageCount: 12450,
    status: "active",
  },
];

const CHANNEL_ICON = {
  email: Mail,
  sms: MessageSquare,
  push: Bell,
  ivr: Phone,
};

const CHANNEL_LABEL = {
  email: "Email",
  sms: "SMS",
  push: "Push",
  ivr: "IVR",
};

const STATUS_TONE = {
  active: "success" as const,
  draft: "warning" as const,
  archived: "neutral" as const,
};

const STATUS_LABEL = {
  active: "Aktywny",
  draft: "Szkic",
  archived: "Archiwum",
};

const CATEGORIES = ["Wszystkie", "Onboarding", "Platnosci", "Sprawy", "Marketing", "Compliance"];

export default function SzablonyNotyfikacjiPage() {
  const numFmt = new Intl.NumberFormat("pl-PL");
  const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-dlugomat-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="h-6 w-6 text-accent-600" aria-hidden />
              <h1 className="font-display text-3xl text-dlugomat-950">Szablony notyfikacji</h1>
            </div>
            <p className="text-dlugomat-700 max-w-2xl">
              Centralna biblioteka szablonow wiadomosci uzywanych w kampaniach i powiadomieniach systemowych.
            </p>
          </div>
          <Button variant="primary">
            <Plus className="h-4 w-4 mr-2" aria-hidden />
            Nowy szablon
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wszystkie szablony</div>
              <div className="font-display text-3xl text-dlugomat-950">{TEMPLATES.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Aktywne</div>
              <div className="font-display text-3xl text-emerald-700">
                {TEMPLATES.filter((t) => t.status === "active").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Wyslane lacznie</div>
              <div className="font-display text-3xl text-dlugomat-950">
                {numFmt.format(TEMPLATES.reduce((acc, t) => acc + t.usageCount, 0))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-xs uppercase tracking-wide text-dlugomat-600 mb-1">Szkice</div>
              <div className="font-display text-3xl text-warn">
                {TEMPLATES.filter((t) => t.status === "draft").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dlugomat-500" aria-hidden />
                <input
                  type="search"
                  placeholder="Szukaj po nazwie, kategorii, zmiennej..."
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 placeholder:text-dlugomat-500 focus-visible:shadow-shield-focus focus-visible:outline-none"
                  aria-label="Szukaj szablonu"
                />
              </div>
              <select
                className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Filtr kanalu"
              >
                <option>Wszystkie kanaly</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Push</option>
                <option>IVR</option>
              </select>
              <select
                className="px-3 py-2 rounded-md border border-iron-300 bg-white text-dlugomat-950 focus-visible:shadow-shield-focus focus-visible:outline-none"
                aria-label="Filtr statusu"
              >
                <option>Wszystkie statusy</option>
                <option>Aktywne</option>
                <option>Szkice</option>
                <option>Archiwum</option>
              </select>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((cat, idx) => (
                <button
                  key={cat}
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm font-medium border focus-visible:shadow-shield-focus focus-visible:outline-none ${
                    idx === 0
                      ? "bg-dlugomat-900 text-white border-dlugomat-900"
                      : "bg-white text-dlugomat-800 border-iron-300 hover:bg-dlugomat-50"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {TEMPLATES.map((t) => {
            const Icon = CHANNEL_ICON[t.channel];
            return (
              <Card key={t.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="p-2 rounded-md bg-accent-50 text-accent-700 shrink-0">
                        <Icon className="h-5 w-5" aria-hidden />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">{t.name}</CardTitle>
                        {t.subject && <CardDescription className="truncate">{t.subject}</CardDescription>}
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[t.status]} withDot>
                      {STATUS_LABEL[t.status]}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-dlugomat-800 mb-3 line-clamp-2">{t.preview}</div>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {t.variables.map((v) => (
                      <code
                        key={v}
                        className="px-1.5 py-0.5 rounded text-xs bg-iron-100 text-dlugomat-800 font-mono"
                      >
                        {`{${v}}`}
                      </code>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-xs text-dlugomat-600 mb-3">
                    <span>Kanal: {CHANNEL_LABEL[t.channel]}</span>
                    <span>Kategoria: {t.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-dlugomat-600 mb-4">
                    <span>Edytowany: {dateFmt.format(new Date(t.lastEdit))}</span>
                    <span>Uzyc: {numFmt.format(t.usageCount)}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" asChild>
                      <Link href={`/admin/notyfikacje/szablony/${t.id}`}>
                        <Edit3 className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                        Edytuj
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-3.5 w-3.5 mr-1.5" aria-hidden />
                      Duplikuj
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
