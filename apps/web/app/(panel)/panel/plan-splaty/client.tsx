"use client";

import { useMemo, useState } from "react";
import { Calculator, FileDown, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormState = {
  totalDebt: number;
  monthlyCapacity: number;
  firstInstallment: string; // ISO date
  creditor: string;
  signature: string;
};

const INITIAL: FormState = {
  totalDebt: 12500,
  monthlyCapacity: 350,
  firstInstallment: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  creditor: "",
  signature: "",
};

function pln(amount: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function PlanSplatyClient() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const schedule = useMemo(() => {
    if (form.totalDebt <= 0 || form.monthlyCapacity <= 0) {
      return { months: 0, lastAmount: 0, totalPaid: 0, items: [] as Array<{ idx: number; date: string; amount: number; remaining: number }> };
    }
    const months = Math.ceil(form.totalDebt / form.monthlyCapacity);
    const items: Array<{ idx: number; date: string; amount: number; remaining: number }> = [];
    let remaining = form.totalDebt;
    const base = new Date(form.firstInstallment);
    for (let i = 0; i < months; i++) {
      const amount = Math.min(form.monthlyCapacity, remaining);
      remaining = Math.max(0, remaining - amount);
      const d = new Date(base);
      d.setMonth(d.getMonth() + i);
      items.push({
        idx: i + 1,
        date: d.toISOString().slice(0, 10),
        amount,
        remaining,
      });
    }
    return {
      months,
      lastAmount: items.at(-1)?.amount ?? 0,
      totalPaid: items.reduce((s, it) => s + it.amount, 0),
      items,
    };
  }, [form]);

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // Future: POST /api/repayment-plan
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <Card elevation="subtle">
        <CardHeader>
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-lg bg-dlugomat-100 text-dlugomat-700 dark:bg-dlugomat-850 dark:text-dlugomat-300"
          >
            <Calculator className="size-5" />
          </span>
          <CardTitle className="mt-2 text-fluid-xl">
            Kalkulator harmonogramu
          </CardTitle>
          <CardDescription>
            Wpisz kwotę i kwotę miesięczną, którą realnie udźwigniesz. Pozostałe
            pola wypełnimy z Twojej sprawy.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field
            id="totalDebt"
            label="Łączne zadłużenie (PLN)"
            type="number"
            value={form.totalDebt}
            min={100}
            step={50}
            onChange={(v) => update("totalDebt", Number(v))}
          />
          <Field
            id="monthlyCapacity"
            label="Mogę spłacać miesięcznie (PLN)"
            type="number"
            value={form.monthlyCapacity}
            min={50}
            step={50}
            onChange={(v) => update("monthlyCapacity", Number(v))}
          />
          <Field
            id="firstInstallment"
            label="Termin pierwszej raty"
            type="date"
            value={form.firstInstallment}
            onChange={(v) => update("firstInstallment", String(v))}
          />
          <Field
            id="creditor"
            label="Wierzyciel"
            placeholder="np. PKO BP S.A."
            value={form.creditor}
            onChange={(v) => update("creditor", String(v))}
          />
          <Field
            id="signature"
            label="Sygnatura sprawy (opcjonalnie)"
            placeholder="np. Nc-e 123456/24"
            value={form.signature}
            onChange={(v) => update("signature", String(v))}
            className="sm:col-span-2"
          />
        </CardContent>
      </Card>

      {/* Result */}
      <Card elevation="pop" urgency="success">
        <CardHeader>
          <CardTitle className="text-fluid-xl">
            Twój harmonogram: {schedule.months}{" "}
            {schedule.months === 1
              ? "rata"
              : schedule.months < 5
                ? "raty"
                : "rat"}
          </CardTitle>
          <CardDescription>
            Pierwsza rata{" "}
            <span className="font-semibold text-ink-900 dark:text-ink-50">
              {pln(form.monthlyCapacity)}
            </span>
            , ostatnia{" "}
            <span className="font-semibold text-ink-900 dark:text-ink-50">
              {pln(schedule.lastAmount)}
            </span>
            . Łącznie do zapłaty: {pln(schedule.totalPaid)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-ink-200 dark:border-dlugomat-800">
            <table className="w-full text-fluid-sm">
              <thead className="bg-ink-50/60 dark:bg-dlugomat-900/40">
                <tr className="text-left text-ink-600 dark:text-ink-300">
                  <th className="px-4 py-2 font-semibold">Rata</th>
                  <th className="px-4 py-2 font-semibold">Termin</th>
                  <th className="px-4 py-2 text-right font-semibold">Kwota</th>
                  <th className="px-4 py-2 text-right font-semibold">Pozostało</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100 dark:divide-dlugomat-800">
                {schedule.items.slice(0, 12).map((it) => (
                  <tr key={it.idx}>
                    <td className="px-4 py-2 font-mono text-fluid-xs text-ink-500">
                      #{String(it.idx).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-2 tabular-nums">
                      {new Date(it.date).toLocaleDateString("pl-PL")}
                    </td>
                    <td className="px-4 py-2 text-right tabular-nums">{pln(it.amount)}</td>
                    <td className="px-4 py-2 text-right tabular-nums text-ink-500">
                      {pln(it.remaining)}
                    </td>
                  </tr>
                ))}
                {schedule.items.length > 12 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-2 text-center text-fluid-xs text-ink-500"
                    >
                      … pozostałe {schedule.items.length - 12} rat w pełnym PDF
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="submit" variant="success">
              <Send className="size-4" />
              Wyślij wniosek do wierzyciela
            </Button>
            <Button type="button" variant="secondary">
              <FileDown className="size-4" />
              Pobierz harmonogram (PDF)
            </Button>
          </div>

          {submitted ? (
            <p className="mt-3 text-fluid-sm font-semibold text-accent-700">
              Zapisaliśmy szkic wniosku. Otrzymasz wzór e-mailem.
            </p>
          ) : null}
        </CardContent>
      </Card>
    </form>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  min,
  step,
  className,
}: {
  id: string;
  label: string;
  type?: "text" | "number" | "date";
  value: string | number;
  onChange: (v: string | number) => void;
  placeholder?: string;
  min?: number;
  step?: number;
  className?: string;
}) {
  return (
    <label htmlFor={id} className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-fluid-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300">
        {label}
      </span>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(type === "number" ? Number(e.target.value) : e.target.value)
        }
        className="h-11 rounded-lg border border-ink-200 bg-white px-3 text-fluid-sm text-ink-900 placeholder:text-ink-400 focus-visible:shadow-shield-focus focus-visible:outline-none dark:border-ink-800 dark:bg-ink-950 dark:text-ink-50"
      />
    </label>
  );
}
