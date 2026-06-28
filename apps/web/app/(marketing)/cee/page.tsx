/**
 * /cee — CEE expansion landing (announces upcoming markets).
 */
import type { Metadata } from "next";
import { localeMetadata } from "@/lib/i18n/locales";

export const metadata: Metadata = {
  title: "Długomat w Europie Środkowej — CZ, SK, HU, RO",
  description:
    "Długomat rozszerza się na Czechy, Słowację, Węgry i Rumunię. Dla każdego rynku — lokalne prawo, lokalna waluta, lokalny support.",
  alternates: { canonical: "/cee" },
};

const CEE_MARKETS = (["cs", "sk", "hu", "ro"] as const).map((l) => localeMetadata[l]);

export default function CeeLandingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Długomat w Europie Środkowej</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Po sukcesie w Polsce rozszerzamy się na rynki CEE. Dla każdego kraju
          — lokalne prawo, lokalny język, lokalna waluta.
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {CEE_MARKETS.map((m) => (
          <div key={m.code} className="rounded-lg border bg-white p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {m.nativeName}{" "}
                <span className="text-sm text-gray-500 font-normal">({m.countryCode})</span>
              </h3>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  m.live ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {m.live ? "LIVE" : "Coming soon"}
              </span>
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
              <dt className="text-gray-500">Waluta</dt>
              <dd className="font-semibold">{m.currency}</dd>
              <dt className="text-gray-500">VAT</dt>
              <dd className="font-semibold">{m.vatRate}%</dd>
              <dt className="text-gray-500">Strefa czasowa</dt>
              <dd className="font-semibold">{m.timezone}</dd>
              <dt className="text-gray-500">Support</dt>
              <dd className="font-semibold">{m.supportEmail}</dd>
            </dl>
            {m.domain && (
              <p className="mt-4 text-xs text-gray-500">
                Domena: <span className="font-mono">{m.domain}</span>
              </p>
            )}
          </div>
        ))}
      </section>

      <section className="mt-12 rounded-lg bg-blue-50 p-8">
        <h2 className="text-2xl font-bold mb-3">Jesteś z CEE i chcesz wcześniej?</h2>
        <p className="text-gray-700 mb-4">
          Zarejestruj się jako early-adopter — powiadomimy Cię kiedy rynek się otworzy.
        </p>
        <a
          href="/program-afiliacyjny"
          className="inline-flex items-center rounded-md bg-blue-600 px-6 py-3 text-white font-medium"
        >
          Zostań partnerem CEE →
        </a>
      </section>
    </main>
  );
}
