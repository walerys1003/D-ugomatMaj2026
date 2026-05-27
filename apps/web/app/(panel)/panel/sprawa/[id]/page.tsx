import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Sparkles, ShieldCheck, FileText, Receipt, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CaseUsageMeter } from "@/components/cases/case-usage-meter";
import { CaseWizardClient } from "@/components/wizard/case-wizard-client";
import { CheckoutButton } from "@/components/payments/checkout-button";
import { getCaseById } from "@/lib/cases/case-repository";
import { caseStatusLabel, caseTypeMeta } from "@/lib/cases/case-types";
import { getWizardDefinition } from "@/lib/wizard/wizard-registry";
import { formatDateTimePL } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

interface Props {
  params: { id: string };
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const caseRow = await getCaseById(params.id);
  return {
    title: caseRow ? `${caseRow.title} · Długomat` : "Sprawa · Długomat",
  };
}

export default async function SprawaPage({ params }: Props) {
  const caseRow = await getCaseById(params.id);
  if (!caseRow) notFound();

  const meta = caseTypeMeta[caseRow.type];
  const wizard = getWizardDefinition(caseRow.type);

  // Po wygenerowaniu pisma kreator znika — pokazujemy podsumowanie + akcje.
  if (caseRow.status !== "draft" && caseRow.status !== "analysis") {
    return <PostGenerationView caseId={caseRow.id} caseRow={caseRow} />;
  }

  if (!wizard) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <BreadcrumbHeader caseRow={caseRow} />
        <Card>
          <CardHeader>
            <CardTitle>Moduł niedostępny</CardTitle>
            <CardDescription>
              Kreator dla tego typu sprawy będzie aktywowany w kolejnych etapach.
              Twoje dane pozostaną w szkicu.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbHeader caseRow={caseRow} />

      <CaseWizardClient
        caseId={caseRow.id}
        caseType={caseRow.type}
        wizardState={caseRow.wizard_state}
      />

      <aside className="rounded-xl border border-ink-200 bg-ink-50/60 p-4 text-fluid-xs text-ink-600 dark:border-ink-800 dark:bg-ink-900/40 dark:text-ink-400">
        <p className="mb-1 font-medium text-ink-700 dark:text-ink-300">
          Auto-zapis działa w tle
        </p>
        <p>
          Możesz w każdej chwili zamknąć kartę. Przy następnym otwarciu wrócimy
          dokładnie do tego kroku. Cena modułu: <strong>{
            meta.priceGrosze === 0
              ? "bezpłatnie"
              : `${(meta.priceGrosze / 100).toFixed(2)} zł`
          }</strong> — opłata pobierana dopiero po wygenerowaniu pisma.
        </p>
      </aside>
    </div>
  );
}

function BreadcrumbHeader({
  caseRow,
}: {
  caseRow: NonNullable<Awaited<ReturnType<typeof getCaseById>>>;
}) {
  const meta = caseTypeMeta[caseRow.type];
  return (
    <header className="space-y-2">
      <Link
        href="/panel"
        className="text-fluid-xs text-ink-500 hover:text-ink-700 dark:text-ink-400 dark:hover:text-ink-200"
      >
        ← Panel
      </Link>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-serif text-fluid-3xl text-ink-900 dark:text-ink-50">
          {caseRow.title}
        </h1>
        <div className="flex items-center gap-2">
          <Badge tone="info">{meta.module}</Badge>
          <Badge tone={statusToTone(caseRow.status)}>
            {caseStatusLabel[caseRow.status]}
          </Badge>
        </div>
      </div>
    </header>
  );
}

function statusToTone(
  status: import("@/lib/db/types").CaseStatus,
): "info" | "warning" | "success" | "neutral" {
  switch (status) {
    case "draft":
      return "neutral";
    case "analysis":
      return "info";
    case "generated":
      return "warning";
    case "paid":
    case "downloaded":
    case "completed":
      return "success";
    default:
      return "neutral";
  }
}

