import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { requireFullAdmin } from "@/lib/admin/rbac";
import { getPromptTemplate } from "@/lib/admin/admin-queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PromptTemplateForm } from "../prompt-form";

export const metadata: Metadata = {
  title: "Edycja promptu — Admin",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: { id: string };
}

export default async function AdminPromptEditPage({ params }: PageProps) {
  try {
    await requireFullAdmin();
  } catch {
    redirect("/admin");
  }

  // Specjalny case: /admin/prompty/nowy → formularz tworzenia.
  if (params.id === "nowy") {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <Link
            href="/admin/prompty"
            className="inline-flex items-center gap-1 text-fluid-sm text-iron-500 hover:text-dlugomat-700 dark:hover:text-white"
          >
            <ArrowLeft className="h-3 w-3" />
            Wróć do listy promptów
          </Link>
        </div>
        <header>
          <h1 className="font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
            Nowy prompt
          </h1>
          <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
            Pierwszy prompt dla nowej kombinacji <code>(case_type, variant)</code>{" "}
            otrzymuje wersję <code>1</code>. Aktywacja deaktywuje pozostałe
            warianty dla tej samej pary.
          </p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle className="text-fluid-base">Formularz</CardTitle>
            <CardDescription>
              Pola system_prompt i user_prompt_template są obowiązkowe.
              Lista <code>required_variables</code> oddzielana przecinkami.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PromptTemplateForm mode="create" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const prompt = await getPromptTemplate(params.id);
  if (!prompt) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/admin/prompty"
          className="inline-flex items-center gap-1 text-fluid-sm text-iron-500 hover:text-dlugomat-700 dark:hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          Wróć do listy promptów
        </Link>
      </div>

      <header>
        <p className="text-fluid-xs font-semibold uppercase tracking-wider text-dlugomat-600 dark:text-dlugomat-300">
          {prompt.case_type} · {prompt.variant}
        </p>
        <h1 className="mt-1 font-serif text-fluid-3xl font-semibold text-iron-900 dark:text-white">
          Edycja promptu (v{prompt.version})
        </h1>
        <p className="mt-2 text-fluid-sm text-iron-600 dark:text-iron-300">
          Zapis utworzy wersję <code>v{prompt.version + 1}</code>. Stara wersja
          zostanie zachowana w historii.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-fluid-base">Formularz</CardTitle>
          <CardDescription>
            Wszystkie pola są edytowalne; <code>case_type</code> i{" "}
            <code>variant</code> tworzą logiczny klucz wersjonowania —
            ich zmiana spowoduje przeniesienie historii do innej grupy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromptTemplateForm
            mode="edit"
            initial={{
              id: prompt.id,
              case_type: prompt.case_type,
              variant: prompt.variant,
              system_prompt: prompt.system_prompt,
              user_prompt_template: prompt.user_prompt_template,
              required_variables: prompt.required_variables,
              model: prompt.model,
              temperature: prompt.temperature,
              max_tokens: prompt.max_tokens,
              is_active: prompt.is_active,
              notes: prompt.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
