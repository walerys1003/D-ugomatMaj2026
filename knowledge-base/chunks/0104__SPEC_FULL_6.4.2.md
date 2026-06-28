# 6.4.2 — Logika terminów procesowych (Deadline Engine)

_source: SPEC_FULL · tags: frontend, database, notifications, modules · line 984 · 1023 chars_

Terminy są krytyczne — przekroczenie terminu może oznaczać utratę prawa do sprzeciwu lub odwołania. System zarządza terminami następująco:
Obliczanie terminu: deadline_date = doręczenie_date + termin_dni (np. 14 dni dla sprzeciwu EPU, 7 dni dla skargi na czynności komornika). Uwzględnianie dni wolnych od pracy (kalendarz polskich świąt i weekendów — jeśli termin wypada w dzień wolny, przesuwa się na następny dzień roboczy). Baza świąt: statyczna tablica w constants/deadlines.ts + dynamiczne obliczanie dat ruchomych (Wielkanoc = algorytm Gaussa → Poniedziałek Wielkanocny, Boże Ciało).
Powiadomienia: system CRON (Supabase Edge Function uruchamiana co godzinę) sprawdza tabelę deadlines i wysyła powiadomienia na e-mail (AWS SES) i SMS (SMSAPI.pl(http://smsapi.pl/)) według harmonogramu D-7, D-5, D-3, D-1, D-0.
Template powiadomień: każdy email jest spersonalizowany (imię, typ sprawy, sygnatura, data terminu, odliczanie, przycisk CTA „Wróć do sprawy"), responsywny HTML (MJML compiled), z fallbackiem na plain text.
