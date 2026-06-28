import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Załóż konto",
  description: "Załóż konto Długomat — w 30 sekund.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { next?: string };
}

export default function SignUpPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Załóż konto
        </h1>
        <p className="mt-1 text-fluid-sm text-ink-600 dark:text-ink-300">
          30 sekund. Bez karty. Bez ukrytych kosztów.
        </p>
      </div>

      <SignUpForm next={searchParams.next} />

      <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
        Masz już konto?{" "}
        <Link
          href={`/sign-in${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
          className="font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
        >
          Zaloguj się
        </Link>
      </p>
    </div>
  );
}
