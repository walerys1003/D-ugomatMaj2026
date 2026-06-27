"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";

import { Label } from "@/components/ui/label";

interface Prefs {
  email_deadlines: boolean;
  email_case_updates: boolean;
  email_payments: boolean;
  email_marketing: boolean;
  sms_deadlines: boolean;
  sms_critical: boolean;
  push_enabled: boolean;
  push_quiet_start: string;
  push_quiet_end: string;
  digest_frequency: "off" | "daily" | "weekly";
}

interface Props {
  initial: Prefs;
}

export function NotificationsForm({ initial }: Props) {
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setSaved(false);
    startTransition(async () => {
      const res = await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }
    });
  };

  // Audyt 2026-06-27 (iter. 38): `toggle` działa wyłącznie na polach typu
  // boolean — zawężamy klucze do takich, zamiast `as any`. Dzięki temu próba
  // przełączenia pola tekstowego (np. push_quiet_start) jest błędem kompilacji.
  type BooleanKeys = {
    [K in keyof Prefs]: Prefs[K] extends boolean ? K : never;
  }[keyof Prefs];
  const toggle = (key: BooleanKeys) => () => update(key, !prefs[key]);

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-2 border-b border-ink-200 py-3 last:border-b-0 dark:border-dlugomat-700">
      <h3 className="text-fluid-sm font-semibold uppercase tracking-wider text-ink-500">{title}</h3>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );

  const Toggle = ({
    label,
    description,
    checked,
    onChange,
    disabled = false,
  }: {
    label: string;
    description?: string;
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
  }) => (
    <label className="flex items-start justify-between gap-3 py-1 cursor-pointer">
      <div className="flex flex-col">
        <span className="text-fluid-sm font-medium text-ink-900 dark:text-ink-100">{label}</span>
        {description && (
          <span className="text-fluid-xs text-ink-500 dark:text-ink-400">{description}</span>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={onChange}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
          checked ? "bg-dlugomat-600" : "bg-ink-300 dark:bg-dlugomat-700"
        } ${disabled ? "opacity-50" : ""}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );

  return (
    <div className="flex flex-col gap-2">
      <Section title="Email">
        <Toggle
          label="Terminy procesowe"
          description="Alerty o zbliżających się terminach sądowych."
          checked={prefs.email_deadlines}
          onChange={toggle("email_deadlines")}
        />
        <Toggle
          label="Aktualizacje spraw"
          description="Nowe dokumenty, zmiana statusu, oddanie pisma."
          checked={prefs.email_case_updates}
          onChange={toggle("email_case_updates")}
        />
        <Toggle
          label="Płatności i faktury"
          description="Potwierdzenia, faktury VAT-PL, odnowienia subskrypcji."
          checked={prefs.email_payments}
          onChange={toggle("email_payments")}
        />
        <Toggle
          label="Marketing i nowości"
          description="Aktualizacje produktu, porady. Możesz wyłączyć w dowolnym momencie."
          checked={prefs.email_marketing}
          onChange={toggle("email_marketing")}
        />
      </Section>

      <Section title="SMS">
        <Toggle
          label="Krytyczne alerty"
          description="Awarie, zagrożenia bezpieczeństwa konta. Zalecane."
          checked={prefs.sms_critical}
          onChange={toggle("sms_critical")}
        />
        <Toggle
          label="Terminy &lt; 48h"
          description="SMS na 48h przed nieprzekraczalnym terminem (np. wniesienie pisma)."
          checked={prefs.sms_deadlines}
          onChange={toggle("sms_deadlines")}
        />
      </Section>

      <Section title="Push (przeglądarka / aplikacja)">
        <Toggle
          label="Powiadomienia push"
          checked={prefs.push_enabled}
          onChange={toggle("push_enabled")}
        />
        {prefs.push_enabled && (
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex flex-col gap-1">
              <Label htmlFor="qs">Cisza nocna od</Label>
              <input
                id="qs"
                type="time"
                value={prefs.push_quiet_start}
                onChange={(e) => update("push_quiet_start", e.target.value)}
                className="h-9 rounded-md border border-ink-200 bg-white px-2 text-fluid-sm dark:border-dlugomat-700 dark:bg-dlugomat-900"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="qe">do</Label>
              <input
                id="qe"
                type="time"
                value={prefs.push_quiet_end}
                onChange={(e) => update("push_quiet_end", e.target.value)}
                className="h-9 rounded-md border border-ink-200 bg-white px-2 text-fluid-sm dark:border-dlugomat-700 dark:bg-dlugomat-900"
              />
            </div>
          </div>
        )}
      </Section>

      <Section title="Zbiorcze podsumowanie">
        <div className="flex flex-col gap-2">
          <Label htmlFor="dig">Częstotliwość digestu</Label>
          <select
            id="dig"
            value={prefs.digest_frequency}
            onChange={(e) => update("digest_frequency", e.target.value as Prefs["digest_frequency"])}
            className="h-10 rounded-md border border-ink-200 bg-white px-3 text-fluid-sm dark:border-dlugomat-700 dark:bg-dlugomat-900"
          >
            <option value="off">Wyłączone</option>
            <option value="daily">Codziennie (rano)</option>
            <option value="weekly">Tygodniowo (poniedziałek)</option>
          </select>
        </div>
      </Section>

      <div className="mt-2 flex items-center gap-2 text-fluid-xs text-ink-500">
        {pending ? (
          <span>Zapisuję...</span>
        ) : saved ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <Check className="h-3 w-3" />
            Zapisano
          </span>
        ) : (
          <span>Zmiany zapisują się automatycznie.</span>
        )}
      </div>
    </div>
  );
}
