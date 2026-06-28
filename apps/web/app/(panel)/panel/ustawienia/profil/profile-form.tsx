"use client";

import { useState, useTransition } from "react";
import { Check, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  email: string;
  initialFullName: string;
  initialPhone: string;
  initialLocale: string;
  initialMarketingOptIn: boolean;
}

export function ProfileForm({
  email,
  initialFullName,
  initialPhone,
  initialLocale,
  initialMarketingOptIn,
}: Props) {
  const [fullName, setFullName] = useState(initialFullName);
  const [phone, setPhone] = useState(initialPhone);
  const [locale, setLocale] = useState(initialLocale);
  const [marketing, setMarketing] = useState(initialMarketingOptIn);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: fullName,
          phone,
          locale,
          marketing_opt_in: marketing,
        }),
      });
      if (!res.ok) {
        setError("Nie udało się zapisać. Spróbuj ponownie za chwilę.");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email (tylko do odczytu)</Label>
        <Input id="email" type="email" value={email} disabled />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="full_name">Imię i nazwisko</Label>
        <Input
          id="full_name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="np. Jan Kowalski"
          maxLength={120}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="phone">Telefon (opcjonalnie)</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+48 ..."
          maxLength={30}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="locale">Język interfejsu</Label>
        <select
          id="locale"
          className="h-10 rounded-md border border-ink-200 bg-white px-3 text-fluid-sm dark:border-dlugomat-700 dark:bg-dlugomat-900"
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
        >
          <option value="pl">Polski</option>
          <option value="en">English</option>
          <option value="uk">Українська</option>
          <option value="cs">Čeština</option>
          <option value="ro">Română</option>
        </select>
      </div>
      <label className="flex items-start gap-2 text-fluid-sm">
        <input
          type="checkbox"
          checked={marketing}
          onChange={(e) => setMarketing(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-ink-300 accent-dlugomat-600"
        />
        <span className="text-ink-700 dark:text-ink-200">
          Zgadzam się na otrzymywanie informacji marketingowych (możesz wycofać zgodę w każdej chwili).
        </span>
      </label>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={pending}>
          <Save className="h-4 w-4" />
          {pending ? "Zapisuję..." : "Zapisz zmiany"}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-fluid-sm text-emerald-600">
            <Check className="h-4 w-4" />
            Zapisano
          </span>
        )}
        {error && <span className="text-fluid-sm text-rose-600">{error}</span>}
      </div>
    </form>
  );
}
