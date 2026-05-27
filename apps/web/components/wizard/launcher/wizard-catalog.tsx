"use client";

/**
 * Tier 26 — Wizard Launcher Catalog.
 *
 * Klient-side wzbogacenie /panel/sprawy/nowa:
 *   - search box (filter by name/description)
 *   - filter by module (D2..D16)
 *   - filter by status (live / beta / planned)
 *   - sort by name | price | deadline
 *   - sticky filters bar
 *
 * Zachowuje serwerowe `startCaseAction` przez ukryty form per card.
 */
import { useMemo, useState } from "react";
import Link from "next/link";

interface CatalogItem {
  type: string;
  module: string;
  shortTitle: string;
  description: string;
  priceGrosze: number;
  status: "live" | "beta" | "planned";
  deadlineDays: number | null;
}

interface Props {
  items: CatalogItem[];
  modules: { id: string; title: string; tagline: string; status: "live" | "beta" | "planned" }[];
  /** Server action exposed to the form. */
  startAction?: string;
  csrfToken?: string;
}

type SortKey = "name" | "price" | "deadline";

export function WizardCatalog({ items, modules, csrfToken }: Props) {
  const [query, setQuery] = useState("");
  const [module, setModule] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "live" | "beta" | "planned">("all");
  const [sort, setSort] = useState<SortKey>("name");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let arr = items.filter((it) => {
      if (module !== "all" && it.module !== module) return false;
      if (status !== "all" && it.status !== status) return false;
      if (!q) return true;
      return (
        it.shortTitle.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.type.toLowerCase().includes(q)
      );
    });
    arr = [...arr].sort((a, b) => {
      if (sort === "price") return a.priceGrosze - b.priceGrosze;
      if (sort === "deadline") {
        const da = a.deadlineDays ?? 9999;
        const db = b.deadlineDays ?? 9999;
        return da - db;
      }
      return a.shortTitle.localeCompare(b.shortTitle, "pl");
    });
    return arr;
  }, [items, query, module, status, sort]);

  const total = items.length;
  const shown = filtered.length;

  return (
    <div className="space-y-6">
      {/* Filters bar */}
      <div className="sticky top-2 z-10 rounded-xl border border-ink-200 dark:border-dlugomat-800 bg-white/95 dark:bg-dlugomat-900/95 backdrop-blur p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
        <label className="flex flex-col gap-1 text-xs md:col-span-4">
          <span className="font-medium text-ink-600 dark:text-ink-300">
            Szukaj
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="np. komornik, sprzeciw, BIK..."
            className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-xs md:col-span-3">
          <span className="font-medium text-ink-600 dark:text-ink-300">Moduł</span>
          <select
            value={module}
            onChange={(e) => setModule(e.target.value)}
            className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent text-sm"
          >
            <option value="all">Wszystkie</option>
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.title}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs md:col-span-2">
          <span className="font-medium text-ink-600 dark:text-ink-300">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent text-sm"
          >
            <option value="all">Wszystkie</option>
            <option value="live">Dostępne</option>
            <option value="beta">Beta</option>
            <option value="planned">Wkrótce</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs md:col-span-2">
          <span className="font-medium text-ink-600 dark:text-ink-300">Sortuj</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="rounded-md border border-ink-300 dark:border-dlugomat-700 px-3 h-10 bg-transparent text-sm"
          >
            <option value="name">Alfabetycznie</option>
            <option value="price">Po cenie</option>
            <option value="deadline">Po terminie</option>
          </select>
        </label>
        <div className="md:col-span-1 text-xs text-ink-600 dark:text-ink-300 text-right">
          {shown}/{total}
        </div>
      </div>

      {/* Results grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-300 dark:border-dlugomat-700 p-8 text-center text-ink-500">
          <p className="text-lg font-medium">Brak wyników</p>
          <p className="text-sm mt-1">
            Spróbuj zmienić filtry lub{" "}
            <Link href="/panel/skaner" className="text-dlugomat-600 hover:underline">
              wgraj skan
            </Link>{" "}
            — podpowiemy moduł.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((it) => (
            <CatalogCard key={it.type} item={it} csrfToken={csrfToken} />
          ))}
        </div>
      )}
    </div>
  );
}

function CatalogCard({
  item,
  csrfToken,
}: {
  item: CatalogItem;
  csrfToken?: string;
}) {
  const isLive = item.status === "live";
  const price =
    item.priceGrosze === 0
      ? "Bezpłatnie"
      : new Intl.NumberFormat("pl-PL", {
          style: "currency",
          currency: "PLN",
        }).format(item.priceGrosze / 100);
  return (
    <div
      className={
        "rounded-xl border border-ink-200 dark:border-dlugomat-800 bg-white dark:bg-dlugomat-900 p-4 flex flex-col gap-3 " +
        (isLive ? "transition hover:shadow-lg" : "opacity-70")
      }
    >
      <header className="flex items-start justify-between gap-2">
        <h3 className="font-serif text-base font-semibold text-ink-900 dark:text-ink-50">
          {item.shortTitle}
        </h3>
        <span
          className={
            "shrink-0 px-2 py-0.5 rounded text-[10px] font-bold uppercase " +
            (isLive
              ? "bg-accent-100 text-accent-800"
              : item.status === "beta"
              ? "bg-warn-100 text-warn-800"
              : "bg-ink-100 text-ink-700")
          }
        >
          {item.module}
        </span>
      </header>
      <p className="text-sm text-ink-600 dark:text-ink-300 line-clamp-2 grow">
        {item.description}
      </p>
      <div className="flex items-end justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-sm font-medium tabular-nums">{price}</span>
          {item.deadlineDays && (
            <span className="text-[11px] text-ink-500">
              termin: {item.deadlineDays} dni
            </span>
          )}
        </div>
        {isLive ? (
          <form action="/api/cases/start" method="POST">
            {csrfToken && <input type="hidden" name="csrf" value={csrfToken} />}
            <input type="hidden" name="type" value={item.type} />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-md bg-dlugomat-700 text-white text-sm font-semibold hover:bg-dlugomat-800 transition"
            >
              Rozpocznij →
            </button>
          </form>
        ) : (
          <span className="text-xs text-ink-500 italic">Wkrótce</span>
        )}
      </div>
    </div>
  );
}
