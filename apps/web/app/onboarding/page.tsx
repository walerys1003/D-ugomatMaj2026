import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Onboarding - pierwsze kroki | Dlugomat",
  description: "Onboarding nowego uzytkownika Dlugomat. Pierwsze kroki w platformie.",
};

const steps = [
  { num: 1, title: "Zweryfikuj swoja tozsamosc", description: "Potwierdz swoje dane przez profil zaufany lub mojeID. To zajmie ok. 2 minut.", done: true },
  { num: 2, title: "Wybierz typ konta", description: "Konto dluznika, firmy lub kancelarii prawnej. Mozesz to zmienic w ustawieniach.", done: true },
  { num: 3, title: "Dodaj dokumenty referencyjne", description: "Wyslij skan dowodu, ostatniej decyzji procesowej lub umowy. AI przeanalizuje sytuacje.", done: false },
  { num: 4, title: "Wybierz plan", description: "Free, Premium, Business lub Enterprise - mozesz zaczac od planu darmowego i zmienic pozniej.", done: false },
  { num: 5, title: "Skonfiguruj powiadomienia", description: "Wybierz kanaly powiadomien (email, SMS, push) i czestotliwosc.", done: false },
  { num: 6, title: "Zaproszenie zespolu (opcjonalnie)", description: "Dodaj kolegow z firmy lub kancelarii - mozesz to zrobic w kazdym momencie.", done: false },
];

const completed = steps.filter((s) => s.done).length;
const progress = Math.round((completed / steps.length) * 100);

export default function OnboardingPage() {
  return (
    <div className="space-y-8 px-6 py-8 lg:px-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <Badge tone="info" withDot>
            Onboarding
          </Badge>
          <h1 className="font-display text-3xl text-dlugomat-900">Witaj w Dlugomat</h1>
          <p className="max-w-2xl text-sm text-dlugomat-600">
            Skonfigurujmy razem Twoje konto. Caly proces zajmie okolo 8 minut i mozesz wrocic do niego
            w dowolnym momencie. Zacznij od miejsca, w ktorym jestes.
          </p>
        </div>
        <div className="rounded-md bg-white p-4 ring-1 ring-dlugomat-100">
          <p className="text-xs uppercase tracking-wide text-dlugomat-500">Postep</p>
          <p className="mt-1 font-display text-2xl text-dlugomat-900">{progress}%</p>
          <div
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-2 h-2 w-32 overflow-hidden rounded-full bg-dlugomat-100"
          >
            <div className="h-full rounded-full bg-accent-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <ol aria-label="Kroki onboardingu" className="space-y-4">
        {steps.map((step) => (
          <li key={step.num}>
            <Card
              elevation="subtle"
              urgency={!step.done && step.num === completed + 1 ? "warning" : "none"}
              className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center"
            >
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-display text-lg ${
                  step.done
                    ? "bg-accent-100 text-accent-700"
                    : step.num === completed + 1
                      ? "bg-warn/10 text-warn"
                      : "bg-dlugomat-100 text-dlugomat-500"
                }`}
                aria-hidden
              >
                {step.done ? "OK" : step.num}
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg text-dlugomat-900">{step.title}</h2>
                <p className="mt-1 text-sm text-dlugomat-600">{step.description}</p>
              </div>
              {step.done ? (
                <Badge tone="success">ukonczone</Badge>
              ) : step.num === completed + 1 ? (
                <Button variant="primary" size="md">
                  Kontynuuj
                </Button>
              ) : (
                <Badge tone="neutral">oczekuje</Badge>
              )}
            </Card>
          </li>
        ))}
      </ol>

      <Card elevation="subtle" className="p-6">
        <h2 className="font-display text-lg text-dlugomat-900">Potrzebujesz pomocy?</h2>
        <p className="mt-2 text-sm text-dlugomat-600">
          Mozesz w kazdym momencie skontaktowac sie z naszym zespolem wsparcia lub umowic rozmowe ze specjalista.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="secondary" size="md" asChild>
            <Link href="/panel/wsparcie">Centrum pomocy</Link>
          </Button>
          <Button variant="ghost" size="md" asChild>
            <Link href="/kontakt">Umow rozmowe</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
