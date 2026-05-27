"use client";

import * as React from "react";
import Link from "next/link";
import { BookOpen, HelpCircle, MessageSquare, Play, X } from "lucide-react";

import { resetWelcomeTour } from "@/components/onboarding/welcome-tour";

/**
 * Tier 29 — Help center floating button.
 * Otwiera panel z linkami do bazy wiedzy, zgłoszenia problemu i powrotem tour.
 */
export function HelpCenter() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Centrum pomocy"
        aria-expanded={open}
        className="fixed bottom-4 right-4 z-40 grid h-12 w-12 place-items-center rounded-full bg-dlugomat-600 text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-dlugomat-300 dark:focus:ring-dlugomat-700"
      >
        {open ? <X className="h-5 w-5" /> : <HelpCircle className="h-5 w-5" />}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Centrum pomocy"
          className="fixed bottom-20 right-4 z-40 w-72 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-2xl dark:border-dlugomat-700 dark:bg-dlugomat-900"
        >
          <div className="border-b border-ink-200 px-4 py-3 dark:border-dlugomat-700">
            <h3 className="text-fluid-sm font-semibold text-ink-900 dark:text-white">
              Potrzebujesz pomocy?
            </h3>
            <p className="text-fluid-xs text-ink-500">Wybierz, jak możemy pomóc.</p>
          </div>
          <ul className="flex flex-col py-2">
            <li>
              <Link
                href="/baza-wiedzy"
                className="flex items-center gap-3 px-4 py-2 text-fluid-sm hover:bg-ink-50 dark:hover:bg-dlugomat-800"
              >
                <BookOpen className="h-4 w-4 text-dlugomat-600" />
                Baza wiedzy
              </Link>
            </li>
            <li>
              <button
                onClick={resetWelcomeTour}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-fluid-sm hover:bg-ink-50 dark:hover:bg-dlugomat-800"
              >
                <Play className="h-4 w-4 text-dlugomat-600" />
                Pokaż tour ponownie
              </button>
            </li>
            <li>
              <Link
                href="/kontakt"
                className="flex items-center gap-3 px-4 py-2 text-fluid-sm hover:bg-ink-50 dark:hover:bg-dlugomat-800"
              >
                <MessageSquare className="h-4 w-4 text-dlugomat-600" />
                Skontaktuj się z nami
              </Link>
            </li>
          </ul>
          <div className="border-t border-ink-200 px-4 py-2 text-fluid-xs text-ink-400 dark:border-dlugomat-700">
            Średni czas odpowiedzi: <strong>4h</strong> w dni robocze
          </div>
        </div>
      )}
    </>
  );
}
