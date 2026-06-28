/**
 * Tier 31 — Panel UI strings, multi-locale.
 * Centralizuje kluczowe stringi panelu dla łatwego tłumaczenia.
 *
 * Użycie:
 *   import { t } from "@/lib/i18n/panel-strings";
 *   const label = t("nav.dashboard", locale);
 */

export type PanelLocale = "pl" | "en" | "uk" | "cs" | "ro";

type StringKey =
  | "nav.dashboard"
  | "nav.cases"
  | "nav.calculators"
  | "nav.notifications"
  | "nav.knowledge"
  | "nav.assistant"
  | "nav.referrals"
  | "nav.settings"
  | "cta.start_case"
  | "cta.scan_letter"
  | "cta.save_changes"
  | "cta.cancel"
  | "cta.delete"
  | "cta.upgrade"
  | "settings.profile"
  | "settings.security"
  | "settings.sessions"
  | "settings.api_keys"
  | "settings.payments"
  | "settings.integrations"
  | "settings.notifications"
  | "settings.rodo"
  | "status.active"
  | "status.inactive"
  | "status.recommended"
  | "empty.no_cases"
  | "empty.no_notifications"
  | "empty.no_api_keys";

type StringTable = Record<StringKey, string>;

const PL: StringTable = {
  "nav.dashboard": "Pulpit",
  "nav.cases": "Sprawy",
  "nav.calculators": "Kalkulatory",
  "nav.notifications": "Powiadomienia",
  "nav.knowledge": "Baza wiedzy",
  "nav.assistant": "Asystent AI",
  "nav.referrals": "Polecenia",
  "nav.settings": "Ustawienia",
  "cta.start_case": "Rozpocznij sprawę",
  "cta.scan_letter": "Skanuj pismo",
  "cta.save_changes": "Zapisz zmiany",
  "cta.cancel": "Anuluj",
  "cta.delete": "Usuń",
  "cta.upgrade": "Przejdź na plan Pro",
  "settings.profile": "Profil",
  "settings.security": "Bezpieczeństwo",
  "settings.sessions": "Aktywne sesje",
  "settings.api_keys": "Klucze API",
  "settings.payments": "Płatności",
  "settings.integrations": "Integracje",
  "settings.notifications": "Powiadomienia",
  "settings.rodo": "Twoje dane (RODO)",
  "status.active": "Aktywne",
  "status.inactive": "Nieaktywne",
  "status.recommended": "Zalecane",
  "empty.no_cases": "Brak spraw",
  "empty.no_notifications": "Brak powiadomień",
  "empty.no_api_keys": "Brak kluczy API",
};

const EN: StringTable = {
  "nav.dashboard": "Dashboard",
  "nav.cases": "Cases",
  "nav.calculators": "Calculators",
  "nav.notifications": "Notifications",
  "nav.knowledge": "Knowledge base",
  "nav.assistant": "AI assistant",
  "nav.referrals": "Referrals",
  "nav.settings": "Settings",
  "cta.start_case": "Start a case",
  "cta.scan_letter": "Scan letter",
  "cta.save_changes": "Save changes",
  "cta.cancel": "Cancel",
  "cta.delete": "Delete",
  "cta.upgrade": "Upgrade to Pro",
  "settings.profile": "Profile",
  "settings.security": "Security",
  "settings.sessions": "Active sessions",
  "settings.api_keys": "API keys",
  "settings.payments": "Billing",
  "settings.integrations": "Integrations",
  "settings.notifications": "Notifications",
  "settings.rodo": "Your data (GDPR)",
  "status.active": "Active",
  "status.inactive": "Inactive",
  "status.recommended": "Recommended",
  "empty.no_cases": "No cases yet",
  "empty.no_notifications": "No notifications",
  "empty.no_api_keys": "No API keys",
};

