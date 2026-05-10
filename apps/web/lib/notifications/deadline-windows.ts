import "server-only";

/**
 * Logika okien powiadomień terminowych.
 *
 * Na podstawie różnicy `deadline_date - today` decydujemy, które okno
 * powinno zostać wysłane (D7 / D3 / D1 / D0-morning).
 *
 * CRON Edge Function uruchamia tę funkcję raz na godzinę (UTC), filtruje
 * deadline'y `is_completed=false AND deadline_date >= today`, dla każdego
 * sprawdza czy odpowiednie okno powinno być wysłane i czy nie zostało już
 * wysłane (kolumny `notif_d7_sent`, `notif_d3_sent`, ...).
 */
import type { DeadlineKind } from "@/lib/db/types";
import type { EmailTemplateKey, SmsTemplateKey } from "./types";

export type DeadlineWindow = "d7" | "d3" | "d1" | "d0_morning";

export const DEADLINE_KIND_LABEL: Record<DeadlineKind, string> = {
  sprzeciw_14dni: "termin na sprzeciw od nakazu zapłaty (14 dni)",
  skarga_komornicza_7dni: "termin na skargę na czynności komornika (7 dni)",
  skarga_uodo_30dni: "termin na skargę do UODO (30 dni)",
  reklamacja_30dni: "termin reklamacji (30 dni)",
  odpowiedz_cesja_14dni: "termin na odpowiedź na wezwanie funduszu (14 dni)",
  wniosek_raty: "termin na wniosek o raty",
  wniosek_upadlosc: "termin na wniosek o upadłość",
  custom: "termin procesowy",
};

/**
 * Mapping okno → email template.
 */
export const EMAIL_TEMPLATE_FOR_WINDOW: Record<DeadlineWindow, EmailTemplateKey> = {
  d7: "deadline_d7_warning",
  d3: "deadline_d3_warning",
  d1: "deadline_d1_warning",
  d0_morning: "deadline_d0_morning",
};

/**
 * Mapping okno → sms template (D7 brak — SMS tylko od D3).
 */
export const SMS_TEMPLATE_FOR_WINDOW: Partial<Record<DeadlineWindow, SmsTemplateKey>> = {
  d3: "deadline_d3_warning",
  d1: "deadline_d1_warning",
  d0_morning: "deadline_d0_morning",
};

/**
 * Liczba dni do terminu — używamy dat w UTC midnight, by uniknąć
 * problemów ze strefami czasowymi w letnim/zimowym czasie.
 */
export function daysUntil(deadlineYmd: string, now = new Date()): number {
  const deadline = new Date(`${deadlineYmd}T00:00:00Z`);
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  const ms = deadline.getTime() - today.getTime();
  return Math.round(ms / 86_400_000);
}

/** Decyduje, które okno należy wysłać dla danej liczby dni do terminu. */
export function windowToSend(daysLeft: number, hourUtc: number): DeadlineWindow | null {
  // D0_morning: rano dnia terminu (godziny 5-9 UTC = 7-11 PL latem)
  if (daysLeft === 0 && hourUtc >= 5 && hourUtc < 10) return "d0_morning";
  // D1: dzień przed (cały dzień)
  if (daysLeft === 1) return "d1";
  // D3: 3 dni przed
  if (daysLeft === 3) return "d3";
  // D7: 7 dni przed
  if (daysLeft === 7) return "d7";
  return null;
}

/**
 * Mapuje okno na nazwę kolumny `notif_*_sent` w tabeli deadlines.
 */
export function windowToColumn(w: DeadlineWindow): string {
  switch (w) {
    case "d7": return "notif_d7_sent";
    case "d3": return "notif_d3_sent";
    case "d1": return "notif_d1_sent";
    case "d0_morning": return "notif_d0_morning_sent";
  }
}
