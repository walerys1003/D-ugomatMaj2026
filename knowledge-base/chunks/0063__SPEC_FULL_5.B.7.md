# 5.B.7 — Zarządzanie promptami AI

_source: SPEC_FULL · tags: frontend, database, ai-engine, strategy · line 589 · 1118 chars_

Strona /admin/dlugomat/prompts oferuje centralny widok wszystkich promptów AI używanych w module Długomat:
Lista promptów – tabela: identyfikator (case_type + prompt_type), typ (generation / validation / recommendation / chat_system), model, wersja aktualna, data modyfikacji, autor, średni koszt tokenu, średnia ocena walidacji. Filtry po typie, modelu, wersji.
Edytor promptu – Monaco Editor z podświetlaniem markdown i Mustache placeholderów. Panel boczny z dostępnymi zmiennymi (pola formularza, dane użytkownika, kontekst RAG). Przycisk „Testuj" otwiera modal z przykładowymi danymi formularza i generuje podgląd odpowiedzi AI w czasie rzeczywistym (streaming). Porównanie wersji: diff viewer (side-by-side) między dowolnymi dwiema wersjami. Rollback jednym kliknięciem. System tagów do organizacji promptów.
A/B testing promptów – możliwość oznaczenia dwóch wersji promptu jako warianty A i B z procentowym podziałem ruchu (np. 80/20). Automatyczne zbieranie metryk: jakość walidacji, czas generowania, koszt, satysfakcja użytkownika (jeśli zbierana). Dashboard porównawczy A/B z testem istotności statystycznej.
