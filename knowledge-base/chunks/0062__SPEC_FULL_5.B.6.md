# 5.B.6 — Zarządzanie szablonami pism (32 typy)

_source: SPEC_FULL · tags: database, ai-engine, brand, strategy · line 577 · 2635 chars_

Strona /admin/dlugomat/templates umożliwia zarządzanie konfiguracją każdego z 32 typów pism Długomat:
Lista szablonów – tabela: typ pisma (case_type), nazwa wyświetlana, kategoria (badge), cena (PLN, edytowalna inline), opłata sądowa, termin (dni), status (aktywny / draft / wyłączony), liczba użyć (łączna i 30d), średnia ocena walidacji AI, data ostatniej modyfikacji. Sortowanie, filtry, wyszukiwarka.
Edytor szablonu (/admin/dlugomat/templates/[case_type]) – formularz z zakładkami:
Zakładka Ogólne – nazwa, opis, kategoria, cena, opłata sądowa, termin, pakiet minimalny (basic/standard/premium), status, tagi SEO, ikona.
Zakładka Formularz (JSON Schema) – edytor kodu (Monaco Editor lub CodeMirror) z podświetlaniem składni JSON. Pole form_schema definiuje pola formularza użytkownika: typ (text, textarea, select, radio, checkbox, date, number, file), label, placeholder, tooltip, walidacja (required, min, max, regex, custom), opcje (dla select/radio), warunkowe wyświetlanie (depends_on). Przycisk „Podgląd formularza" renderuje formularz w modal obok edytora. Walidacja JSON Schema w czasie rzeczywistym z komunikatami błędów.
Zakładka Branching Rules – edytor JSON definiujący reguły rozgałęzień formularza. Struktura: { step_id, condition (field + operator + value), show_steps[], hide_steps[], modify_fields[] }. Wizualizacja grafowa (react-flow lub mermaid) pokazująca ścieżki formularza. Przycisk „Testuj branching" otwiera symulator z interaktywnym formularzu.
Zakładka Prompt AI – pole system_prompt (textarea z markdown), user_prompt_template (z placeholderami {{pole_formularza}}), validation_prompt, model (select: opus-4.6, sonnet-4.6, haiku-4.5), max_tokens, temperature, wersja promptu (auto-incrementowana przy zapisie). Historia wersji promptów z możliwością porównania diff i rollbacku.
Zakładka RAG – lista kolekcji RAG przypisanych do tego typu pisma (np. kodeks_cywilny, kodeks_postepowania_cywilnego, orzecznictwo_przedawnienie). Przycisk „Dodaj kolekcję" z selectem. Pole rag_query_template definiujące jak dane formularza mapują się na zapytanie RAG.
Zakładka Rekomendacje – lista sugerowanych następnych dokumentów po wygenerowaniu tego typu. Każda rekomendacja: case_type docelowy, priorytet (1–5), warunek (opcjonalny: np. „jeśli kwota > 10 000 PLN"), opis dla użytkownika.
Zakładka Checklist załączników – lista wymaganych i opcjonalnych załączników z opisami, tooltipami, flagą „wymagany".
Zakładka Statystyki – wykresy użycia: liczba generowań dziennie, średni czas generowania, średni koszt AI (tokeny/PLN), średnia ocena walidacji, najczęstsze wartości pól formularza, funnel konwersji tego typu.
