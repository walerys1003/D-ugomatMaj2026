import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="container py-20 sm:py-24">
      <div className="tarcza-hero-gradient relative overflow-hidden rounded-2xl px-6 py-12 sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-12 right-[-10%] h-72 w-72 rounded-full bg-accent-500/15 blur-3xl"
        />
        <div className="relative mx-auto max-w-2xl text-center text-white">
          <h2 className="text-balance text-fluid-3xl font-bold tracking-tight text-white sm:text-fluid-4xl">
            Masz 14 dni? My potrzebujemy 12 minut.
          </h2>
          <p className="mt-3 text-fluid-base text-iron-200">
            Zacznij od darmowego skanera. Bez zakładania konta. Bez podawania kart.
            Sprawdzimy Twoją sytuację i powiemy co masz zrobić jako pierwsze.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="success">
              <Link href="/skaner-nakazu">
                Zeskanuj nakaz
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <Link href="/jak-to-dziala">Zobacz demo</Link>
            </Button>
          </div>
          <p className="mt-4 text-fluid-xs text-iron-300">
            Długomat nie jest kancelarią prawną. Pisma weryfikujesz przed wysyłką.
          </p>
        </div>
      </div>
    </section>
  );
}
