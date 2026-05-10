"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/forms/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";

export function ResetPasswordForm() {
  const [sentTo, setSentTo] = React.useState<string | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: "" },
    mode: "onBlur",
  });

  const onSubmit = async (values: ResetPasswordInput) => {
    setServerError(null);
    try {
      const sb = createSupabaseBrowserClient();
      const { error } = await sb.auth.resetPasswordForEmail(values.email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) {
        setServerError("Nie udało się wysłać linku. Spróbuj ponownie.");
        return;
      }
      // Always show "wysłaliśmy" — never confirm whether the email exists.
      setSentTo(values.email);
    } catch {
      setServerError("Nie udało się wysłać linku. Spróbuj ponownie.");
    }
  };

  if (sentTo) {
    return (
      <div role="status" className="rounded-md border border-accent-200 bg-accent-50 p-4 text-fluid-sm text-accent-800">
        <p>
          Jeśli konto z adresem <strong>{sentTo}</strong> istnieje, otrzymasz link do
          zmiany hasła w ciągu kilku minut.
        </p>
        <p className="mt-2 text-iron-700">Nie ma wiadomości? Sprawdź folder spam.</p>
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
      <Button type="submit" loading={form.formState.isSubmitting} block>
        Wyślij link
      </Button>
    </form>
  );
}
