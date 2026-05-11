"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Step = 1 | 2 | 3;

type AccountKind = "debtor" | "lawyer" | "company";

interface FormState {
  kind: AccountKind | null;
  email: string;
  password: string;
  full_name: string;
  company_name: string;
  phone: string;
  marketing_consent: boolean;
  terms_accepted: boolean;
}

const KIND_OPTIONS: Array<{
  value: AccountKind;
  title: string;
  desc: string;
}> = [
  {
    value: "debtor",
    title: "Osoba prywatna",
    desc: "Mam dług i potrzebuję pomocy — sprzeciw, ugoda, korekta BIK.",
  },
  {
    value: "lawyer",
    title: "Prawnik / kancelaria",
    desc: "Obsługuję klientów i chcę przyspieszyć pracę nad pismami.",
  },
  {
    value: "company",
    title: "Firma / dział windykacji",
    desc: "Zarządzam wieloma sprawami i potrzebuję narzędzia dla zespołu.",
  },
];

export function RegistrationWizard() {
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState<FormState>({
    kind: null,
    email: "",
    password: "",
    full_name: "",
    company_name: "",
    phone: "",
    marketing_consent: false,
    terms_accepted: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.terms_accepted) {
      setError("Musisz zaakceptować regulamin i politykę prywatności.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Nie udało się założyć konta. Spróbuj ponownie.");
        return;
      }
      window.location.href = "/panel?welcome=1";
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card elevation="pop">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${
                  step >= s
                    ? "bg-accent-600 text-iron-50"
                    : "bg-iron-100 dark:bg-iron-800 text-iron-500"
                }`}
                aria-current={step === s ? "step" : undefined}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-px ${
                    step > s ? "bg-accent-600" : "bg-iron-200 dark:bg-iron-800"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-iron-900 dark:text-iron-50">
                Kto będzie korzystał z konta?
              </h2>
              <p className="text-sm text-iron-500 mt-1">
                Dopasujemy widoki i moduły do Twoich potrzeb.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {KIND_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    update("kind", opt.value);
                    setStep(2);
                  }}
                  className={`text-left rounded-lg border p-4 transition focus:outline-none focus-visible:shadow-shield-focus ${
                    form.kind === opt.value
                      ? "border-accent-600 bg-accent-50 dark:bg-accent-700/10"
                      : "border-iron-300 dark:border-iron-700 hover:border-iron-400"
                  }`}
                >
                  <div className="font-medium text-iron-900 dark:text-iron-50 mb-1">
                    {opt.title}
                  </div>
                  <div className="text-xs text-iron-600 dark:text-iron-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-iron-900 dark:text-iron-50">
                Dane kontaktowe
              </h2>
              <p className="text-sm text-iron-500 mt-1">
                Potrzebujemy adresu e-mail do założenia konta.
              </p>
            </div>

            <Field
              label="Imię i nazwisko"
              type="text"
              required
              value={form.full_name}
              onChange={(v) => update("full_name", v)}
            />
            {form.kind !== "debtor" && (
              <Field
                label="Nazwa firmy"
                type="text"
                value={form.company_name}
                onChange={(v) => update("company_name", v)}
              />
            )}
            <Field
              label="E-mail służbowy"
              type="email"
              required
              value={form.email}
              onChange={(v) => update("email", v)}
            />
            <Field
              label="Telefon (opcjonalnie)"
              type="tel"
              value={form.phone}
              onChange={(v) => update("phone", v)}
              placeholder="+48 123 456 789"
            />

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setStep(1)}>
                ← Wstecz
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={!form.email || !form.full_name}
                onClick={() => setStep(3)}
                className="flex-1"
              >
                Dalej →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h2 className="font-display text-xl font-semibold text-iron-900 dark:text-iron-50">
                Ostatni krok
              </h2>
              <p className="text-sm text-iron-500 mt-1">
                Ustaw hasło i potwierdź warunki.
              </p>
            </div>

            <Field
              label="Hasło (min. 12 znaków)"
              type="password"
              required
              minLength={12}
              value={form.password}
              onChange={(v) => update("password", v)}
            />

            <label className="flex gap-2 text-sm text-iron-700 dark:text-iron-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms_accepted}
                onChange={(e) => update("terms_accepted", e.target.checked)}
                required
                className="mt-0.5 rounded"
              />
              <span>
                Akceptuję{" "}
                <a href="/regulamin" className="text-accent-700 hover:underline" target="_blank">
                  regulamin
                </a>{" "}
                i{" "}
                <a href="/rodo" className="text-accent-700 hover:underline" target="_blank">
                  politykę prywatności
                </a>
                .
              </span>
            </label>

            <label className="flex gap-2 text-sm text-iron-700 dark:text-iron-300 cursor-pointer">
              <input
                type="checkbox"
                checked={form.marketing_consent}
                onChange={(e) => update("marketing_consent", e.target.checked)}
                className="mt-0.5 rounded"
              />
              <span>
                Chcę otrzymywać newsletter z poradnikami prawnymi (max 2/mc, możesz
                wypisać się w każdej chwili).
              </span>
            </label>

            {error && (
              <p className="text-sm text-danger-700 bg-danger-50 border border-danger-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setStep(2)}>
                ← Wstecz
              </Button>
              <Button type="submit" variant="primary" disabled={submitting} className="flex-1">
                {submitting ? "Tworzymy konto..." : "Załóż konto"}
              </Button>
            </div>

            <p className="text-xs text-iron-500 text-center">
              Masz już konto?{" "}
              <a href="/logowanie" className="text-accent-700 hover:underline">
                Zaloguj się
              </a>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  type,
  required,
  value,
  onChange,
  placeholder,
  minLength,
}: {
  label: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-iron-700 dark:text-iron-300 mb-1.5 block">
        {label}
        {required && <span className="text-danger-600 ml-0.5">*</span>}
      </span>
      <input
        type={type}
        required={required}
        minLength={minLength}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-iron-300 dark:border-iron-700 bg-white dark:bg-iron-900 px-3 py-2 text-iron-900 dark:text-iron-50 focus:outline-none focus-visible:shadow-shield-focus"
      />
    </label>
  );
}