// -----------------------------------------------------------------------------
// Post-generation view (status >= 'generated')
// -----------------------------------------------------------------------------
async function PostGenerationView({
  caseId,
  caseRow,
}: {
  caseId: string;
  caseRow: NonNullable<Awaited<ReturnType<typeof getCaseById>>>;
}) {
  const lastDocId = (caseRow.metadata as Record<string, unknown> | null)?.[
    "last_document_id"
  ] as string | undefined;

  if (!lastDocId) {
    redirect(`/panel/sprawa/${caseId}/dokument`);
  }

  // Pobierz metadane dokumentu — AI badge + validation score
  const supabase = createSupabaseServerClient();
  const { data: doc } = await supabase
    .from("documents")
    .select(
      "id, ai_model_used, is_template, validation_score, generation_time_ms, ai_cost_usd, tokens_input, tokens_output, created_at",
    )
    .eq("id", lastDocId)
    .maybeSingle();

  const isAiGenerated = Boolean(doc?.ai_model_used);
  const validationScore = doc?.validation_score ?? null;

  // Pobierz najnowszą płatność dla sprawy (do FakturowniaInvoice link albo Checkout CTA)
  const { data: latestPayment } = await supabase
    .from("payments")
    .select(
      "id, status, amount, fakturownia_invoice_url, fakturownia_invoice_number, paid_at",
    )
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const meta = caseTypeMeta[caseRow.type];
  const isPaid = caseRow.status === "paid" ||
    caseRow.status === "downloaded" ||
    caseRow.status === "completed" ||
    latestPayment?.status === "completed";
  const requiresPayment = !isPaid && meta.priceGrosze > 0 && caseRow.status === "generated";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BreadcrumbHeader caseRow={caseRow} />

      <Card urgency="success" elevation="pop">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Pismo wygenerowane</CardTitle>
              <CardDescription>
                Twoje pismo jest gotowe. Możesz je teraz przejrzeć i wydrukować
                jako PDF (Ctrl/Cmd + P → „Zapisz jako PDF").
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {isAiGenerated ? (
                <Badge tone="info" withDot>
                  <Sparkles className="mr-1 inline size-3" aria-hidden />
                  AI &middot; {shortModelName(doc?.ai_model_used)}
                </Badge>
              ) : (
                <Badge tone="neutral">
                  <FileText className="mr-1 inline size-3" aria-hidden />
                  Szablon
                </Badge>
              )}
              {validationScore != null && (
                <Badge tone={scoreTone(validationScore)}>
                  <ShieldCheck className="mr-1 inline size-3" aria-hidden />
                  Walidacja: {validationScore}/100
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button asChild>
            <Link href={`/panel/sprawa/${caseId}/dokument/${lastDocId}/podglad`}>
              Otwórz pismo
            </Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/panel/sprawa/${caseId}/dokument/${lastDocId}/print`}>
              Tryb drukowania
            </Link>
          </Button>
          <span className="text-fluid-xs text-ink-500">
            Wygenerowano: {formatDateTimePL(new Date(caseRow.updated_at))}
          </span>
        </CardContent>
      </Card>

      {/* Tarcza guarantee — info o procesie */}
      {isAiGenerated && validationScore != null && validationScore >= 80 && (
        <div className="rounded-xl border border-hope-200 bg-hope-50/60 p-4 text-fluid-sm text-ink-800">
          <p className="font-medium text-hope-800">
            Pismo przeszło walidację z wynikiem {validationScore}/100.
          </p>
          <p className="mt-1 text-ink-700">
            Sprawdziliśmy: kompletność danych, poprawność petitum, cytaty
            przepisów, zgodność z Twoim wprowadzeniem oraz brak halucynacji
            modeli. Możesz złożyć pismo bez dodatkowej korekty.
          </p>
        </div>
      )}

      {isAiGenerated &&
        validationScore != null &&
        validationScore < 80 &&
        validationScore >= 60 && (
          <div className="rounded-xl border border-temporal-amber-200 bg-temporal-amber-50/60 p-4 text-fluid-sm text-ink-800">
            <p className="font-medium text-temporal-amber-800">
              Pismo wymaga przejrzenia ({validationScore}/100).
            </p>
            <p className="mt-1 text-ink-700">
              Sprawdź dokładnie treść pisma — walidacja zgłosiła drobne uwagi.
              Możesz je poprawić bezpośrednio w trybie podglądu.
            </p>
          </div>
        )}

      {!isAiGenerated && (
        <div className="rounded-xl border border-shield-100 bg-shield-50/40 p-4 text-fluid-sm text-ink-800">
          <p className="font-medium text-shield-900">
            Pismo wygenerowane na podstawie szablonu eksperckiego.
          </p>
          <p className="mt-1 text-ink-700">
            W tym momencie usługa AI była niedostępna — przygotowaliśmy pismo
            w oparciu o nasz statyczny szablon, sprawdzony przez radców prawnych.
            Możesz je złożyć bez obaw.
          </p>
        </div>
      )}

      {/* Tier 4 — blok płatności (Checkout albo Faktura) */}
      {requiresPayment && (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-shield-100 text-shield-700">
                <CreditCard className="size-4" aria-hidden />
              </span>
              <div>
                <CardTitle>Opłać i pobierz pismo</CardTitle>
                <CardDescription>
                  Pismo jest gotowe. Po opłaceniu otrzymasz pełną wersję
                  i fakturę VAT na email.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <CheckoutButton
              caseId={caseId}
              documentId={lastDocId}
              productName={meta.title}
              grossGrosze={meta.priceGrosze}
            />
          </CardContent>
        </Card>
      )}

      {/* Tier 3 zad. 109 — widget zużycia AI per case */}
      <CaseUsageMeter caseId={caseId} />

      {isPaid && latestPayment?.fakturownia_invoice_url && (
        <Card>
          <CardHeader>
            <div className="flex items-start gap-3">
              <span className="flex size-9 items-center justify-center rounded-full bg-hope-100 text-hope-700">
                <Receipt className="size-4" aria-hidden />
              </span>
              <div>
                <CardTitle>Faktura VAT</CardTitle>
                <CardDescription>
                  Numer:{" "}
                  <strong>
                    {latestPayment.fakturownia_invoice_number ?? "—"}
                  </strong>
                  . Wysłaliśmy ją na Twój email.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link
                href={latestPayment.fakturownia_invoice_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pobierz fakturę PDF
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function shortModelName(model: string | null | undefined): string {
  if (!model) return "AI";
  if (model.includes("opus")) return "Opus 4.5";
  if (model.includes("sonnet")) return "Sonnet 4.5";
  if (model.includes("haiku")) return "Haiku 4.5";
  return model.slice(0, 24);
}

function scoreTone(score: number): "success" | "warning" | "danger" | "info" {
  if (score >= 85) return "success";
  if (score >= 70) return "info";
  if (score >= 50) return "warning";
  return "danger";
}
