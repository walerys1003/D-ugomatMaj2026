/**
 * Długomat — Tier 9 — Translation dictionaries (subset for marketing + UI core).
 *
 * Full translation pipeline:
 *  - Top 100 strings per language hand-translated
 *  - Long-form (baza-wiedzy articles) — DeepL API + human review
 *  - AI-generated documents — model jest dwujęzyczny (Sonnet rozumie cs/sk/hu/ro)
 *
 * Tutaj zaszywamy core UI strings + nav. Reszta przez `getTranslation()` z
 * fallback łańcuchem: requested → en → pl.
 */
import type { Locale } from "./locales";

export type TranslationKey =
  | "nav.home"
  | "nav.pricing"
  | "nav.modules"
  | "nav.how_it_works"
  | "nav.knowledge_base"
  | "nav.login"
  | "nav.signup"
  | "nav.dashboard"
  | "nav.logout"
  | "cta.start_free"
  | "cta.generate_letter"
  | "cta.see_pricing"
  | "cta.contact_us"
  | "wizard.next"
  | "wizard.previous"
  | "wizard.skip"
  | "wizard.save_exit"
  | "wizard.continue"
  | "checkout.subtotal"
  | "checkout.vat"
  | "checkout.total"
  | "checkout.pay"
  | "checkout.applying_coupon"
  | "common.loading"
  | "common.error"
  | "common.retry"
  | "common.cancel"
  | "common.save"
  | "common.delete"
  | "common.edit"
  | "common.continue"
  | "errors.network"
  | "errors.validation"
  | "errors.payment"
  | "errors.session_expired"
  | "footer.copyright"
  | "footer.terms"
  | "footer.privacy"
  | "footer.contact"
  | "hero.title"
  | "hero.subtitle"
  | "auth.email"
  | "auth.password"
  | "auth.confirm_password"
  | "auth.forgot_password";

