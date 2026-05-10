"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Calculator,
  Bell,
  BookOpen,
  MessagesSquare,
  Settings,
  Menu,
  X,
  Search,
  Share2,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV: NavItem[] = [
  { href: "/panel", label: "Pulpit", icon: LayoutDashboard },
  { href: "/panel/sprawy", label: "Sprawy", icon: FileText },
  { href: "/panel/kalkulatory", label: "Kalkulatory", icon: Calculator },
  { href: "/panel/powiadomienia", label: "Powiadomienia", icon: Bell },
  { href: "/panel/baza-wiedzy", label: "Baza wiedzy", icon: BookOpen },
  { href: "/panel/asystent-ai", label: "Asystent AI", icon: MessagesSquare },
  { href: "/panel/polecenia", label: "Polecenia", icon: Share2 },
  { href: "/panel/ustawienia", label: "Ustawienia", icon: Settings },
];

export interface AppShellProps {
  user?: { email?: string | null; name?: string | null } | null;
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const [mobileNav, setMobileNav] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen w-full bg-iron-50/60 dark:bg-dlugomat-950">
      {/* Skip link — wcag 2.4.1 */}
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

        {/* Mobile drawer */}
        {mobileNav ? (
          <div
            className="lg:hidden fixed inset-0 z-50 bg-dlugomat-950/60 backdrop-blur-sm"
            onClick={() => setMobileNav(false)}
            aria-hidden
          >
            <div
              className="absolute inset-y-0 left-0 w-72 max-w-[85%] bg-dlugomat-900 p-4 shadow-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4">
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
              <SidebarNav pathname={pathname} onNavigate={() => setMobileNav(false)} />
            </div>
          </div>
        ) : null}

        <main id="main-content" className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ pathname }: { pathname: string }) {
  return (
    <aside
      aria-label="Nawigacja boczna"
      className="hidden w-64 shrink-0 flex-col border-r border-dlugomat-800 bg-dlugomat-900 text-iron-200 lg:flex"
    >
      <div className="flex h-16 items-center px-6">
        <Link href="/panel" className="rounded-md focus-visible:shadow-shield-focus">
          <Logo className="text-white" />
        </Link>
      </div>
      <SidebarNav pathname={pathname} />
      <div className="mt-auto p-4 text-fluid-xs text-iron-400">
        <p className="font-semibold uppercase tracking-wide text-iron-300">Wsparcie</p>
        <p className="mt-1">pomoc@dlugomat.pl</p>
      </div>
    </aside>
  );
}

function SidebarNav({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex items-center gap-3 rounded-lg px-3 py-2.5",
              "text-fluid-sm font-medium",
              "transition-colors duration-base ease-shield-out",
              "focus-visible:shadow-shield-focus focus-visible:outline-none",
              active
                ? "bg-dlugomat-700 text-white"
                : "text-iron-300 hover:bg-dlugomat-850 hover:text-white"
            )}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                active ? "text-white" : "text-dlugomat-300 group-hover:text-white"
              )}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
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
  const initials = (user?.name || user?.email || "?")
    .trim()
    .slice(0, 1)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-iron-200 bg-background/90 px-4 backdrop-blur-md dark:border-dlugomat-800 dark:bg-dlugomat-950/90 sm:px-6 lg:px-8">
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

      <div className="hidden flex-1 max-w-md md:flex">
        <label htmlFor="topbar-search" className="sr-only">
          Szukaj
        </label>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-iron-400" aria-hidden />
          <Input
            id="topbar-search"
            type="search"
            placeholder="Szukaj sprawy, pisma, terminu…"
            className="pl-9"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Powiadomienia">
          <Bell className="size-5" />
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Menu użytkownika"
              className="bg-dlugomat-100 text-dlugomat-800 hover:bg-dlugomat-200 dark:bg-dlugomat-800 dark:text-iron-100"
            >
              <span className="text-fluid-sm font-semibold">{initials}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{user?.email ?? "Niezalogowany"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/panel/ustawienia">Ustawienia</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/panel/ustawienia/rodo">Eksport danych (RODO)</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/auth/sign-out">Wyloguj</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
