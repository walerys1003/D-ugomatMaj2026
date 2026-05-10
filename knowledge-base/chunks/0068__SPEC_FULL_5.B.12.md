# 5.B.12 — Zarządzanie powiadomieniami

_source: SPEC_FULL · tags: database, notifications · line 621 · 1168 chars_

Strona /admin/dlugomat/notifications monitoruje wszystkie powiadomienia wysyłane do użytkowników Długomat:
Logi e-mail – tabela: ID, odbiorca, temat, szablon (welcome, deadline_reminder, document_ready, payment_success, payment_failed, deadline_urgent, weekly_summary), status (sent / delivered / opened / clicked / bounced / failed), data wysyłki, data otwarcia, provider (Resend). Filtry po statusie, szablonie, dacie.
Logi SMS – tabela: ID, numer telefonu (zamaskowany), treść (skrócona), status (sent / delivered / failed), koszt (PLN), provider (SMSAPI), data. Filtry.
Kolejka CRON – podgląd zadań zaplanowanych: sprawdzenie terminów (/api/deadlines/check), wysyłka przypomnień, weekly summary. Status ostatniego uruchomienia (success / error + komunikat), czas wykonania, liczba przetworzonych rekordów. Przycisk „Uruchom ręcznie".
Szablony e-mail – edytor szablonów e-mail (HTML + React Email lub Resend Templates). Podgląd w modalnym oknie. Zmienne: {{imie}}, {{typ_pisma}}, {{termin_data}}, {{link_do_sprawy}}. Wersjonowanie szablonów.
Statystyki – karty: wysłane dziś / 7d / 30d, delivery rate, open rate, click rate, bounce rate, koszt SMS. Wykresy trendów.
