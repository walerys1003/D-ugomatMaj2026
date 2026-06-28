"use client";

import * as React from "react";
import Link from "next/link";
import { Sparkles, X } from "lucide-react";

import { getLatestRelease } from "@/lib/launch/release-notes";

/**
 * Tier 31 — Release banner.
 * Pokazuje top-bar banner przy każdym nowym release, dopóki user go nie zamknie.
 * Persistuje w localStorage (key: `dlugomat:banner_dismissed:<version>`).
 */
export function ReleaseBanner() {
  const release = getLatestRelease();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = `dlugomat:banner_dismissed:${release.version}`;
      if (localStorage.getItem(key) !== "1") setVisible(true);
    } catch {
      /* tolerable */
    }
  }, [release.version]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(`dlugomat:banner_dismissed:${release.version}`, "1");
    } catch {
      /* tolerable */
    }
  };

  if (!visible) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 bg-dlugomat-600 px-4 py-2 text-fluid-xs text-white sm:text-fluid-sm">
      <Sparkles className="h-4 w-4 shrink-0" />
      <span className="hidden sm:inline">
        Nowość {release.version} — {release.highlights[0]}.{" "}
      </span>
      <span className="sm:hidden">Nowa wersja: {release.version}.</span>
      <Link href="/changelog" className="underline underline-offset-2 hover:opacity-90">
        Zobacz changelog →
      </Link>
      <button
        onClick={dismiss}
        aria-label="Zamknij baner"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
