# 9.3 — Obsługa pism komorniczych

_source: SPEC_FULL · tags: ai-engine, modules · line 1902 · 433 chars_

Pisma komornicze nie mają standaryzowanego formatu — każdy komornik ma własny wzór. Parser używa heurystyk: identyfikacja komornika (regex na „Komornik Sądowy" + imię i nazwisko + „przy Sądzie Rejonowym w…"), sygnatura komornicza (regex: /Km\s*\d+\/\d{2}/i lub /GKm\s*\d+\/\d{2}/i), wierzyciel i dłużnik, kwota egzekwowana, numer konta bankowego objętego zajęciem. Przy confidence < 70% → prompt użytkownika do ręcznego uzupełnienia.
