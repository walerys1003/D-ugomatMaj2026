"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { signInSchema, magicLinkSchema, type SignInInput, type MagicLinkInput } from "@/lib/forms/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";

export function SignInForm({ next, initialError }: { next?: string; initialError?: string }) {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(initialError ?? null);
  const [magicSent, setMagicSent] = React.useState<string | null>(null);

  const passwordForm = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  });

  const magicForm = useForm<MagicLinkInput>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onPasswordSubmit = async (values: SignInInput) => {
    setServerError(null);
    try {
      const sb = createSupabaseBrowserClient();
      const { error } = await sb.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }
      router.push(next && next.startsWith("/") ? next : "/panel");
      router.refresh();
    } catch (err) {
      setServerError("Nie udało się połączyć z serwerem. Spróbuj ponownie.");
    }
  };

  const onMagicSubmit = async (values: MagicLinkInput) => {
    setServerError(null);
    setMagicSent(null);
    try {
      const sb = createSupabaseBrowserClient();
      const redirectTo = `${window.location.origin}/auth/callback${next ? `?next=${encodeURIComponent(next)}` : ""}`;
      const { error } = await sb.auth.signInWithOtp({
        email: values.email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) {
        setServerError(translateAuthError(error.message));
        return;
      }
      setMagicSent(values.email);
    } catch {
      setServerError("Nie udało się wysłać linku. Spróbuj ponownie.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {serverError ? (
        <div role="alert" className="rounded-md border border-danger-500/40 bg-danger-50 p-3 text-fluid-sm text-danger-700">
          {serverError}
        </div>
      ) : null}

      {/* Password sign-in */}
      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-4" noValidate>
        <FormField
          label="E-mail"
          htmlFor="email"
          required
          error={passwordForm.formState.errors.email?.message}
        >
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            invalid={!!passwordForm.formState.errors.email}
            {...passwordForm.register("email")}
          />
        </FormField>

        <FormField
          label="Hasło"
          htmlFor="password"
          required
          error={passwordForm.formState.errors.password?.message}
          hint={
            <Link href="/auth/reset" className="text-dlugomat-600 hover:underline dark:text-dlugomat-300">
              Zapomniałem hasła
            </Link>
          }
        >
          <Input
            type="password"
            autoComplete="current-password"
            invalid={!!passwordForm.formState.errors.password}
            {...passwordForm.register("password")}
          />
        </FormField>

        <Button type="submit" loading={passwordForm.formState.isSubmitting} block>
          Zaloguj
        </Button>
      </form>

      {/* Magic-link */}
      <Card elevation="flat" className="bg-ink-50 dark:bg-dlugomat-900">
        <CardContent className="flex flex-col gap-3 p-5">
          <div>
            <h3 className="text-fluid-base font-semibold text-dlugomat-900 dark:text-ink-50">
              Albo wyślij magic-link
            </h3>
            <p className="text-fluid-xs text-ink-600 dark:text-ink-300">
              Bez hasła — kliknij link z e-maila i zaloguj się jednym tapnięciem.
            </p>
          </div>
          {magicSent ? (
            <div role="status" className="rounded-md border border-accent-200 bg-accent-50 p-3 text-fluid-sm text-accent-700">
              Wysłaliśmy link na <strong>{magicSent}</strong>. Sprawdź skrzynkę i folder spam.
            </div>
          ) : (
            <form onSubmit={magicForm.handleSubmit(onMagicSubmit)} className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="ty@example.pl"
                aria-label="E-mail dla magic-link"
                invalid={!!magicForm.formState.errors.email}
                {...magicForm.register("email")}
              />
              <Button type="submit" variant="secondary" loading={magicForm.formState.isSubmitting}>
                Wyślij link
              </Button>
            </form>
          )}
          {magicForm.formState.errors.email ? (
            <p role="alert" className="text-fluid-xs font-medium text-danger-600">
              {magicForm.formState.errors.email.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Map Supabase auth error messages to friendlier Polish copy. We never
 * leak whether the email exists (timing-safe stance) — both
 * "Invalid login credentials" and missing-user collapse to one message.
 */
function translateAuthError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials") || m.includes("invalid email or password")) {
    return "Nieprawidłowy e-mail lub hasło.";
  }
  if (m.includes("email not confirmed")) {
    return "Potwierdź e-mail klikając link, który wysłaliśmy podczas rejestracji.";
  }
  if (m.includes("rate limit")) {
    return "Za dużo prób. Spróbuj ponownie za chwilę.";
  }
  return "Nie udało się zalogować. Spróbuj ponownie.";
}
