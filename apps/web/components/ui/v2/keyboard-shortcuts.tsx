"use client";

import * as React from "react";
import { Keyboard, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * KeyboardShortcutsOverlay — full-screen modal showing app-wide shortcuts.
 * Toggle with `?` (Shift + /), close with Escape or backdrop click.
 */

type Shortcut = { keys: string[]; label: string };

const SHORTCUTS: { group: string; items: Shortcut[] }[] = [
  {
    group: "Globalne",
    items: [
      { keys: ["⌘", "K"], label: "Paleta poleceń" },
      { keys: ["?"], label: "Pokaż skróty klawiaturowe" },
      { keys: ["G", "P"], label: "Przejdź na pulpit" },
      { keys: ["G", "S"], label: "Przejdź do spraw" },
      { keys: ["G", "U"], label: "Przejdź do ustawień" },
    ],
  },
  {
    group: "Sprawy",
    items: [
      { keys: ["N"], label: "Nowa sprawa" },
      { keys: ["S"], label: "Zeskanuj nakaz" },
      { keys: ["E"], label: "Edytuj bieżącą sprawę" },
      { keys: ["/", "F"], label: "Filtruj listę" },
    ],
  },
  {
    group: "Edytor pism",
    items: [
      { keys: ["⌘", "Enter"], label: "Wygeneruj pismo" },
      { keys: ["⌘", "S"], label: "Zapisz szkic" },
      { keys: ["⌘", "Shift", "P"], label: "Pobierz PDF" },
    ],
  },
];

export function KeyboardShortcutsOverlay() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement | null)?.tagName ?? "";
      const editing = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);
      if (e.key === "?" && !editing) {
        e.preventDefault();
        setOpen(true);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Skróty klawiaturowe"
      className="fixed inset-0 z-[180] flex items-center justify-center bg-iron-900/50 p-4 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-3xl rounded-xl border border-iron-200 bg-white shadow-pop dark:border-iron-800 dark:bg-iron-950"
      >
        <header className="flex items-center justify-between border-b border-iron-200 px-5 py-3 dark:border-iron-800">
          <div className="flex items-center gap-2">
            <Keyboard aria-hidden className="size-4 text-dlugomat-600" />
            <h2 className="text-fluid-lg font-semibold text-iron-900 dark:text-iron-50">
              Skróty klawiaturowe
            </h2>
          </div>
          <button
            type="button"
            aria-label="Zamknij"
            onClick={() => setOpen(false)}
            className="rounded p-1 text-iron-500 hover:bg-iron-100 focus-visible:outline-none focus-visible:shadow-shield-focus dark:hover:bg-dlugomat-900"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="grid gap-6 p-5 sm:grid-cols-2 lg:grid-cols-3">
          {SHORTCUTS.map((g) => (
            <section key={g.group} className="flex flex-col gap-2">
              <h3 className="text-fluid-xs font-semibold uppercase tracking-wider text-iron-500">
                {g.group}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {g.items.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-fluid-sm text-iron-700 dark:text-iron-200">
                      {s.label}
                    </span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <kbd
                          key={`${k}-${i}`}
                          className={cn(
                            "min-w-[1.5rem] rounded border border-iron-200 bg-iron-50 px-1.5 py-0.5 text-center font-mono text-fluid-xs text-iron-700",
                            "dark:border-iron-800 dark:bg-dlugomat-900 dark:text-iron-200",
                          )}
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
        <footer className="border-t border-iron-200 bg-iron-50 px-5 py-2 text-fluid-xs text-iron-500 dark:border-iron-800 dark:bg-dlugomat-900">
          Naciśnij{" "}
          <kbd className="rounded border border-iron-200 px-1 dark:border-iron-800">
            ESC
          </kbd>
          , aby zamknąć.
        </footer>
      </div>
    </div>
  );
}
