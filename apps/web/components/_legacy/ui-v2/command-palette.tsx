"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Command as CmdIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * CommandPalette — global Cmd+K / Ctrl+K omnibox.
 * Open via the keyboard shortcut or by mounting <CommandPaletteTrigger />.
 */
export interface CommandItem {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  category?: string;
  hint?: string;
}

const DEFAULT_ITEMS: CommandItem[] = [
  { id: "go-dashboard", label: "Pulpit", href: "/panel", category: "Nawigacja" },
  { id: "go-cases", label: "Moje sprawy", href: "/panel/sprawy", category: "Nawigacja" },
  { id: "go-letters", label: "Moje pisma", href: "/panel/moje-pisma", category: "Nawigacja" },
  { id: "go-debt", label: "Moje zadłużenie", href: "/panel/moje-zadluzenie", category: "Nawigacja" },
  { id: "go-plan", label: "Plan spłaty", href: "/panel/plan-splaty", category: "Nawigacja" },
  { id: "new-case", label: "Nowa sprawa", href: "/panel/sprawy/nowa", category: "Akcje", hint: "Enter" },
  { id: "scan", label: "Zeskanuj nakaz", href: "/panel/skaner", category: "Akcje" },
  { id: "settings", label: "Ustawienia", href: "/panel/ustawienia", category: "Akcje" },
  { id: "support", label: "Wsparcie", href: "/panel/wsparcie", category: "Akcje" },
];

export function CommandPalette({
  items = DEFAULT_ITEMS,
}: {
  items?: CommandItem[];
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK =
        (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (open) {
      setActiveIdx(0);
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      `${it.label} ${it.category ?? ""}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  function onItemKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      const it = filtered[activeIdx];
      if (it?.href) {
        window.location.href = it.href;
      } else if (it?.onSelect) {
        it.onSelect();
      }
      setOpen(false);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Paleta poleceń"
      className="fixed inset-0 z-[200] flex items-start justify-center bg-iron-900/40 p-4 backdrop-blur-sm sm:pt-24"
      onClick={() => setOpen(false)}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl overflow-hidden rounded-xl border border-iron-200 bg-white shadow-pop dark:border-iron-800 dark:bg-iron-950"
      >
        <div className="flex items-center gap-2 border-b border-iron-200 px-4 dark:border-iron-800">
          <Search aria-hidden className="size-4 text-iron-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onItemKeyDown}
            placeholder="Szukaj akcji, spraw, ustawień…"
            className="h-14 flex-1 bg-transparent text-fluid-base outline-none placeholder:text-iron-400"
          />
          <kbd className="hidden rounded border border-iron-200 px-1.5 py-0.5 text-fluid-xs text-iron-500 sm:inline-block dark:border-iron-800">
            ESC
          </kbd>
        </div>
        <ul className="max-h-96 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="p-6 text-center text-fluid-sm text-iron-500">
              Brak wyników dla „{query}”.
            </li>
          ) : (
            filtered.map((it, i) => {
              const active = i === activeIdx;
              return (
                <li key={it.id}>
                  <Link
                    href={it.href ?? "#"}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActiveIdx(i)}
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-fluid-sm",
                      active
                        ? "bg-dlugomat-700 text-white"
                        : "text-iron-700 hover:bg-iron-50 dark:text-iron-200 dark:hover:bg-dlugomat-900",
                    )}
                  >
                    <span className="flex flex-col">
                      <span className="font-semibold">{it.label}</span>
                      {it.category ? (
                        <span
                          className={cn(
                            "text-fluid-xs",
                            active ? "text-white/80" : "text-iron-500",
                          )}
                        >
                          {it.category}
                        </span>
                      ) : null}
                    </span>
                    <ArrowRight className="size-4 opacity-70" />
                  </Link>
                </li>
              );
            })
          )}
        </ul>
        <div className="flex items-center justify-between border-t border-iron-200 bg-iron-50 px-4 py-2 text-fluid-xs text-iron-500 dark:border-iron-800 dark:bg-dlugomat-900">
          <span className="flex items-center gap-2">
            <CmdIcon aria-hidden className="size-3.5" />
            Otwórz z dowolnego miejsca · ↑↓ aby nawigować · Enter aby wybrać
          </span>
          <kbd className="rounded border border-iron-200 px-1.5 py-0.5 dark:border-iron-800">
            ⌘K
          </kbd>
        </div>
      </div>
    </div>
  );
}
