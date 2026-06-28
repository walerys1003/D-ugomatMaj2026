/**
 * /program-afiliacyjny — landing dla nowego programu afiliacyjnego (Tier 8).
 *
 * Różni się od `/program-partnerski` (legacy) — nowy program z prowizjami
 * 20% + 10% recurring, dashboard, payouts.
 */
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Program afiliacyjny Długomat — 20% prowizji za polecenia",
  description:
    "Zarabiaj polecając Długomat — 20% z pierwszej płatności + 10% z kolejnych przez 12 miesięcy. Dla blogerów, kancelarii, doradców finansowych.",
  alternates: { canonical: "/program-afiliacyjny" },
};

export default function AffiliateLandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Program afiliacyjny Długomat</h1>
        <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
          Zarabiaj <strong>20%</strong> z pierwszej płatności + <strong>10%</strong> z kolejnych
          przez 12 miesięcy. Wypłaty co miesiąc (próg 200 zł).
        </p>
        <div className="mt-6">
          <Link
            href="/program-afiliacyjny/zarejestruj"
            className="inline-flex items-center rounded-md bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700"
          >
            Zarejestruj się →
          </Link>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-3 mb-12">
        {[
          { step: "1", title: "Rejestracja", body: "30 sekund — dostajesz unikalny link" },
          { step: "2", title: "Promuj", body: "Blog, social media, newsletter, kanał YouTube" },
          { step: "3", title: "Zarabiaj", body: "20% z każdej płatności + 10% recurring 12 m-cy" },
        ].map((s) => (
          <div key={s.step} className="rounded-lg border p-6">
            <div className="text-3xl font-bold text-blue-600">{s.step}</div>
            <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
            <p className="mt-1 text-gray-600">{s.body}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg bg-blue-50 p-8 mb-12">
        <h2 className="text-2xl font-bold mb-4">Dla kogo?</h2>
        <ul className="grid gap-3 md:grid-cols-2">
          {[
            "Blogerzy prawni i finansowi",
            "Kancelarie radcowskie / adwokackie",
            "Doradcy podatkowi i finansowi",
            "YouTuberzy i podcaster-zy",
            "Edukatorzy konsumenccy",
            "Influencerzy z odbiorcą 25-55 lat",
          ].map((aud) => (
            <li key={aud} className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              {aud}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Pytania i odpowiedzi</h2>
        <div className="space-y-4">
          {FAQS.map((f, i) => (
            <details key={i} className="rounded-md border p-4">
              <summary className="font-semibold cursor-pointer">{f.q}</summary>
              <p className="mt-2 text-gray-700">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="text-center">
        <Link
          href="/program-afiliacyjny/zarejestruj"
          className="inline-flex items-center rounded-md bg-blue-600 px-8 py-3 text-white font-medium hover:bg-blue-700"
        >
          Dołącz do programu →
        </Link>
      </section>
    </main>
  );
}

const FAQS = [
  {
    q: "Jak działa atrybucja kliknięć?",
    a: "Cookie 90 dni — pierwszy click wygrywa (first-touch attribution). Window konwersji 365 dni od signup.",
  },
  {
    q: "Kiedy dostaję wypłatę?",
    a: "Wypłaty co miesiąc 1-go dnia po przekroczeniu progu 200 zł (lub w kolejnym miesiącu). Wypłaty przelewem bankowym / Stripe Connect / PayPal.",
  },
  {
    q: "Czy mogę polecać samemu sobie?",
    a: "Nie. Self-referral jest automatycznie blokowany. Wykrycie nadużyć = ban + utrata zgromadzonych prowizji.",
  },
  {
    q: "Co dokładnie liczę jako prowizja?",
    a: "20% z pierwszej zapłaconej faktury (zarówno pisma jednorazowe jak i subskrypcje). 10% z kolejnych faktur subskrypcyjnych przez 12 miesięcy od pierwszej płatności.",
  },
];
