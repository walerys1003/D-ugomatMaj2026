"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderOpen,
  ScanLine,
  Bot,
  CalendarClock,
  StickyNote,
  Star,
  CreditCard,
  ScrollText,
  PiggyBank,
  Download,
  BookOpen,
  Building2,
  Handshake,
  Share2,
  User2,
  Settings,
  Inbox,
  LifeBuoy,
  History,
  Bell,
  Menu,
  X,
  Search,
  ChevronRight,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Kbd } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * AppShell — kanoniczny shell panelu użytkownika (Tarcza v2).
 *
 * Decyzja IA (post-audit): 29 fizycznych folderów w app/(panel)/panel/* po
 * deduplikacji daje 20 sekcji kanonicznych. Stary shell miał tylko 8 linków
 * w menu — 12 sekcji było UI-nieosiągalnych (martwa nawigacja). Nowa struktura:
 *
 *   PRACA       (6) — codzienne narzędzia: dashboard, sprawy, dokumenty,
 *                     AI, skaner, kalendarz, notatki, ulubione
 *   FINANSE     (4) — moje-zadluzenie, plan-splaty, finanse, eksport
 *   KONTEKST    (5) — baza-orzecznicza, firma/kancelaria, partner, polecenia
 *   KONTO       (5) — profil, ustawienia, wiadomosci, wsparcie, aktywnosc
 *
 * Łącznie 20 pozycji w 4 grupach. Sekcje DEPRECATED:
 *   - /panel/moje-pisma → redirect na /panel/dokumenty (308, Etap 3b)
 *   - /panel/dashboard-v2 → archive, brak w menu (Etap 3b)
 */

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Etykieta dla sekcji nowych/beta */
  pill?: "AI" | "PRO" | "BETA";
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    id: "praca",
    label: "Praca",
    items: [
      { href: "/panel", label: "Pulpit", icon: LayoutDashboard },
      { href: "/panel/sprawy", label: "Sprawy", icon: FolderOpen },
      { href: "/panel/dokumenty", label: "Dokumenty", icon: ScrollText },
      { href: "/panel/ai-asystent", label: "Asystent AI", icon: Bot, pill: "AI" },
      { href: "/panel/skaner", label: "Skaner nakazu", icon: ScanLine },
      { href: "/panel/kalendarz", label: "Kalendarz", icon: CalendarClock },
      { href: "/panel/notatki", label: "Notatki", icon: StickyNote },
      { href: "/panel/ulubione", label: "Ulubione", icon: Star },
    ],
  },
  {
    id: "finanse",
    label: "Finanse",
    items: [
      { href: "/panel/moje-zadluzenie", label: "Moje zadłużenie", icon: PiggyBank },
      { href: "/panel/plan-splaty", label: "Plan spłaty", icon: CreditCard },
      { href: "/panel/finanse", label: "Subskrypcja", icon: CreditCard },
      { href: "/panel/eksport", label: "Eksport danych", icon: Download },
    ],
  },
  {
    id: "kontekst",
    label: "Kontekst",
    items: [
      { href: "/panel/baza-orzecznicza", label: "Baza orzecznicza", icon: BookOpen },
      { href: "/panel/firma", label: "Firma", icon: Building2 },
      { href: "/panel/kancelaria", label: "Kancelaria", icon: Building2 },
      { href: "/panel/partner", label: "Partner", icon: Handshake },
      { href: "/panel/polecenia", label: "Polecenia", icon: Share2 },
    ],
  },
  {
    id: "konto",
    label: "Konto",
    items: [
      { href: "/panel/profil", label: "Profil", icon: User2 },
      { href: "/panel/ustawienia", label: "Ustawienia", icon: Settings },
      { href: "/panel/wiadomosci", label: "Wiadomości", icon: Inbox },
      { href: "/panel/wsparcie", label: "Wsparcie", icon: LifeBuoy },
      { href: "/panel/aktywnosc", label: "Aktywność", icon: History },
    ],
  },
];

export interface AppShellProps {
  user?: { email?: string | null; name?: string | null } | null;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [mobileNav, setMobileNav] = React.useState(false);
  const pathname = usePathname();

  // Zamknij drawer po zmianie ścieżki (UX: nikt nie chce klikać X po nawigacji)
  React.useEffect(() => {
    setMobileNav(false);
  }, [pathname]);

