/**
 * Trust bar v2 — premium minimalist row with verification proofs.
 *
 * Zamiast logotypów-placeholderów pokazujemy weryfikowalne wskaźniki:
 * GDPR (UODO), partnerzy prawniczy, bank-grade encryption, status.
 */
import Link from "next/link";
import { ShieldCheck, Lock, ScrollText, Activity } from "lucide-react";

interface TrustItem {
  icon: typeof ShieldCheck;
  title: string;
  desc: string;
  href?: string;
}

const ITEMS: TrustItem[] = [
  {
    icon: ShieldCheck,
    title: "RODO compliant",
    desc: "Polityka prywatności i DPA dostępne online",
    href: "/rodo",
  },
  {
    icon: Lock,
    title: "Szyfrowanie AES-256",
    desc: "Dane w spoczynku i w tranzycie — bank-grade",
  },
  {
    icon: ScrollText,
    title: "Pisma na podstawie KC/KPC",
    desc: "Każdy szablon z cytowaniem podstawy prawnej",
    href: "/precedensy",
  },
  {
    icon: Activity,
    title: "99,95% SLA",
    desc: "Status systemu publiczny i transparentny",
    href: "/status",
  },
];

export function TrustBar() {
  return (
    <section
      aria-label="Zaufanie i bezpieczeństwo"
      className="bg-iron-50 dark:bg-iron-950 border-y border-iron-200 dark:border-iron-800"
    >
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {ITEMS.map((item, i) => {
            const Icon = item.icon;
            const inner = (
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-9 h-9 rounded-md bg-white dark:bg-iron-900 border border-iron-200 dark:border-iron-800 flex items-center justify-center text-accent-700">
                  <Icon className="w-4 h-4" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-iron-900 dark:text-iron-50">
                    {item.title}
                  </div>
                  <div className="text-xs text-iron-500 mt-0.5">{item.desc}</div>
                </div>
              </div>
            );
            return item.href ? (
              <Link
                key={i}
                href={item.href}
                className="block rounded-lg px-3 py-2 -mx-3 hover:bg-white dark:hover:bg-iron-900 transition focus:outline-none focus-visible:shadow-shield-focus"
              >
                {inner}
              </Link>
            ) : (
              <div key={i} className="px-3 py-2 -mx-3">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
