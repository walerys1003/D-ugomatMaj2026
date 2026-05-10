"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { updatePasswordSchema, type UpdatePasswordInput } from "@/lib/forms/auth-schemas";
import { createSupabaseBrowserClient } from "@/lib/db/supabase-browser";

export function UpdatePasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onBlur",
  });

  const onSubmit = async (values: UpdatePasswordInput) => {
    setServerError(null);
    try {
      const sb = createSupabaseBrowserClient();
      const { error } = await sb.auth.updateUser({ password: values.password });
      if (error) {
        setServerError("Nie udało się zaktualizować hasła. Spróbuj jeszcze raz.");
        return;
      }
      router.push("/panel");
      router.refresh();
    } catch {
      setServerError("Nie udało się zaktualizować hasła. Spróbuj jeszcze raz.");
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      {serverError ? (
        <div role="alert" className="rounded-md border border-danger-500/40 bg-danger-50 p-3 text-fluid-sm text-danger-700">
          {serverError}
        </div>
      ) : null}
      <FormField
        label="Nowe hasło"
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
      <Button type="submit" loading={form.formState.isSubmitting} block>
        Ustaw hasło
      </Button>
    </form>
  );
}
