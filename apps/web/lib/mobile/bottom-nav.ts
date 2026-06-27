// Bottom navigation config — 5-slot mobile nav with badge + active state model.

export interface BottomNavItem {
  id: string;
  label: string;
  href: string;
  iconName: string; // lucide-react icon name
  badge?: number | "dot";
  match: (path: string) => boolean;
}

export const DEFAULT_BOTTOM_NAV: BottomNavItem[] = [
  { id: "home", label: "Start", href: "/dashboard", iconName: "Home", match: (p) => p === "/dashboard" || p === "/" },
  { id: "cases", label: "Sprawy", href: "/cases", iconName: "Briefcase", match: (p) => p.startsWith("/cases") },
  { id: "scan", label: "Skanuj", href: "/scan", iconName: "Camera", match: (p) => p.startsWith("/scan") },
  { id: "deadlines", label: "Terminy", href: "/deadlines", iconName: "Clock", match: (p) => p.startsWith("/deadlines") },
  { id: "more", label: "Więcej", href: "/more", iconName: "Menu", match: (p) => p.startsWith("/more") || p.startsWith("/settings") },
];

export function findActiveItem(items: BottomNavItem[], pathname: string): BottomNavItem | null {
  return items.find((i) => i.match(pathname)) ?? null;
}

// Haptic feedback — best-effort, no-op on platforms without Vibration API.
export function haptic(pattern: number | number[] = 10): void {
  if (typeof navigator === "undefined") return;
  try { navigator.vibrate?.(pattern); } catch { /* no-op */ }
}
