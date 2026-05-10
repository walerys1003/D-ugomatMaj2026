import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { Badge } from "@/components/ui/badge";

const FOOTER_GROUPS = [
  {
    title: "Produkt",
    items: [
      { href: "/moduly", label: "Wszystkie moduły" },
      { href: "/jak-to-dziala", label: "Jak to działa" },
      { href: "/cennik", label: "Cennik" },
      { href: "/skaner-nakazu", label: "Skaner nakazu (DARMOWY)" },
      { href: "/kalkulatory", label: "Kalkulatory kwoty wolnej" },
    ],
  },
  {
    title: "Wiedza",
    items: [
      { href: "/baza-wiedzy", label: "Baza wiedzy" },
      { href: "/baza-wiedzy/sprzeciw-od-nakazu-zaplaty-epu", label: "Sprzeciw EPU" },
      { href: "/baza-wiedzy/skarga-na-czynnosci-komornika", label: "Komornik" },
      { href: "/baza-wiedzy/wniosek-o-korekte-bik", label: "BIK" },
    ],
  },
  {
    title: "Firma",
    items: [
      { href: "/o-nas", label: "O nas" },
      { href: "/kontakt", label: "Kontakt" },
      { href: "/changelog", label: "Changelog" },
      { href: "/status", label: "Status systemu" },
      { href: "/program-partnerski", label: "Program partnerski" },
      { href: "/regulamin", label: "Regulamin" },
      { href: "/polityka-prywatnosci", label: "Polityka prywatności" },
      { href: "/rodo", label: "RODO" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-iron-200 bg-iron-50/60 dark:border-dlugomat-800 dark:bg-dlugomat-950">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-sm text-fluid-sm text-iron-600 dark:text-iron-300">
              Tarcza dla osób zadłużonych. Generujemy profesjonalne pisma procesowe
              w kilkanaście minut, zgodnie z polskim prawem.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge tone="info" withDot>
                Dane szyfrowane (AES-256)
              </Badge>
              <Badge tone="success" withDot>
                Zgodne z RODO
              </Badge>
            </div>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h4 className="text-fluid-sm font-semibold uppercase tracking-wide text-iron-500">
                {group.title}
              </h4>
              <ul className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="rounded text-fluid-sm text-iron-700 transition-colors hover:text-dlugomat-700 focus-visible:shadow-shield-focus focus-visible:outline-none dark:text-iron-300 dark:hover:text-white"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 border-t border-iron-200 pt-6 text-fluid-xs text-iron-500 dark:border-dlugomat-800 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Długomat. Wszelkie prawa zastrzeżone.</span>
          <span>
            Długomat nie jest kancelarią prawną — generowane pisma podlegają
            weryfikacji przez użytkownika przed wysyłką.
          </span>
        </div>
      </div>
    </footer>
  );
}
