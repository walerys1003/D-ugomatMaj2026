/**
 * /program-afiliacyjny/zarejestruj — formularz signup do affiliate program.
 */
import type { Metadata } from "next";
import AffiliateSignupForm from "./AffiliateSignupForm";

export const metadata: Metadata = {
  title: "Rejestracja affiliate — Długomat",
  description: "Zarejestruj się w programie afiliacyjnym Długomat. 20% prowizji.",
};

export default function AffiliateSignupPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold">Rejestracja w programie afiliacyjnym</h1>
        <p className="mt-2 text-gray-600">
          Po rejestracji dostaniesz unikalny link do polecania + dashboard ze statystykami.
        </p>
      </header>
      <AffiliateSignupForm />
    </main>
  );
}
