// Responsive helpers — breakpoint matching, device detection, safe-area insets.

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

export function matchesBreakpoint(bp: Breakpoint): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(`(min-width: ${BREAKPOINTS[bp]}px)`).matches;
}

export function detectDevice(): "mobile" | "tablet" | "desktop" {
  if (typeof window === "undefined") return "desktop";
  const w = window.innerWidth;
  if (w < BREAKPOINTS.md) return "mobile";
  if (w < BREAKPOINTS.lg) return "tablet";
  return "desktop";
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function safeAreaInsets(): { top: number; right: number; bottom: number; left: number } {
  if (typeof window === "undefined" || typeof getComputedStyle === "undefined") {
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }
  const root = document.documentElement;
  const cs = getComputedStyle(root);
  const px = (v: string) => parseInt(v.replace("px", ""), 10) || 0;
  return {
    top: px(cs.getPropertyValue("--sat") || cs.getPropertyValue("env(safe-area-inset-top)") || "0"),
    right: px(cs.getPropertyValue("--sar") || "0"),
    bottom: px(cs.getPropertyValue("--sab") || "0"),
    left: px(cs.getPropertyValue("--sal") || "0"),
  };
}

// Subscribe to viewport changes — returns unsubscriber.
export function onViewportChange(handler: (info: { width: number; height: number; device: ReturnType<typeof detectDevice> }) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const emit = () => handler({ width: window.innerWidth, height: window.innerHeight, device: detectDevice() });
  emit();
  window.addEventListener("resize", emit);
  window.addEventListener("orientationchange", emit);
  return () => {
    window.removeEventListener("resize", emit);
    window.removeEventListener("orientationchange", emit);
  };
}
