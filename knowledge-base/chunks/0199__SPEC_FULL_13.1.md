# 13.1 — Kanały

_source: SPEC_FULL · tags: frontend, database, payments, notifications · line 2220 · 834 chars_

E-mail (AWS SES): koszt ~$0.10/1000 e-maili. Konfiguracja: domain verification (SPF, DKIM, DMARC dla dlugomat.pl(http://dlugomat.pl/)), dedicated IP (opcjonalnie, od $24.95/mo — potrzebne przy >10k emails/day). Szablony: MJML → HTML (responsywne). Typy: powitalny, potwierdzenie płatności, dokument gotowy, deadline reminder (D-7, D-5, D-3, D-1, D-0), newsletter/marketing (opt-in only).
SMS (SMSAPI.pl(http://smsapi.pl/)): koszt ~0.07–0.09 zł per SMS. Tylko dla deadline reminders D-1 i D-0 (opt-in). Format: „[Długomat] Termin na złożenie sprzeciwu mija JUTRO (17.04.2026). Zaloguj się: dlugomat.pl/panel(http://dlugomat.pl/panel)"
Push (Web Push API): darmowy. Service Worker + Push API. Notification permission request po pierwszej płatności (nie na wejściu — unikaj push fatigue). Typy: deadline reminders, dokument wygenerowany.