const UK: StringTable = {
  "nav.dashboard": "Панель",
  "nav.cases": "Справи",
  "nav.calculators": "Калькулятори",
  "nav.notifications": "Сповіщення",
  "nav.knowledge": "База знань",
  "nav.assistant": "AI-асистент",
  "nav.referrals": "Запрошення",
  "nav.settings": "Налаштування",
  "cta.start_case": "Створити справу",
  "cta.scan_letter": "Сканувати лист",
  "cta.save_changes": "Зберегти зміни",
  "cta.cancel": "Скасувати",
  "cta.delete": "Видалити",
  "cta.upgrade": "Перейти на Pro",
  "settings.profile": "Профіль",
  "settings.security": "Безпека",
  "settings.sessions": "Активні сесії",
  "settings.api_keys": "API-ключі",
  "settings.payments": "Платежі",
  "settings.integrations": "Інтеграції",
  "settings.notifications": "Сповіщення",
  "settings.rodo": "Ваші дані (GDPR)",
  "status.active": "Активне",
  "status.inactive": "Неактивне",
  "status.recommended": "Рекомендовано",
  "empty.no_cases": "Поки немає справ",
  "empty.no_notifications": "Немає сповіщень",
  "empty.no_api_keys": "Немає API-ключів",
};

const CS: StringTable = {
  "nav.dashboard": "Přehled",
  "nav.cases": "Případy",
  "nav.calculators": "Kalkulačky",
  "nav.notifications": "Oznámení",
  "nav.knowledge": "Znalostní báze",
  "nav.assistant": "AI asistent",
  "nav.referrals": "Doporučení",
  "nav.settings": "Nastavení",
  "cta.start_case": "Vytvořit případ",
  "cta.scan_letter": "Skenovat dopis",
  "cta.save_changes": "Uložit změny",
  "cta.cancel": "Zrušit",
  "cta.delete": "Smazat",
  "cta.upgrade": "Přejít na Pro",
  "settings.profile": "Profil",
  "settings.security": "Bezpečnost",
  "settings.sessions": "Aktivní relace",
  "settings.api_keys": "API klíče",
  "settings.payments": "Platby",
  "settings.integrations": "Integrace",
  "settings.notifications": "Oznámení",
  "settings.rodo": "Vaše údaje (GDPR)",
  "status.active": "Aktivní",
  "status.inactive": "Neaktivní",
  "status.recommended": "Doporučeno",
  "empty.no_cases": "Žádné případy",
  "empty.no_notifications": "Žádná oznámení",
  "empty.no_api_keys": "Žádné API klíče",
};

const RO: StringTable = {
  "nav.dashboard": "Tablou de bord",
  "nav.cases": "Cazuri",
  "nav.calculators": "Calculatoare",
  "nav.notifications": "Notificări",
  "nav.knowledge": "Bază de cunoștințe",
  "nav.assistant": "Asistent AI",
  "nav.referrals": "Recomandări",
  "nav.settings": "Setări",
  "cta.start_case": "Începe un caz",
  "cta.scan_letter": "Scanează scrisoare",
  "cta.save_changes": "Salvează modificările",
  "cta.cancel": "Anulează",
  "cta.delete": "Șterge",
  "cta.upgrade": "Treci la Pro",
  "settings.profile": "Profil",
  "settings.security": "Securitate",
  "settings.sessions": "Sesiuni active",
  "settings.api_keys": "Chei API",
  "settings.payments": "Plăți",
  "settings.integrations": "Integrări",
  "settings.notifications": "Notificări",
  "settings.rodo": "Datele tale (GDPR)",
  "status.active": "Activ",
  "status.inactive": "Inactiv",
  "status.recommended": "Recomandat",
  "empty.no_cases": "Niciun caz",
  "empty.no_notifications": "Nicio notificare",
  "empty.no_api_keys": "Nicio cheie API",
};

const TABLES: Record<PanelLocale, StringTable> = {
  pl: PL,
  en: EN,
  uk: UK,
  cs: CS,
  ro: RO,
};

export function t(key: StringKey, locale: PanelLocale = "pl"): string {
  const table = TABLES[locale] ?? PL;
  return table[key] ?? PL[key] ?? String(key);
}

export function getAvailableLocales(): PanelLocale[] {
  return Object.keys(TABLES) as PanelLocale[];
}
