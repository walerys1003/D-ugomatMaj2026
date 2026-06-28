import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Zresetuj hasło",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Zresetuj hasło
        </h1>
        <p className="mt-1 text-fluid-sm text-ink-600 dark:text-ink-300">
          Podaj e-mail — wyślemy link, którym ustawisz nowe hasło.
        </p>
      </div>
      <ResetPasswordForm />
      <p className="text-fluid-sm text-ink-600 dark:text-ink-300">
        Pamiętasz hasło?{" "}
        <Link href="/sign-in" className="font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300">
          Wróć do logowania
        </Link>
      </p>
    </div>
  );
}
