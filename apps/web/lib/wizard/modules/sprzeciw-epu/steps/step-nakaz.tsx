"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import type { WizardStepProps } from "@/lib/wizard/wizard-types";

import { nakazSchema, type NakazValues } from "../schemas";

export function StepNakaz({
  defaultValues,
  onSubmit,
  isSaving,
  isFirst,
  onBack,
}: WizardStepProps<NakazValues>) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NakazValues>({
    resolver: zodResolver(nakazSchema),
    defaultValues: {
      sygnatura: defaultValues.sygnatura ?? "",
      sad: defaultValues.sad ?? "",
      data_nakazu: defaultValues.data_nakazu ?? "",
      data_doreczenia: defaultValues.data_doreczenia ?? "",
    },
  });

  return (
    <form
      onSubmit={handleSubmit(async (values) => onSubmit(values))}
      className="space-y-5"
      noValidate
    >
      <FormField
        label="Sygnatura akt"
        hint="Z górnej części nakazu — np. „VI Nc-e 1234567/25”."
        error={errors.sygnatura?.message}
        htmlFor="sygnatura"
        required
      >
        <Input
          id="sygnatura"
          autoComplete="off"
          autoFocus
          placeholder="VI Nc-e 1234567/25"
          {...register("sygnatura")}
        />
      </FormField>

      <FormField
        label="Sąd"
        hint="Pełna nazwa sądu wskazana na nakazie."
        error={errors.sad?.message}
        htmlFor="sad"
        required
      >
        <Input
          id="sad"
          autoComplete="off"
          placeholder="Sąd Rejonowy Lublin-Zachód w Lublinie"
          {...register("sad")}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Data wydania nakazu"
          error={errors.data_nakazu?.message}
          htmlFor="data_nakazu"
          required
        >
          <Input
            id="data_nakazu"
            type="date"
            {...register("data_nakazu")}
          />
        </FormField>
        <FormField
          label="Data doręczenia"
          hint="Data, w której odebrałeś(-aś) nakaz — od niej liczymy 14 dni."
          error={errors.data_doreczenia?.message}
          htmlFor="data_doreczenia"
          required
        >
          <Input
            id="data_doreczenia"
            type="date"
            {...register("data_doreczenia")}
          />
        </FormField>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          disabled={isFirst}
        >
          Wstecz
        </Button>
        <Button type="submit" loading={isSubmitting || isSaving}>
          Dalej
        </Button>
      </div>
    </form>
  );
}
