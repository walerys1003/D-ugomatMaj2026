import type { Metadata } from "next";
import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Zaloguj się",
  description: "Zaloguj się do swojego panelu Długomat.",
  robots: { index: false, follow: false },
};

interface PageProps {
  searchParams: { next?: string; error?: string };
}

export default function SignInPage({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Zaloguj się
        </h1>
        <p className="mt-1 text-fluid-sm text-ink-600 dark:text-ink-300">
          Masz konto? Wpisz e-mail i hasło, albo użyj magic-link.
        </p>
      </div>

      <SignInForm next={searchParams.next} initialError={searchParams.error} />

      <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
        Nie masz jeszcze konta?{" "}
        <Link
          href={`/sign-up${searchParams.next ? `?next=${encodeURIComponent(searchParams.next)}` : ""}`}
          className="font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300"
        >
          Załóż konto
        </Link>
      </p>
    </div>
  );
}
