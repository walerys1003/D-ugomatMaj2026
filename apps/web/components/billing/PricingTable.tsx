/**
 * PricingTable — komponent renderujący wszystkie plany subskrypcji.
 *
 * Props: cycle (monthly|annual), highlighted plan, onSelect callback.
 * Pure component — fetch'uje listę z `/api/billing/plans`.
 */
"use client";

import { useEffect, useState } from "react";

interface Plan {
  id: "free" | "starter" | "pro" | "family" | "company";
  name: string;
  tagline: string;
  monthly_grosze: number;
  annual_grosze: number;
  annual_discount_pct: number;
  features: string[];
  case_limit: number | null;
  ai_generations_per_month: number | null;
  tenant_seat_limit: number | null;
  api_access: boolean;
  highlight: boolean;
}

interface Props {
  initialCycle?: "monthly" | "annual";
  onSelect?: (planId: Plan["id"], cycle: "monthly" | "annual") => void;
}

export default function PricingTable({ initialCycle = "monthly", onSelect }: Props) {
  const [cycle, setCycle] = useState<"monthly" | "annual">(initialCycle);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing/plans")
      .then((r) => r.json())
      .then((d) => setPlans(d.plans ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12">Ładowanie planów…</div>;

  return (
    <div>
      {/* Cycle toggle */}
      <div className="flex justify-center mb-8">
        <div className="inline-flex rounded-md border bg-white p-1">
          <button
            type="button"
            onClick={() => setCycle("monthly")}
            className={`px-4 py-2 rounded ${cycle === "monthly" ? "bg-blue-600 text-white" : "text-gray-700"}`}
          >
            Miesięcznie
          </button>
          <button
            type="button"
            onClick={() => setCycle("annual")}
            className={`px-4 py-2 rounded ${cycle === "annual" ? "bg-blue-600 text-white" : "text-gray-700"}`}
          >
            Rocznie <span className="text-xs ml-1 opacity-80">(-20%)</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
        {plans.map((p) => {
          const price = cycle === "monthly" ? p.monthly_grosze : p.annual_grosze;
          const priceLabel =
            price === 0
              ? "0 zł"
              : cycle === "monthly"
                ? `${(price / 100).toFixed(0)} zł / m-c`
                : `${(price / 100).toFixed(0)} zł / rok`;
          return (
            <div
              key={p.id}
              className={`rounded-lg border p-6 ${p.highlight ? "border-blue-600 ring-2 ring-blue-600" : ""}`}
            >
              {p.highlight && (
                <div className="text-xs font-bold uppercase text-blue-600 mb-2">Polecany</div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{p.tagline}</p>
              <div className="mt-4 text-3xl font-bold">{priceLabel}</div>
              {cycle === "annual" && price > 0 && p.annual_discount_pct > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  Oszczędzasz {p.annual_discount_pct}%
                </div>
              )}
              <ul className="mt-5 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => onSelect?.(p.id, cycle)}
                disabled={p.id === "free"}
                className={`mt-6 w-full rounded-md py-2 font-medium ${
                  p.id === "free"
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {p.id === "free" ? "Plan domyślny" : "Wybierz"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
