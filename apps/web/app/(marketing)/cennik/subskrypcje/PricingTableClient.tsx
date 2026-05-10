"use client";

import { useState } from "react";
import PricingTable from "@/components/billing/PricingTable";

export default function PricingTableClient() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const handleSelect = async (planId: string, cycle: "monthly" | "annual") => {
    setError(null);
    setPending(planId);
    try {
      const res = await fetch("/api/billing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan_id: planId, cycle }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        if (res.status === 401) {
          window.location.href = `/login?next=/cennik/subskrypcje`;
          return;
        }
        setError(j.error ?? "checkout_failed");
        setPending(null);
        return;
      }
      const j = (await res.json()) as { checkout_url?: string };
      if (j.checkout_url) {
        window.location.href = j.checkout_url;
      } else {
        setError("missing_url");
        setPending(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPending(null);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Błąd: {error}
        </div>
      )}
      {pending && (
        <div className="mb-4 rounded-md border border-blue-300 bg-blue-50 p-3 text-sm text-blue-800">
          Przekierowuję do Stripe…
        </div>
      )}
      <PricingTable onSelect={handleSelect} />
    </>
  );
}
