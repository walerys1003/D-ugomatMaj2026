import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * CtaBand v2 - premium minimalist (Design System Tarcza)
 * Bez gradient tarcza-hero, bez bouncy blur. Card pop z urgency warning.
 */
export function CtaBand() {
  return (
    <section className="bg-white py-20">
      <div className="container px-6">
        <Card elevation="pop" urgency="warning" className="overflow-hidden">
          <div className="grid gap-8 p-10 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:p-14">
            <div>
              <Badge tone="warning" withDot>
                14 dni na sprzeciw
              </Badge>
              <h2 className="mt-4 font-display text-3xl text-dlugomat-900 sm:text-4xl">
                Masz 14 dni? My potrzebujemy 12 minut.
              </h2>
              <p className="mt-4 max-w-xl text-sm text-dlugomat-600">
                Zacznij od darmowego skanera. Bez zakladania konta. Bez podawania karty.
                Sprawdzimy Twoja sytuacje i powiemy co masz zrobic jako pierwsze.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" variant="primary">
                  <Link href="/skaner-nakazu">Zeskanuj nakaz</Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/jak-to-dziala">Zobacz demo</Link>
                </Button>
              </div>
              <p className="mt-4 font-mono text-xs text-dlugomat-500">
                Dlugomat nie jest kancelaria prawna. Pisma weryfikujesz przed wysylka.
              </p>
            </div>

            <ul className="grid gap-3 rounded-md bg-dlugomat-50 p-5 text-sm">
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span className="text-dlugomat-700">Skaner OCR analizuje nakaz w 90 sekund</span>
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span className="text-dlugomat-700">Ocena przedawnienia z odwolaniem do KC i orzecznictwa SN</span>
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span className="text-dlugomat-700">Sugestia kolejnego kroku - bez konta i bez karty</span>
              </li>
              <li className="flex items-start gap-3">
                <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-500" />
                <span className="text-dlugomat-700">Twoje dane szyfrowane AES-256, przechowywane w UE</span>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </section>
  );
}
