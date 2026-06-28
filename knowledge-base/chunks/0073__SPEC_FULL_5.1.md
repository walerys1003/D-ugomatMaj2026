# 5.1 — Routing (App Router)

_source: SPEC_FULL · tags: frontend, backend, database, payments, modules, strategy · line 756 · 1121 chars_

Grupy tras (Route Groups):
(marketing) — strony publiczne, SEO-optymalizowane, ISR/SSG. Obejmują stronę główną z hero, social proof i CTA; stronę „Jak to działa" z animowaną wizualizacją 4 kroków; cennik z toggle miesięczny/jednorazowy; blog SEO (artykuły o przedawnieniu, EPU, komornikach); FAQ z dynamicznym schema.org(http://schema.org/) markup; oraz strony prawne (regulamin, polityka prywatności).
(auth) — logowanie, rejestracja, reset hasła. Minimal UI, dark/light mode, magic link jako domyślna opcja (reduce friction).
(dashboard) — panel zalogowanego użytkownika. Protected route (middleware sprawdza sesję Supabase). Zawiera dashboard (overview spraw, nadchodzące terminy, ostatnie dokumenty), listę spraw z filtrami i sortowaniem, szczegóły sprawy (timeline, dokumenty, terminy), kreator nowej sprawy, zarządzanie dokumentami, kalendarz terminów, profil i ustawienia, oraz historię płatności.
(wizards) — kreatory pism, wyodrębnione w osobną grupę tras ze względu na odmienną nawigację (stepper zamiast sidebar). Każdy wizard ma identyczną strukturę: upload → dane → argumenty → podgląd → płatność → pobranie.
