import Link from "next/link";
import { Logo } from "@/components/layout/logo";

/**
 * Auth layout — split panel: left side with brand/value-prop, right
 * side with the actual form. Mobile collapses to a single column.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* Brand panel — Tarcza navy gradient */}
      <aside className="tarcza-hero-gradient relative hidden flex-col justify-between overflow-hidden p-10 text-white lg:flex">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 right-[-20%] h-[30rem] w-[30rem] rounded-full bg-dlugomat-500/30 blur-3xl"
        />
        <Link href="/" className="relative inline-flex">
          <Logo className="text-white" />
        </Link>
        <div className="relative max-w-md">
          <h2 className="text-fluid-3xl font-bold leading-tight text-white">
            Twoja sprawa to nasz priorytet — bez paniki, bez chaosu.
          </h2>
          <p className="mt-3 text-fluid-base text-ink-200">
            Wszystkie dane szyfrowane w spoczynku (AES-256) i podczas transmisji
            (TLS 1.3). Pełna zgodność z RODO. Twoje dokumenty widzisz tylko Ty.
          </p>
          <ul className="mt-6 space-y-2 text-fluid-sm text-ink-200">
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 size-1.5 rounded-full bg-accent-400" />
              Konto zakładasz w 30 sekund — magic-link lub e-mail+hasło
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 size-1.5 rounded-full bg-accent-400" />
              Anonimowy skan nakazu dostępny bez rejestracji
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden className="mt-1.5 size-1.5 rounded-full bg-accent-400" />
              Eksport i usunięcie danych — w jednym kliknięciu (RODO)
            </li>
          </ul>
        </div>
        <p className="relative text-fluid-xs text-ink-300">
          © {new Date().getFullYear()} Długomat
        </p>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex lg:hidden">
            <Logo />
          </Link>
          {children}
        </div>
      </main>
    </div>
  );
}
