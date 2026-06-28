# 11.8 — D8 — Upadłość-Lite (249 zł)

_source: SPEC_FULL · tags: ai-engine, modules, strategy · line 2185 · 1600 chars_

Cel: przygotowanie dokumentacji do upadłości konsumenckiej dla osób w stanie niewypłacalności.
WAŻNE ZASTRZEŻENIE: Upadłość-Lite NIE zastępuje prawnika w postępowaniu sądowym. Generuje dokumenty wstępne i kwalifikację — użytkownik powinien skonsultować je z prawnikiem przed złożeniem. Disclaimer wyświetlany prominentnie w UI.
Workflow:
Krok 1 — Kwalifikacja (ankieta): seria pytań (tak/nie + szczegóły). Czy jesteś niewypłacalny (nie jesteś w stanie spłacać swoich zobowiązań)? Czy prowadzisz działalność gospodarczą? (jeśli tak → upadłość przedsiębiorcy, nie konsumencka). Ile masz wierzycieli? Jakie jest łączne zadłużenie? Czy masz majątek (nieruchomości, samochód, oszczędności)? Przyczyna niewypłacalności (utrata pracy, choroba, rozwód, nieodpowiedzialne zaciąganie kredytów)? Czy byłeś już upadłym? Osoby na utrzymaniu?
Krok 2 — AI Scoring: Sonnet analizuje odpowiedzi i ocenia szansę na ogłoszenie upadłości (0–100%). Uwzględnia: czy niewypłacalność powstała z winy umyślnej (negatywna przesłanka), czy dłużnik nie ukrywał majątku, czy wcześniej ogłoszono upadłość (<10 lat temu → negatywna przesłanka).
Krok 3 — Jeśli score ≥ 50%: przejście do generowania dokumentów. Jeśli < 50%: szczegółowe wyjaśnienie dlaczego (z zachęceniem do konsultacji prawnika) + alternatywna ścieżka (UgodoMat).
Krok 4 — Dane do wniosku: szczegółowy formularz. Lista wierzycieli (nazwa, adres, kwota, tytuł). Lista majątku (nieruchomości, ruchomości, konta, inwestycje). Dochody i wydatki (miesięczne). Oświadczenie o prawdziwości danych.
Krok 5 — Generowanie pakietu dokumentów.
Generowane pisma (5 dokumentów):
