import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, CreditCard, KeyRound, Link2, Lock, ShieldCheck, Smartphone, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const metadata: Metadata = {
  title: "Ustawienia · Długomat",
  robots: { index: false, follow: false },
};

interface SettingTile {
  href: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeTone?: "info" | "warning" | "neutral" | "success";
}

const TILES: SettingTile[] = [
  {
    href: "/panel/ustawienia/profil",
    title: "Profil",
    description: "Imię, nazwisko, dane kontaktowe, język interfejsu.",
    icon: User,
  },
  {
    href: "/panel/ustawienia/powiadomienia",
    title: "Powiadomienia",
    description: "Email, SMS, push — wybierz kanały i częstotliwość.",
    icon: Bell,
  },
  {
    href: "/panel/ustawienia/bezpieczenstwo",
    title: "Bezpieczeństwo (MFA)",
    description: "TOTP, kody zapasowe, klucze WebAuthn / Passkey.",
    icon: ShieldCheck,
    badge: "Zalecane",
    badgeTone: "warning",
  },
  {
    href: "/panel/ustawienia/sesje",
    title: "Aktywne sesje",
    description: "Przeglądaj zalogowane urządzenia i wyloguj zdalnie.",
    icon: Smartphone,
  },
  {
    href: "/panel/ustawienia/api-keys",
    title: "Klucze API",
    description: "Wygeneruj tokeny dla integracji z SDK / Zapier / Make.",
    icon: KeyRound,
  },
  {
    href: "/panel/ustawienia/platnosci",
    title: "Płatności i subskrypcja",
    description: "Faktury VAT-PL, plan, historia transakcji.",
    icon: CreditCard,
  },
  {
    href: "/panel/ustawienia/integracje",
    title: "Integracje",
    description: "Google, Microsoft 365, Slack, Notion, Fakturownia.",
    icon: Link2,
  },
  {
    href: "/panel/ustawienia/rodo",
    title: "Twoje dane (RODO)",
    description: "Eksport, prawo do usunięcia, zgody marketingowe.",
    icon: Lock,
  },
];

export default async function SettingsHomePage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/sign-in?next=/panel/ustawienia");

  // Sprawdź czy MFA jest aktywne dla tile-badge
  let mfaEnabled = false;
  try {
    const { data: mfa } = await supabase
      .from("mfa_secrets")
      .select("verified")
      .eq("user_id", user.id)
      .maybeSingle();
    mfaEnabled = !!mfa?.verified;
  } catch {
    /* tolerable */
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="flex flex-col gap-1">
        <p className="text-fluid-sm font-semibold uppercase tracking-wider text-dlugomat-600">
          Ustawienia
        </p>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-ink-900 dark:text-white">
          Twoje konto
        </h1>
        <p className="text-fluid-base text-ink-600 dark:text-ink-300">
          Zarządzaj profilem, bezpieczeństwem i integracjami.
        </p>
        <p className="mt-1 text-fluid-sm text-ink-500">
          Zalogowany jako <span className="font-medium">{user.email}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TILES.map((tile) => {
          const showSecurityBadge = tile.href.includes("bezpieczenstwo");
          const effectiveBadge = showSecurityBadge
            ? mfaEnabled
              ? "MFA aktywne"
              : "Zalecane"
            : tile.badge;
          const effectiveTone: SettingTile["badgeTone"] = showSecurityBadge
            ? mfaEnabled
              ? "success"
              : "warning"
            : tile.badgeTone;
          return (
            <Link
              key={tile.href}
              href={tile.href}
              className="group rounded-2xl border border-ink-200 bg-white p-5 transition-colors hover:border-dlugomat-300 hover:shadow-sm dark:border-dlugomat-800 dark:bg-dlugomat-900 dark:hover:border-dlugomat-600"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-lg bg-dlugomat-50 p-2 text-dlugomat-700 dark:bg-dlugomat-800 dark:text-dlugomat-300">
                  <tile.icon className="h-5 w-5" />
                </div>
                {effectiveBadge && (
                  <Badge tone={effectiveTone ?? "neutral"} withDot>
                    {effectiveBadge}
                  </Badge>
                )}
              </div>
              <h2 className="mt-3 text-fluid-lg font-semibold text-ink-900 dark:text-white">{tile.title}</h2>
              <p className="mt-1 text-fluid-sm text-ink-600 dark:text-ink-300">{tile.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
