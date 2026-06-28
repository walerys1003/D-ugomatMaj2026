# 5.B.1 — Architektura panelu admina Długomat

_source: SPEC_FULL · tags: frontend, backend, database, ai-engine, strategy, admin · line 510 · 641 chars_

Panel administracyjny Długomat działa w ramach tego samego layoutu /admin/* co Mandatomat i Rozwodomat, z dodatkową sekcją nawigacji dedykowaną modułowi Długomat. Dostęp chroniony middleware sprawdzającym role = 'admin' | 'super_admin' w tabeli profiles. Cała komunikacja przechodzi przez API Routes z walidacją tokenu Supabase i dodatkowym sprawdzeniem roli w RLS.
Panel admina jest zbudowany jako SPA wewnątrz Next.js App Router pod ścieżką (admin)/ z własnym layoutem (app/(admin)/layout.tsx) zawierającym sidebar administracyjny, topbar z przełącznikiem produktów i breadcrumb, oraz footer z wersją systemu i logami ostatniej aktywności.
