# 5.B.9 — Konfiguracja kalkulatorów

_source: SPEC_FULL · tags: database, notifications, strategy · line 601 · 1039 chars_

Strona /admin/dlugomat/calculators zarządza ustawieniami kalkulatorów Długomat:
Kalkulator przedawnienia – tabela terminów przedawnienia: typ zobowiązania, termin (lata), podstawa prawna (artykuł k.c./ustawy), data obowiązywania (od–do), uwagi. Admin może dodawać / edytować wpisy gdy zmienia się legislacja. Historia zmian z datami i autorami.
Kalkulator odsetek – tabela historycznych stóp procentowych NBP: typ stopy (referencyjna, lombardowa, depozytowa), wartość (%), data obowiązywania (od–do). Import z CSV lub ręczne dodawanie. System automatycznie przelicza stopy na odsetki ustawowe za opóźnienie (stopa referencyjna + 5,5 pp), maksymalne (2× ustawowe), kapitałowe (stopa referencyjna + 3,5 pp). Podgląd aktualnych wartości. Alert gdy NBP opublikuje nową decyzję (admin ręcznie aktualizuje lub CRON sprawdza RSS NBP).
Logi użycia – tabela: użytkownik, kalkulator, dane wejściowe (JSON), wynik (JSON), timestamp, czy darmowy. Statystyki: liczba użyć dziennie, najpopularniejszy kalkulator, średnia kwota, rozkład typów zobowiązań.