  return (
    <div className="flex min-h-screen w-full bg-ink-50 dark:bg-dlugomat-950">
      <a href="#main-content" className="sr-only sr-focusable">
        Przejdź do treści
      </a>

      <Sidebar pathname={pathname} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          user={user}
          onToggleMobileNav={() => setMobileNav((v) => !v)}
          mobileNavOpen={mobileNav}
        />

        {mobileNav ? (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-ink-950/70 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
            aria-hidden
          >
            <div
              className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-dlugomat-900 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex h-header items-center justify-between border-b border-dlugomat-800 px-4">
                <Logo className="text-white" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-dlugomat-800"
                  onClick={() => setMobileNav(false)}
                  aria-label="Zamknij nawigację"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <SidebarNav pathname={pathname} />
            </div>
          </div>
        ) : null}

        {/* v3: main content z explicit max-w + ink-50 tło, padding 24/32/40 */}
        <main
          id="main-content"
          className="flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10"
        >
          <div className="mx-auto w-full max-w-[1320px]">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside
      aria-label="Nawigacja boczna"
      className="hidden w-sidebar shrink-0 flex-col border-r border-dlugomat-800/80 bg-dlugomat-900 text-ink-700 lg:flex"
    >
      <div className="flex h-header items-center px-5">
        <Link href="/panel" className="rounded-sm focus-visible:shadow-shield-focus">
          <Logo className="text-white" />
        </Link>
      </div>
      <SidebarNav pathname={pathname} />
      <div className="mt-auto border-t border-dlugomat-800/60 p-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-500">
          Wsparcie
        </p>
        <p className="mt-1 text-xs text-ink-600">pomoc@dlugomat.pl</p>
        <p className="mt-0.5 text-xs text-ink-500">Pon–Pt · 9:00–17:00</p>
      </div>
    </aside>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-2.5 py-4">
      {NAV_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-0.5">
          <p className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-500">
            {group.label}
          </p>
          {group.items.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>
      ))}
    </nav>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;
  // Active: exact match LUB prefix (z trailing slash żeby /panel nie matchował /panel/sprawy)
  const active =
    pathname === item.href ||
    (item.href !== "/panel" && pathname.startsWith(item.href + "/"));

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        // v3: tighter (h-8 vs poprzednie h-10), rounded sm, font-medium 13px
        "group relative flex h-8 items-center gap-2.5 rounded-sm px-2.5",
        "text-[13px] font-medium leading-none transition-colors duration-100 ease-out",
        "focus-visible:shadow-shield-focus focus-visible:outline-none",
        active
          ? "bg-dlugomat-700 text-white shadow-[inset_0_0_0_1px_hsl(var(--dlugomat-500)/0.40)]"
          : "text-ink-700 hover:bg-dlugomat-850/60 hover:text-white"
      )}
    >
      <Icon
        className={cn(
          "size-3.5 shrink-0",
          active ? "text-white" : "text-dlugomat-300 group-hover:text-white"
        )}
        aria-hidden
      />
      <span className="flex-1 truncate">{item.label}</span>
      {item.pill ? (
        <span
          className={cn(
            "rounded-xs px-1 py-px text-[9px] font-bold leading-none tracking-wider",
            item.pill === "AI" && "bg-accent-500/20 text-accent-300",
            item.pill === "PRO" && "bg-warn-500/20 text-warn-100",
            item.pill === "BETA" && "bg-dlugomat-500/30 text-dlugomat-100"
          )}
        >
          {item.pill}
        </span>
      ) : null}
    </Link>
  );
}

function Topbar({
  user,
  onToggleMobileNav,
  mobileNavOpen,
}: {
  user?: { email?: string | null; name?: string | null } | null;
  onToggleMobileNav: () => void;
  mobileNavOpen: boolean;
}) {
  const initials = (user?.name || user?.email || "?").trim().slice(0, 1).toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-header items-center gap-3 border-b border-ink-200 bg-background/80 px-4 backdrop-blur-xl backdrop-saturate-150 dark:border-dlugomat-800/80 dark:bg-dlugomat-950/80 sm:px-6 lg:px-8">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        aria-label="Otwórz nawigację"
        aria-expanded={mobileNavOpen}
        onClick={onToggleMobileNav}
      >
        <Menu className="size-5" />
      </Button>

      {/* Search z hint na shortcut — Linear-grade dense input */}
      <div className="hidden flex-1 max-w-md md:flex">
        <label htmlFor="topbar-search" className="sr-only">
          Szukaj
        </label>
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-ink-400" aria-hidden />
          <Input
            id="topbar-search"
            type="search"
            placeholder="Szukaj sprawy, pisma, terminu…"
            className="h-8 pl-8 pr-14 text-sm"
          />
          <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 md:inline-flex">
            <Kbd>⌘K</Kbd>
          </span>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <Button variant="ghost" size="icon" aria-label="Powiadomienia">
          <Bell className="size-4" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menu użytkownika"
              className="ml-1 size-8 rounded-full bg-dlugomat-100 text-dlugomat-800 hover:bg-dlugomat-200 dark:bg-dlugomat-800 dark:text-ink-800"
            >
              <span className="text-xs font-semibold">{initials}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="flex flex-col">
              <span className="text-sm font-medium text-ink-900 dark:text-white">
                {user?.name ?? "Użytkownik"}
              </span>
              {user?.email ? (
                <span className="text-xs text-ink-500">{user.email}</span>
              ) : null}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/panel/profil" className="flex items-center justify-between">
                <span>Profil</span>
                <ChevronRight className="size-3.5 text-ink-400" aria-hidden />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel/ustawienia" className="flex items-center justify-between">
                <span>Ustawienia</span>
                <ChevronRight className="size-3.5 text-ink-400" aria-hidden />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel/eksport" className="flex items-center justify-between">
                <span>Eksport danych (RODO)</span>
                <ChevronRight className="size-3.5 text-ink-400" aria-hidden />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/sign-out">Wyloguj</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
