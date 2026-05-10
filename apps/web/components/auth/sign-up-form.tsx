"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { signUpSchema, type SignUpInput } from "@/lib/forms/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";

export function SignUpForm({ next }: { next?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [verificationSent, setVerificationSent] = React.useState<string | null>(null);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    // accept must be `true` literal — initial value is `false`, validated on submit.
    defaultValues: { email: "", password: "", confirm: "", accept: false as unknown as true, marketing: false },
    mode: "onBlur",
  });

  const onSubmit = async (values: SignUpInput) => {
    setServerError(null);
    try {
      const sb = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
      const { data, error } = await sb.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          emailRedirectTo: redirectTo,
          data: { marketing_opt_in: values.marketing ?? false },
        },
      });
      if (error) {
        setServerError(translateSignUpError(error.message));
        return;
      }
      // If email confirmation is required (typical Supabase config), session is null.
      if (!data.session) {
        setVerificationSent(values.email);
        return;
      }
      router.push(next && next.startsWith("/") ? next : "/panel");
      router.refresh();
    } catch {
      setServerError("Nie udało się utworzyć konta. Spróbuj ponownie.");
    }
  };

  if (verificationSent) {
    return (
      <div className="rounded-xl border border-accent-200 bg-accent-50 p-5 text-fluid-sm text-accent-800">
        <h2 className="text-fluid-lg font-semibold text-accent-700">Konto utworzone</h2>
        <p className="mt-2 text-iron-700">
          Wysłaliśmy link aktywacyjny na <strong>{verificationSent}</strong>. Kliknij go, aby
          potwierdzić e-mail i zalogować się.
        </p>
        <p className="mt-3 text-iron-600">
          Nie widzisz wiadomości? Sprawdź folder spam — czasem trafia tam pierwsza próba.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError ? (
        <div role="alert" className="rounded-md border border-danger-500/40 bg-danger-50 p-3 text-fluid-sm text-danger-700">
          {serverError}
        </div>
      ) : null}

      <FormField label="E-mail" htmlFor="email" required error={form.formState.errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          inputMode="email"
          invalid={!!form.formState.errors.email}
          {...form.register("email")}
        />
      </FormField>

      <FormField
        label="Hasło"
        htmlFor="password"
        required
        help="Minimum 10 znaków, wielka i mała litera, cyfra."
        error={form.formState.errors.password?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          invalid={!!form.formState.errors.password}
          {...form.register("password")}
        />
      </FormField>

      <FormField
        label="Powtórz hasło"
        htmlFor="confirm"
        required
        error={form.formState.errors.confirm?.message}
      >
        <Input
          type="password"
          autoComplete="new-password"
          invalid={!!form.formState.errors.confirm}
          {...form.register("confirm")}
        />
      </FormField>

      <label className="flex items-start gap-3 text-fluid-sm text-iron-700 dark:text-iron-300">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-iron-300 text-dlugomat-600 focus-visible:shadow-shield-focus focus-visible:outline-none"
          {...form.register("accept")}
        />
        <span>
          Akceptuję{" "}
          <Link href="/regulamin" className="font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300">
            Regulamin
          </Link>{" "}
          i{" "}
          <Link href="/polityka-prywatnosci" className="font-semibold text-dlugomat-700 hover:underline dark:text-dlugomat-300">
            Politykę prywatności
          </Link>
          .
        </span>
      </label>
      {form.formState.errors.accept ? (
        <p role="alert" className="text-fluid-xs font-medium text-danger-600">
          {form.formState.errors.accept.message as string}
        </p>
      ) : null}

      <label className="flex items-start gap-3 text-fluid-sm text-iron-700 dark:text-iron-300">
        <input
          type="checkbox"
          className="mt-1 size-4 rounded border-iron-300 text-dlugomat-600 focus-visible:shadow-shield-focus focus-visible:outline-none"
          {...form.register("marketing")}
        />
        <span>Chcę otrzymywać przydatne porady prawne na e-mail (możesz wypisać się jednym kliknięciem).</span>
      </label>

      <Button type="submit" loading={form.formState.isSubmitting} block>
        Załóż konto
      </Button>
    </form>
  );
}

function translateSignUpError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("user already registered") || m.includes("already exists")) {
    return "Konto z tym e-mailem już istnieje. Spróbuj się zalogować.";
  }
  if (m.includes("password")) {
    return "Hasło nie spełnia wymagań bezpieczeństwa.";
  }
  if (m.includes("rate limit")) {
    return "Za dużo prób. Spróbuj ponownie za chwilę.";
  }
  return "Nie udało się utworzyć konta. Spróbuj ponownie.";
}
