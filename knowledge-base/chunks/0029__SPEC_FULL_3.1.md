# 3.1 — Frontend

_source: SPEC_FULL · tags: frontend, backend, ai-engine, ocr · line 80 · 1295 chars_

Next.js 14 (App Router) — wybrany zamiast czystego React/Vite ze względu na SSR/ISR (krytyczny dla SEO — frazy takie jak „sprzeciw od nakazu zapłaty EPU" muszą indeksować się natychmiast), wbudowane API Routes (eliminuje potrzebę osobnego backendu), Image Optimization (optymalizacja LCP), oraz Middleware (geolokalizacja, rate limiting na edge).
Tailwind CSS 3.4 — utility-first CSS zapewnia spójność designu, szybki development (Kilo Code generuje Tailwind lepiej niż custom CSS), mały bundle (purging nieużywanych klas), oraz łatwość tworzenia dark mode.
shadcn/ui — kolekcja niestyled komponentów opartych na Radix UI. Wybrany zamiast MUI/Ant Design, ponieważ: zero vendor lock-in (kopiujesz komponenty do projektu, nie instalujesz paczki), pełna kontrola nad stylem, doskonała dostępność (Radix), oraz mniejszy bundle niż MUI o ~60%.
React Hook Form + Zod — formularze są sercem Długomatu (wielokrokowe wizardy, walidacja w czasie rzeczywistym, dynamiczne pola zależne od kontekstu sprawy). RHF ma najniższy narzut na re-rendery, a Zod pozwala na runtime type-checking z automatycznym wnioskowaniem typów TypeScript.
Framer Motion — mikroanimacje zwiększające perceived quality: przejścia między krokami wizarda, animacje ładowania podczas OCR, celebracyjna animacja po wygenerowaniu pisma.
