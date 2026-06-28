# 5.4 — Stany UI

_source: SPEC_FULL · tags: frontend, ai-engine · line 847 · 369 chars_

Każdy komponent interaktywny obsługuje 7 stanów: default, hover, focus (visible ring dla accessibility), active/pressed, loading (skeleton lub spinner), error (komunikat + sugestia rozwiązania), success (zielony checkmark + mikro-animacja). Formularze: real-time walidacja po blur, nie po każdym keystroku. Formularze: error messages pod polem (nie nad, nie w tooltip).