const translations: Record<Locale, Partial<Record<TranslationKey, string>>> = {
  pl: {
    "nav.home": "Strona główna",
    "nav.pricing": "Cennik",
    "nav.modules": "Moduły",
    "nav.how_it_works": "Jak to działa",
    "nav.knowledge_base": "Baza wiedzy",
    "nav.login": "Zaloguj się",
    "nav.signup": "Załóż konto",
    "nav.dashboard": "Panel",
    "nav.logout": "Wyloguj",
    "cta.start_free": "Zacznij za darmo",
    "cta.generate_letter": "Wygeneruj pismo",
    "cta.see_pricing": "Zobacz cennik",
    "cta.contact_us": "Skontaktuj się",
    "wizard.next": "Dalej",
    "wizard.previous": "Wstecz",
    "wizard.skip": "Pomiń",
    "wizard.save_exit": "Zapisz i wyjdź",
    "wizard.continue": "Kontynuuj",
    "checkout.subtotal": "Netto",
    "checkout.vat": "VAT",
    "checkout.total": "Razem brutto",
    "checkout.pay": "Zapłać",
    "checkout.applying_coupon": "Aplikuję kupon…",
    "common.loading": "Ładowanie…",
    "common.error": "Błąd",
    "common.retry": "Spróbuj ponownie",
    "common.cancel": "Anuluj",
    "common.save": "Zapisz",
    "common.delete": "Usuń",
    "common.edit": "Edytuj",
    "common.continue": "Kontynuuj",
    "errors.network": "Brak połączenia z internetem.",
    "errors.validation": "Sprawdź poprawność danych.",
    "errors.payment": "Płatność nie powiodła się.",
    "errors.session_expired": "Sesja wygasła — zaloguj się ponownie.",
    "footer.copyright": "© Długomat. Wszelkie prawa zastrzeżone.",
    "footer.terms": "Regulamin",
    "footer.privacy": "Polityka prywatności",
    "footer.contact": "Kontakt",
    "hero.title": "Wygeneruj pismo prawne w 5 minut",
    "hero.subtitle": "AI dla dłużników — pierwsze pismo za darmo.",
    "auth.email": "Email",
    "auth.password": "Hasło",
    "auth.confirm_password": "Potwierdź hasło",
    "auth.forgot_password": "Zapomniałeś hasła?",
  },
  cs: {
    "nav.home": "Domů",
    "nav.pricing": "Ceník",
    "nav.modules": "Moduly",
    "nav.how_it_works": "Jak to funguje",
    "nav.knowledge_base": "Znalostní báze",
    "nav.login": "Přihlásit se",
    "nav.signup": "Registrovat",
    "nav.dashboard": "Panel",
    "nav.logout": "Odhlásit",
    "cta.start_free": "Začít zdarma",
    "cta.generate_letter": "Vygenerovat dopis",
    "cta.see_pricing": "Zobrazit ceník",
    "cta.contact_us": "Kontaktovat nás",
    "wizard.next": "Další",
    "wizard.previous": "Zpět",
    "wizard.skip": "Přeskočit",
    "wizard.save_exit": "Uložit a odejít",
    "wizard.continue": "Pokračovat",
    "checkout.subtotal": "Bez DPH",
    "checkout.vat": "DPH",
    "checkout.total": "Celkem s DPH",
    "checkout.pay": "Zaplatit",
    "common.loading": "Načítání…",
    "common.error": "Chyba",
    "common.retry": "Zkusit znovu",
    "common.cancel": "Zrušit",
    "common.save": "Uložit",
    "common.continue": "Pokračovat",
    "hero.title": "Vygenerujte právní dopis za 5 minut",
    "hero.subtitle": "AI pro dlužníky — první dopis zdarma.",
  },
  sk: {
    "nav.home": "Domov",
    "nav.pricing": "Cenník",
    "nav.modules": "Moduly",
    "nav.login": "Prihlásiť sa",
    "nav.signup": "Registrovať",
    "cta.start_free": "Začať zadarmo",
    "cta.generate_letter": "Vygenerovať list",
    "wizard.next": "Ďalej",
    "wizard.previous": "Späť",
    "checkout.total": "Spolu s DPH",
    "checkout.pay": "Zaplatiť",
    "common.loading": "Načítava sa…",
    "common.error": "Chyba",
    "hero.title": "Vygenerujte právny list za 5 minút",
    "hero.subtitle": "AI pre dlžníkov — prvý list zadarmo.",
  },
  hu: {
    "nav.home": "Főoldal",
    "nav.pricing": "Árlista",
    "nav.modules": "Modulok",
    "nav.login": "Bejelentkezés",
    "nav.signup": "Regisztráció",
    "cta.start_free": "Indítás ingyen",
    "cta.generate_letter": "Levél generálása",
    "wizard.next": "Tovább",
    "wizard.previous": "Vissza",
    "checkout.total": "Összesen ÁFA-val",
    "checkout.pay": "Fizetés",
    "common.loading": "Betöltés…",
    "common.error": "Hiba",
    "hero.title": "Generálj jogi levelet 5 perc alatt",
    "hero.subtitle": "AI adósoknak — az első levél ingyen.",
  },
  ro: {
    "nav.home": "Acasă",
    "nav.pricing": "Prețuri",
    "nav.modules": "Module",
    "nav.login": "Autentificare",
    "nav.signup": "Înregistrare",
    "cta.start_free": "Începe gratis",
    "cta.generate_letter": "Generează scrisoare",
    "wizard.next": "Următor",
    "wizard.previous": "Înapoi",
    "checkout.total": "Total cu TVA",
    "checkout.pay": "Plătește",
    "common.loading": "Se încarcă…",
    "common.error": "Eroare",
    "hero.title": "Generează scrisoare juridică în 5 minute",
    "hero.subtitle": "AI pentru debitori — prima scrisoare gratuit.",
  },
  en: {
    "nav.home": "Home",
    "nav.pricing": "Pricing",
    "nav.modules": "Modules",
    "nav.how_it_works": "How it works",
    "nav.knowledge_base": "Knowledge base",
    "nav.login": "Log in",
    "nav.signup": "Sign up",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Log out",
    "cta.start_free": "Start free",
    "cta.generate_letter": "Generate letter",
    "cta.see_pricing": "See pricing",
    "cta.contact_us": "Contact us",
    "wizard.next": "Next",
    "wizard.previous": "Back",
    "wizard.skip": "Skip",
    "wizard.save_exit": "Save and exit",
    "wizard.continue": "Continue",
    "checkout.subtotal": "Net",
    "checkout.vat": "VAT",
    "checkout.total": "Total gross",
    "checkout.pay": "Pay",
    "common.loading": "Loading…",
    "common.error": "Error",
    "common.retry": "Retry",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.continue": "Continue",
    "errors.network": "No internet connection.",
    "errors.validation": "Please check the data.",
    "errors.payment": "Payment failed.",
    "errors.session_expired": "Session expired — please log in again.",
    "footer.copyright": "© Długomat. All rights reserved.",
    "footer.terms": "Terms",
    "footer.privacy": "Privacy",
    "footer.contact": "Contact",
    "hero.title": "Generate a legal letter in 5 minutes",
    "hero.subtitle": "AI for debtors — first letter free.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirm_password": "Confirm password",
    "auth.forgot_password": "Forgot password?",
  },
};

/**
 * Returns translated string with fallback chain: requested → en → pl → key itself.
 */
export function t(key: TranslationKey, locale: Locale): string {
  return (
    translations[locale]?.[key] ??
    translations.en?.[key] ??
    translations.pl?.[key] ??
    key
  );
}

/**
 * Pluralization helper — uses Intl.PluralRules.
 * Forms is keyed by plural category (one/few/many/other depending on locale).
 */
export function plural(
  count: number,
  forms: Partial<Record<Intl.LDMLPluralRule, string>>,
  locale: Locale,
): string {
  const rules = new Intl.PluralRules(locale);
  const category = rules.select(count) as Intl.LDMLPluralRule;
  const template = forms[category] ?? forms.other ?? "";
  return template.replace("{count}", String(count));
}
