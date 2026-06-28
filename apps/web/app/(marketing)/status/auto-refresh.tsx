"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

interface Props {
  intervalMs: number;
}

/**
 * Tier 5 zad. 244 — Triggerowane refresh statusu co N ms.
 *
 * Wywołuje `router.refresh()` (Next.js 14 RSC) → server-side re-fetchuje
 * dane bez full page reload. Pause przy `document.hidden` (tab w tle).
 */
export function StatusAutoRefresh({ intervalMs }: Props) {
  const router = useRouter();

  React.useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && !document.hidden) {
        router.refresh();
      }
    };
    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
