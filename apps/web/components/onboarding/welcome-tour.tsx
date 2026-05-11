"use client";

import * as React from "react";
import { ArrowRight, CheckCircle2, FileText, ScanLine, Settings, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Tier 29 — Welcome tour for first-time users.
 * Steps through pulpit, kreator, skaner, ustawienia.
 * Persists completion in localStorage (key: `dlugomat:tour:completed`).
 */

interface TourStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  cta?: { label: string; href: string };
}

const STEPS: TourStep[] = [
  {
    title: "Witaj w Długomacie!",
    description:
      "W 3 minuty pokażemy Ci, gdzie znajdziesz najważniejsze narzędzia. Wszystko możesz pominąć i wrócić tu z menu pomocy.",
    icon: Sparkles,
  },
  {
    title: "Nowa sprawa w 60 sekund",
    description:
      "Przejdź do listy spraw → wybierz kreator dopasowany do Twojej sytuacji (sprzeciw EPU, BIK, komornik, ugoda, upadłość). Każdy krok ma podpowiedzi prawne.",
    icon: FileText,
    cta: { label: "Otwórz listę spraw", href: "/panel/sprawy" },
  },
  {
    title: "Skaner nakazu zapłaty",
    description:
      "Zrób zdjęcie pisma, a OCR + AI wyciągną dane, zaproponują strategię i wygenerują pismo procesowe. Idealne pierwsze użycie.",
    icon: ScanLine,
    cta: { label: "Wypróbuj skaner", href: "/panel/skaner" },
  },
  {
    title: "Ustawienia konta",
    description:
      "Włącz MFA, ustaw powiadomienia, podłącz Google Calendar / Microsoft 365 — wszystko w sekcji Ustawienia.",
    icon: Settings,
    cta: { label: "Otwórz ustawienia", href: "/panel/ustawienia" },
  },
  {
    title: "Gotowe — działamy!",
    description:
      "Każde pismo, które wygenerujesz, sprawdza zgodność z prawem (waliduje terminy, sygnatury, podstawy prawne). Sukces!",
    icon: CheckCircle2,
  },
];

const STORAGE_KEY = "dlugomat:tour:completed";
const REMIND_KEY = "dlugomat:tour:remind_at";

export function WelcomeTour() {
  const [open, setOpen] = React.useState(false);
  const [step, setStep] = React.useState(0);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return;
      const remind = localStorage.getItem(REMIND_KEY);
      if (remind && Number(remind) > Date.now()) return;
      // Otwórz po 800ms by nie kolidowac z hydration
      const t = setTimeout(() => setOpen(true), 800);
      return () => clearTimeout(t);
    } catch {
      /* tolerable */
    }
  }, []);

  const close = (completed: boolean) => {
    setOpen(false);
    try {
      if (completed) {
        localStorage.setItem(STORAGE_KEY, "1");
      } else {
        // Przypomnij za 24h
        localStorage.setItem(REMIND_KEY, String(Date.now() + 24 * 3600 * 1000));
      }
    } catch {
      /* tolerable */
    }
  };

  if (!open) return null;
  const current = STEPS[step];
  const Icon = current.icon;
  const isLast = step === STEPS.length - 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-dlugomat-950/70 backdrop-blur-sm p-4"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-dlugomat-900">
        <button
          onClick={() => close(false)}
          aria-label="Zamknij i przypomnij później"
          className="absolute right-3 top-3 rounded-full p-1.5 text-iron-400 hover:bg-iron-100 hover:text-iron-700 dark:hover:bg-dlugomat-800 dark:hover:text-iron-100"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center justify-center bg-dlugomat-50 px-6 py-8 dark:bg-dlugomat-950">
          <div className="rounded-2xl bg-dlugomat-600 p-4 text-white shadow-lg">
            <Icon className="h-8 w-8" />
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between text-fluid-xs">
            <span className="font-semibold uppercase tracking-wider text-dlugomat-600">
              Krok {step + 1} z {STEPS.length}
            </span>
            <div className="flex gap-1">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-6 rounded-full ${
                    i <= step ? "bg-dlugomat-600" : "bg-iron-200 dark:bg-dlugomat-800"
                  }`}
                />
              ))}
            </div>
          </div>

          <h2 id="tour-title" className="text-fluid-xl font-bold text-iron-900 dark:text-white">
            {current.title}
          </h2>
          <p className="text-fluid-base text-iron-600 dark:text-iron-300">{current.description}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => close(false)}>
              Pomiń
            </Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Wstecz
                </Button>
              )}
              {current.cta && (
                <Button asChild variant="outline" size="sm">
                  <a href={current.cta.href}>{current.cta.label}</a>
                </Button>
              )}
              <Button
                size="sm"
                onClick={() => (isLast ? close(true) : setStep((s) => s + 1))}
              >
                {isLast ? "Zaczynamy" : "Dalej"}
                {!isLast && <ArrowRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Helper to manually re-open the tour (e.g., z menu pomocy). */
export function resetWelcomeTour() {
  try {
    localStorage.removeItem("dlugomat:tour:completed");
    localStorage.removeItem("dlugomat:tour:remind_at");
    window.location.reload();
  } catch {
    /* tolerable */
  }
}
