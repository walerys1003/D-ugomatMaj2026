import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Banknote, CalendarCheck, Handshake, Info, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PlanSplatyClient } from "./client";

export const metadata: Metadata = {
  title: "Plan spłaty · Długomat",
  description:
    "Zaproponuj wierzycielowi realny harmonogram spłaty. Kalkulator rat + generator wniosku o rozłożenie na raty.",
};

export default function PlanSplatyPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex flex-col gap-2">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Negocjacje
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Plan spłaty
        </h1>
        <p className="max-w-2xl text-fluid-base text-iron-600 dark:text-iron-300">
          Zaproponuj wierzycielowi rozłożenie należności na raty. Wyliczamy
          realną zdolność miesięczną, generujemy wniosek i monitorujemy
          terminy. Bez kar za zmianę harmonogramu w trakcie.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <PlanSplatyClient />

        <aside className="flex flex-col gap-4">
          <Card elevation="subtle">
            <CardHeader>
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-accent-100 text-accent-700 dark:bg-accent-700/20 dark:text-accent-300"
              >
                <Handshake className="size-5" />
              </span>
              <CardTitle className="mt-2 text-fluid-lg">
                Dlaczego ugoda się opłaca?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-fluid-sm text-iron-600 dark:text-iron-300">
              <Bullet>Zatrzymujemy naliczanie kosztów egzekucji</Bullet>
              <Bullet>Najczęściej redukujemy odsetki o 30–60%</Bullet>
              <Bullet>Otrzymujesz harmonogram w PDF + e-mail do wierzyciela</Bullet>
              <Bullet>Brak wpisu w BIK przy regularnych spłatach</Bullet>
            </CardContent>
          </Card>

          <Card elevation="subtle">
            <CardHeader>
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
              >
                <ShieldCheck className="size-5" />
              </span>
              <CardTitle className="mt-2 text-fluid-lg">
                Co dostajesz?
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-fluid-sm text-iron-600 dark:text-iron-300">
              <FeatureRow
                icon={<Banknote className="size-4" />}
                label="Wniosek o rozłożenie na raty"
              />
              <FeatureRow
                icon={<CalendarCheck className="size-4" />}
                label="Harmonogram PDF z terminami"
              />
              <FeatureRow
                icon={<Info className="size-4" />}
                label="Powiadomienia 3 dni przed ratą"
              />
            </CardContent>
          </Card>

          <Card elevation="subtle" urgency="warning">
            <CardHeader>
              <CardTitle className="text-fluid-base">Pamiętaj</CardTitle>
              <CardDescription>
                Złożenie wniosku o ratalną spłatę nie wstrzymuje terminu
                sprzeciwu od nakazu zapłaty. Najpierw zabezpiecz termin, potem
                negocjuj.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="sm" variant="secondary" block>
                <Link href="/panel/sprawy/nowa">
                  Najpierw sprzeciw
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {/* History placeholder */}
      <section className="flex flex-col gap-3">
        <h2 className="text-fluid-xl font-semibold text-dlugomat-900 dark:text-white">
          Twoje plany spłaty
        </h2>
        <Card elevation="flat" className="border-dashed bg-iron-50/60 dark:bg-dlugomat-900/30">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Badge tone="neutral">Brak zapisanych planów</Badge>
            <p className="max-w-md text-fluid-sm text-iron-600 dark:text-iron-300">
              Po zapisaniu pierwszego planu spłaty pojawi się tu lista z
              terminami rat, statusem akceptacji wierzyciela i bilansem
              pozostałym do spłaty.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-start gap-2">
      <span
        aria-hidden
        className="mt-1 size-1.5 shrink-0 rounded-full bg-accent-500"
      />
      <span>{children}</span>
    </span>
  );
}

function FeatureRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden
        className="grid size-7 place-items-center rounded-md bg-iron-100 text-iron-700 dark:bg-dlugomat-850 dark:text-iron-200"
      >
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
}
