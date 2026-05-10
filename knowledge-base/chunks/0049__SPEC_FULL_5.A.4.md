# 5.A.4 — Struktura nawigacji w sidebarze

_source: SPEC_FULL · tags: frontend, payments, notifications, brand · line 437 · 1699 chars_

Sidebar Długomatu (desktop) i bottom-nav (mobile) zawierają pozycje:
---------------------------------------------
| |Ikona | |Etykieta | |Ścieżka | |Opis |
---------------------------------------------
| |LayoutDashboard | |Pulpit | |/app/dashboard | |Podsumowanie: liczba spraw, najbliższe terminy, scoring, rekomendacje AI |
---------------------------------------------
| |FilePlus2 | |Nowa sprawa | |/app/new-case | |Kreator: wybór kategorii → typ pisma → dynamiczny formularz → podgląd → płatność → PDF |
---------------------------------------------
| |FolderOpen | |Moje sprawy | |/app/cases | |Lista spraw z filtrami (status, kategoria, data), wyszukiwarka, sortowanie |
---------------------------------------------
| |FileText | |Dokumenty | |/app/documents | |Wszystkie wygenerowane pisma, wersje, pobieranie PDF |
---------------------------------------------
| |CalendarClock | |Terminy | |/app/deadlines | |Kalendarz (widok miesięczny/tygodniowy), lista nadchodzących terminów z countdown |
---------------------------------------------
| |Calculator | |Kalkulatory | |/app/calculators | |Kalkulator przedawnienia, kalkulator odsetek, kalkulator rat, symulator kosztów |
---------------------------------------------
| |MessageSquare | |AI Asystent | |/app/chat | |Chat prawny ze streamingiem |
---------------------------------------------
| |BookOpen | |Baza wiedzy | |/app/knowledge | |Artykuły, checklisty, e-booki |
---------------------------------------------
| |User | |Profil | |/app/profile | |Dane osobowe, historia płatności, pakiet |
---------------------------------------------
| |Settings | |Ustawienia | |/app/settings | |Powiadomienia, preferencje, usunięcie konta |
