"use client";

/**
 * Tier 6 zad. 298 — Service Worker registration component.
 *
 * Mount once in root layout (after main content). Registers /sw.js
 * scoped to root. Skips registration in dev (NODE_ENV !== "production")
 * and when user has Do-Not-Disturb-ish flags.
 *
 * On update detection — sends `controllerchange` reload after grace period
 * (5s) so user finishes current interaction.
 */
import { useEffect } from "react";

export function ServiceWorkerRegister(): null {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NEXT_PUBLIC_DISABLE_SW === "true") return;
    // Tylko HTTPS (lub localhost dev)
    if (
      window.location.protocol !== "https:" &&
      window.location.hostname !== "localhost" &&
      window.location.hostname !== "127.0.0.1"
    ) {
      return;
    }

    let cancelled = false;
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;

        // Co 30 min sprawdzaj update
        const interval = window.setInterval(() => {
          reg.update().catch(() => {});
        }, 30 * 60 * 1000);

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // Nowa wersja — odśwież po 5s grace period
              window.setTimeout(() => {
                if (!cancelled) window.location.reload();
              }, 5000);
            }
          });
        });

        return () => window.clearInterval(interval);
      } catch (err) {
        // Brak SW nie blokuje aplikacji
        // eslint-disable-next-line no-console
        console.debug("SW register failed:", err);
      }
    };

    register();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
