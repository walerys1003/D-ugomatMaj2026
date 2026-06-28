# 10 — Zod schema eksportowana osobno (do reuse w API route)

_source: SPEC_FULL · tags: frontend, database, ai-engine, ocr, payments, security, devops · line 2594 · 1352 chars_

STACK: Next.js 14 App Router, React Hook Form, Zod, Tailwind, shadcn/ui,
date-fns (polskie formaty dat)

FORMAT: Kompletny plik .tsx + osobny plik schema (validators/sprzeciw-epu.ts)

PODSUMOWANIE WYKONAWCZE
Długomat to kompletny legal-tech SaaS z 8 modułami biznesowymi (D1–D8) generującymi łącznie 15+ typów pism procesowych. Architektura oparta na Next.js 14, Supabase, Claude Sonnet 4.6 (via APIPod) i Stripe jest optymalna dla solo-foundera z budżetem bootstrapowym.
Kluczowe metryki projektu: koszt development (AI tokens) to szacunkowo 55–90 zł, a z buforem bezpieczeństwa ~100–150 zł. Czas development wynosi 35–50 dni roboczych (8–12 tygodni). Koszt API per wygenerowane pismo to 0.15–0.50 zł, przy cenach sprzedaży 79–249 zł (marża >99%). Break-even to 9 płacących dokumentów miesięcznie.
Specyfikacja zawiera: 19 sekcji, pełny schemat bazy danych (11 tabel + RLS + indeksy), 8 modułów biznesowych z workflow, 70 atomowych promptów do Kilo Code, pipeline OCR + AI + PDF + płatności + powiadomień, design system „Tarcza" z pełną paletą i typografią, CI/CD z GitHub Actions + Vercel, oraz strategię bezpieczeństwa (RODO, szyfrowanie, walidacja).
Dokument jest gotowy do użycia jako mapa drogowa w Genspark AI Developer lub Kilo Code. Kolejność promptów z sekcji 19.2 jest zoptymalizowana pod minimalne zależności i maksymalny reuse komponentów.
