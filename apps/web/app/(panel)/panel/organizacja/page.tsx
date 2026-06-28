import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgSwitcher } from "@/components/orgs/org-switcher";

export const metadata: Metadata = {
  title: "Organizacja | Długomat",
};

const SECTIONS = [
  { href: "/panel/organizacja/zespol", title: "Zespół", desc: "Członkowie, role i zaproszenia" },
  { href: "/panel/organizacja/domeny", title: "Domeny", desc: "Weryfikacja domen i e-maile firmowe" },
  { href: "/panel/organizacja/sso", title: "SSO (SAML / OIDC)", desc: "Logowanie jednokrotne" },
  { href: "/panel/organizacja/scim", title: "SCIM", desc: "Provisioning użytkowników z IdP" },
  { href: "/panel/organizacja/audyt", title: "Audyt", desc: "Logi działań i zmian" },
  { href: "/panel/organizacja/webhooks", title: "Webhooki", desc: "Zdarzenia → Twoje systemy" },
  { href: "/panel/organizacja/billing", title: "Rozliczenia", desc: "Faktury, plan, miejsca" },
];

export default function OrganizacjaPage() {
  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-wider text-ink-500 mb-2">Organizacja</p>
        <h1 className="font-display text-3xl font-semibold text-ink-900 dark:text-ink-50">
          Zarządzanie organizacją
        </h1>
      </div>

      <div className="grid md:grid-cols-[280px_1fr] gap-6">
        <div className="space-y-4">
          <Card elevation="subtle">
            <CardHeader>
              <CardTitle>Aktywna organizacja</CardTitle>
            </CardHeader>
            <CardContent>
              <OrgSwitcher />
            </CardContent>
          </Card>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {SECTIONS.map((s) => (
            <Link key={s.href} href={s.href}>
              <Card
                elevation="subtle"
                className="hover:border-accent-400 transition cursor-pointer h-full"
              >
                <CardHeader>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-ink-600 dark:text-ink-400">{s.desc}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
