import type { Metadata } from "next";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = {
  title: "Ustaw nowe hasło",
  robots: { index: false, follow: false },
};

export default function UpdatePasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-fluid-3xl font-bold tracking-tight text-dlugomat-900 dark:text-white">
          Ustaw nowe hasło
        </h1>
        <p className="mt-1 text-fluid-sm text-ink-600 dark:text-ink-300">
          Po zatwierdzeniu zostaniesz zalogowany.
        </p>
      </div>
      <UpdatePasswordForm />
    </div>
  );
}
