// Focus trap — keeps Tab/Shift+Tab cycling inside a modal/dialog container.
// Returns a deactivator that restores prior focus.

const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

export function activateFocusTrap(container: HTMLElement): () => void {
  if (typeof document === "undefined") return () => {};
  const prevActive = document.activeElement as HTMLElement | null;

  const focusable = () =>
    Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.hasAttribute("aria-hidden") && el.offsetParent !== null);

  // Initial focus on first focusable.
  const first = focusable()[0];
  first?.focus();

  const handler = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const items = focusable();
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const idx = items.indexOf(document.activeElement as HTMLElement);
    if (e.shiftKey && (idx <= 0)) {
      e.preventDefault();
      items[items.length - 1].focus();
    } else if (!e.shiftKey && idx === items.length - 1) {
      e.preventDefault();
      items[0].focus();
    }
  };

  container.addEventListener("keydown", handler);
  return () => {
    container.removeEventListener("keydown", handler);
    prevActive?.focus?.();
  };
}

// ARIA live region announcer — single shared element for "screen reader" updates.
let liveRegion: HTMLElement | null = null;

export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  if (typeof document === "undefined") return;
  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.setAttribute("role", "status");
    Object.assign(liveRegion.style, {
      position: "absolute",
      width: "1px",
      height: "1px",
      padding: "0",
      margin: "-1px",
      overflow: "hidden",
      clip: "rect(0,0,0,0)",
      whiteSpace: "nowrap",
      border: "0",
    });
    document.body.appendChild(liveRegion);
  }
  liveRegion.setAttribute("aria-live", priority);
  // Clear-and-set to force re-announcement of identical strings.
  liveRegion.textContent = "";
  setTimeout(() => { if (liveRegion) liveRegion.textContent = message; }, 50);
}

// Check whether the user has reduced-motion preference.
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

// High-contrast helper — toggles a body class.
export function setHighContrast(on: boolean): void {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("hc", on);
}
