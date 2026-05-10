/**
 * Tier 10 — Localized friendly error-page copy.
 */
import type { Locale } from "@/lib/i18n/locales";

interface ErrorCopy {
  title: string;
  description: string;
  cta: string;
}

const COPY: Record<string, Record<Locale, ErrorCopy>> = {
  "404": {
    pl: { title: "Strona nie znaleziona", description: "Adres, który wpisałeś, nie istnieje.", cta: "Wróć na stronę główną" },
    cs: { title: "Stránka nenalezena", description: "Tato adresa neexistuje.", cta: "Zpět na hlavní stránku" },
    sk: { title: "Stránka sa nenašla", description: "Táto adresa neexistuje.", cta: "Späť na hlavnú stránku" },
    hu: { title: "Az oldal nem található", description: "Ez a cím nem létezik.", cta: "Vissza a főoldalra" },
    ro: { title: "Pagina nu a fost găsită", description: "Această adresă nu există.", cta: "Înapoi la pagina principală" },
    en: { title: "Page not found", description: "The address you entered does not exist.", cta: "Back to home" },
  },
  "500": {
    pl: { title: "Coś poszło nie tak", description: "Wystąpił błąd serwera. Spróbuj ponownie za chwilę.", cta: "Spróbuj ponownie" },
    cs: { title: "Něco se pokazilo", description: "Došlo k chybě serveru. Zkuste to znovu.", cta: "Zkusit znovu" },
    sk: { title: "Niečo sa pokazilo", description: "Vyskytla sa chyba servera. Skúste to znova.", cta: "Skúsiť znova" },
    hu: { title: "Valami elromlott", description: "Szerverhiba történt. Próbáld újra.", cta: "Újra próbálkozás" },
    ro: { title: "Ceva nu a mers", description: "A apărut o eroare de server. Încercați din nou.", cta: "Reîncearcă" },
    en: { title: "Something went wrong", description: "A server error occurred. Please try again.", cta: "Try again" },
  },
  "403": {
    pl: { title: "Brak dostępu", description: "Nie masz uprawnień do tej strony.", cta: "Zaloguj się" },
    cs: { title: "Přístup zamítnut", description: "Nemáte oprávnění zobrazit tuto stránku.", cta: "Přihlásit se" },
    sk: { title: "Prístup zamietnutý", description: "Nemáte oprávnenie na túto stránku.", cta: "Prihlásiť sa" },
    hu: { title: "Hozzáférés megtagadva", description: "Nincs jogosultságod ehhez az oldalhoz.", cta: "Bejelentkezés" },
    ro: { title: "Acces interzis", description: "Nu ai permisiunea pentru această pagină.", cta: "Autentificare" },
    en: { title: "Access denied", description: "You do not have permission to view this page.", cta: "Sign in" },
  },
};

export function getErrorCopy(code: "404" | "500" | "403", locale: Locale): ErrorCopy {
  return COPY[code][locale] ?? COPY[code].pl;
}
