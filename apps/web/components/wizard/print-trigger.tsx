"use client";

import { useEffect } from "react";

/**
 * Sticky button + auto-trigger dla strony print.
 *
 * - klik: wywołuje window.print()
 * - opcjonalnie: po pierwszym pełnym renderze ustawiamy focus, by Ctrl+P
 *   i Enter działały bez dodatkowego kliknięcia.
 */
export function PrintTrigger({ autoFocus = true }: { autoFocus?: boolean }) {
  useEffect(() => {
    if (autoFocus) {
      const btn = document.getElementById("dlugomat-print-btn");
      btn?.focus();
    }
  }, [autoFocus]);

  return (
    <button
      id="dlugomat-print-btn"
      type="button"
      onClick={() => window.print()}
      style={{
        background: "#0c1422",
        color: "#fff",
        border: 0,
        borderRadius: 6,
        padding: "6px 14px",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      Zapisz jako PDF
    </button>
  );
}
