# 5.A.5 — Widok główny – Pulpit Długomat

_source: SPEC_FULL · tags: frontend, database, brand, strategy · line 461 · 1141 chars_

Układ pulpitu dzieli się na strefy:
Strefa powitalna – imię użytkownika, krótki komunikat kontekstowy („Masz 2 terminy w tym tygodniu"), przycisk „+ Nowa sprawa".
Alert urgentny – jeśli istnieje termin procesowy < 72 h, wyświetla się czerwony banner z odliczaniem i przyciskiem akcji.
Scoring długów – karta podsumowująca łączne zadłużenie, liczbę spraw, procent przedawnionych roszczeń (gauge chart 0–100 %, gradient zielony–czerwony), szacowane możliwe oszczędności.
Karty statystyk – cztery karty: Sprawy aktywne (liczba, ikona, trend), Dokumenty wygenerowane, Terminy nadchodzące, Szacowana wartość umorzonego długu.
Rekomendacje AI – do trzech kart „Sugerowany kolejny krok" z priorytetem (wysoki / średni / niski), opisem, przyciskiem przejścia.
Lista ostatnich spraw – tabela lub lista kart: nazwa sprawy, kategoria (badge kolorowy), status (badge), data utworzenia, kwota roszczenia, przycisk „Kontynuuj" / „Podgląd".
Nadchodzące terminy – lista do 5 najbliższych terminów z ikoną typu, nazwą, datą, countdown, przyciskiem „Zobacz sprawę".
Ostatnia aktywność – timeline ostatnich 10 zdarzeń (event sourcing) z ikonami i timestampami.
