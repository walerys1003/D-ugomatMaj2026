"use client";

/**
 * Długomat — przycisk Checkout (Tier 4).
 *
 * Wywołuje `createCheckoutForCaseAction`, dostaje `checkoutUrl` i robi
 * `window.location.assign(...)` do Stripe Checkout. Zachowanie:
 *  - klik → loading state → redirect do Stripe
 *  - błąd → toast/inline error
 *  - klient B2B → modal z polami firma/NIP/adres przed checkoutem
 */
import { useState, useTransition } from "react";
import { Loader2, ShieldCheck, Building2, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createCheckoutForCaseAction } from "@/lib/payments/payment-actions";
import { formatPriceGrosze } from "@/lib/payments/pricing";
import { useCsrfToken } from "@/lib/security/use-csrf";

interface Props {
  caseId: string;
  documentId?: string;
  productName: string;
  grossGrosze: number;
}

type Mode = "idle" | "b2c" | "b2b";

export function CheckoutButton({
  caseId,
  documentId,
  productName,
  grossGrosze,
}: Props) {
  const [mode, setMode] = useState<Mode>("idle");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const csrf = useCsrfToken();

  // B2B fields
  const [companyName, setCompanyName] = useState("");
  const [nip, setNip] = useState("");
  const [address, setAddress] = useState("");

  const startCheckout = (customerType: "b2c" | "b2b") => {
    setError(null);
    if (!csrf) {
      setError("Inicjalizacja sesji — odśwież stronę i spróbuj ponownie.");
      return;
    }
    startTransition(async () => {
      try {
        // Tier 5 zad. 203 — CSRF token do server action.
        const result = await createCheckoutForCaseAction({
          caseId,
          documentId,
          customerType,
          invoiceCompanyName:
            customerType === "b2b" ? companyName : undefined,
          invoiceNip: customerType === "b2b" ? nip : undefined,
          invoiceAddress: customerType === "b2b" ? address : undefined,
          csrf,
        });
        // Hard navigation — Stripe Checkout to zewnętrzna domena
        window.location.assign(result.checkoutUrl);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Nie udało się rozpocząć płatności.");
      }
    });
  };

  if (mode === "idle") {
    return (
      <div className="space-y-3">
        <div className="flex items-baseline justify-between rounded-lg border border-ink-200 bg-ink-50/60 px-4 py-3 dark:border-ink-800 dark:bg-ink-900/40">
          <span className="text-fluid-sm text-ink-700 dark:text-ink-300">
            {productName}
          </span>
          <strong className="font-serif text-fluid-xl text-ink-900 dark:text-ink-50">
            {formatPriceGrosze(grossGrosze)}
          </strong>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            onClick={() => startCheckout("b2c")}
            loading={isPending}
            className="w-full"
          >
            <User className="mr-2 size-4" aria-hidden />
            Zapłać jako osoba prywatna
          </Button>
          <Button
            variant="outline"
            onClick={() => setMode("b2b")}
            className="w-full"
          >
            <Building2 className="mr-2 size-4" aria-hidden />
            Faktura na firmę (B2B)
          </Button>
        </div>
        <p className="flex items-center gap-2 text-fluid-xs text-ink-500">
          <ShieldCheck className="size-3.5 text-shield-600" aria-hidden />
          Płatność obsługuje Stripe — karta, BLIK, Przelewy24. Faktura VAT
          generowana automatycznie.
        </p>
        {error && (
          <p className="text-fluid-sm text-danger-600" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  // B2B form
  return (
    <div className="space-y-4 rounded-xl border border-ink-200 bg-white p-5 dark:border-ink-800 dark:bg-ink-950">
      <div className="space-y-1">
        <h4 className="text-fluid-base font-semibold text-ink-900 dark:text-ink-50">
          Dane do faktury VAT
        </h4>
        <p className="text-fluid-xs text-ink-500">
          Faktura w cenie. Wyślemy ją na Twój email natychmiast po opłaceniu.
        </p>
      </div>

      <FormField label="Nazwa firmy" htmlFor="b2b-company">
        <Input
          id="b2b-company"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="np. Długomat sp. z o.o."
          required
        />
      </FormField>

      <FormField label="NIP" htmlFor="b2b-nip" hint="10 cyfr, bez kresek.">
        <Input
          id="b2b-nip"
          value={nip}
          onChange={(e) => setNip(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          maxLength={10}
          placeholder="1234567890"
          required
        />
      </FormField>

      <FormField label="Adres siedziby" htmlFor="b2b-address">
        <Input
          id="b2b-address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="ul., kod pocztowy, miasto"
        />
      </FormField>

      {error && (
        <p className="text-fluid-sm text-danger-600" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setMode("idle")}
          disabled={isPending}
        >
          Wstecz
        </Button>
        <Button
          onClick={() => startCheckout("b2b")}
          loading={isPending}
          disabled={!companyName || nip.length !== 10}
          className={cn(isPending && "pointer-events-none")}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Łączę z Stripe…
            </>
          ) : (
            <>Zapłać · {formatPriceGrosze(grossGrosze)}</>
          )}
        </Button>
      </div>
    </div>
  );
}
