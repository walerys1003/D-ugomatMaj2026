"use client";

import * as React from "react";
import { Megaphone, X } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Tier 29 — AnnouncementBar (top-of-page).
 * Reusable banner dla onboardingu / promocji / informacji o przerwie technicznej.
 */

interface Props {
  id: string;
  message: React.ReactNode;
  cta?: { label: string; href: string };
  tone?: "info" | "warning" | "success";
  dismissable?: boolean;
  className?: string;
}

const TONE_CLASSES: Record<NonNullable<Props["tone"]>, string> = {
  info: "bg-dlugomat-600 text-white",
  warning: "bg-amber-500 text-white",
  success: "bg-emerald-600 text-white",
};

export function AnnouncementBar({
  id,
  message,
  cta,
  tone = "info",
  dismissable = true,
  className,
}: Props) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const key = `dlugomat:bar_dismissed:${id}`;
      if (localStorage.getItem(key) !== "1") setVisible(true);
    } catch {
      setVisible(true);
    }
  }, [id]);

  const dismiss = () => {
    setVisible(false);
    try {
      localStorage.setItem(`dlugomat:bar_dismissed:${id}`, "1");
    } catch {
      /* tolerable */
    }
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Komunikat informacyjny"
      className={cn(
        "relative flex items-center justify-center gap-3 px-4 py-2 text-fluid-xs sm:text-fluid-sm",
        TONE_CLASSES[tone],
        className,
      )}
    >
      <Megaphone className="h-4 w-4 shrink-0" aria-hidden />
      <span className="text-center">{message}</span>
      {cta && (
        <a href={cta.href} className="underline underline-offset-2 hover:opacity-90">
          {cta.label} →
        </a>
      )}
      {dismissable && (
        <button
          onClick={dismiss}
          aria-label="Zamknij baner"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-white/10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
