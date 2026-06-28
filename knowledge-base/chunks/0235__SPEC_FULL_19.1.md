# 19.1 — Strategia promptowania

_source: SPEC_FULL · tags: frontend, database, ai-engine · line 2491 · 500 chars_

Nie przekazuj całej specyfikacji naraz. Podziel na atomowe zadania. Każdy prompt powinien referencjonować co najwyżej 1–2 pliki z spec/. Schemat promptu:
KONTEKST: [krótki opis projektu — 200 słów]
CEL: [konkretne zadanie — np. "Stwórz komponent WizardShell"]
REFERENCJA: [plik spec — np. "spec/05-dlugomat.md, sekcja 5.3"]
WYMAGANIA: [lista 5-10 konkretnych wymagań]
STACK: [Next.js 14, Tailwind, shadcn/ui, TypeScript strict]
FORMAT: [oczekiwany output — np. "plik .tsx z exportowanym komponentem"]
