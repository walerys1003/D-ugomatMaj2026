# 5.B.14 — API Routes administracyjne – Długomat

_source: SPEC_FULL · tags: frontend, backend, database, ai-engine, payments, notifications, devops, admin · line 636 · 5894 chars_

Wszystkie endpointy admina pod prefixem /api/admin/dlugomat/:
---------------------------------------------
| |Metoda | |Ścieżka | |Opis |
---------------------------------------------
| |GET | |/api/admin/dlugomat/dashboard/kpis | |Zwraca MRR, users, cases, conversion, costs |
---------------------------------------------
| |GET | |/api/admin/dlugomat/dashboard/charts | |Dane do wykresów (revenue, categories, scoring, AI costs) |
---------------------------------------------
| |GET | |/api/admin/dlugomat/dashboard/live-feed | |Ostatnie 50 eventów (SSE lub polling) |
---------------------------------------------
| |GET | |/api/admin/dlugomat/users | |Lista użytkowników z paginacją, filtrami, sortowaniem |
---------------------------------------------
| |GET | |/api/admin/dlugomat/users/[id] | |Szczegóły użytkownika + sprawy + płatności + aktywność |
---------------------------------------------
| |PATCH | |/api/admin/dlugomat/users/[id] | |Zmiana roli, pakietu, statusu blokady |
---------------------------------------------
| |GET | |/api/admin/dlugomat/cases | |Lista spraw z filtrami, sortowaniem, paginacją |
---------------------------------------------
| |GET | |/api/admin/dlugomat/cases/[id] | |Pełne szczegóły sprawy |
---------------------------------------------
| |PATCH | |/api/admin/dlugomat/cases/[id]/status | |Ręczna zmiana statusu sprawy |
---------------------------------------------
| |POST | |/api/admin/dlugomat/cases/[id]/regenerate | |Ponowne generowanie dokumentu AI |
---------------------------------------------
| |GET | |/api/admin/dlugomat/templates | |Lista szablonów pism |
---------------------------------------------
| |GET | |/api/admin/dlugomat/templates/[case_type] | |Pełna konfiguracja szablonu |
---------------------------------------------
| |PUT | |/api/admin/dlugomat/templates/[case_type] | |Aktualizacja szablonu (schema, branching, prompt, RAG, recs) |
---------------------------------------------
| |POST | |/api/admin/dlugomat/templates | |Utworzenie nowego szablonu |
---------------------------------------------
| |GET | |/api/admin/dlugomat/prompts | |Lista promptów z wersjami |
---------------------------------------------
| |PUT | |/api/admin/dlugomat/prompts/[id] | |Aktualizacja promptu (auto-versioning) |
---------------------------------------------
| |POST | |/api/admin/dlugomat/prompts/[id]/rollback | |Rollback do wskazanej wersji |
---------------------------------------------
| |POST | |/api/admin/dlugomat/prompts/[id]/test | |Testowe generowanie z przykładowymi danymi |
---------------------------------------------
| |GET | |/api/admin/dlugomat/knowledge | |Lista źródeł RAG |
---------------------------------------------
| |POST | |/api/admin/dlugomat/knowledge | |Dodanie źródła (upload + chunking + embedding) |
---------------------------------------------
| |PUT | |/api/admin/dlugomat/knowledge/[id] | |Edycja źródła |
---------------------------------------------
| |POST | |/api/admin/dlugomat/knowledge/[id]/re-embed | |Ponowne generowanie embeddingów |
---------------------------------------------
| |POST | |/api/admin/dlugomat/knowledge/test-search | |Testowe wyszukiwanie RAG |
---------------------------------------------
| |GET | |/api/admin/dlugomat/calculators/config | |Konfiguracja kalkulatorów |
---------------------------------------------
| |PUT | |/api/admin/dlugomat/calculators/config | |Aktualizacja (terminy przedawnienia, stopy NBP) |
---------------------------------------------
| |GET | |/api/admin/dlugomat/calculators/logs | |Logi użycia kalkulatorów |
---------------------------------------------
| |GET | |/api/admin/dlugomat/payments | |Lista transakcji z filtrami |
---------------------------------------------
| |GET | |/api/admin/dlugomat/payments/[id] | |Szczegóły transakcji + Stripe data |
---------------------------------------------
| |POST | |/api/admin/dlugomat/payments/[id]/refund | |Zwrot (pełny lub częściowy) |
---------------------------------------------
| |GET | |/api/admin/dlugomat/promo-codes | |Lista kodów promo |
---------------------------------------------
| |POST | |/api/admin/dlugomat/promo-codes | |Utworzenie kodu |
---------------------------------------------
| |PUT | |/api/admin/dlugomat/promo-codes/[id] | |Edycja kodu |
---------------------------------------------
| |DELETE | |/api/admin/dlugomat/promo-codes/[id] | |Dezaktywacja kodu |
---------------------------------------------
| |GET | |/api/admin/dlugomat/analytics/funnel | |Dane funnela konwersji |
---------------------------------------------
| |GET | |/api/admin/dlugomat/analytics/cohorts | |Dane kohortowe |
---------------------------------------------
| |GET | |/api/admin/dlugomat/analytics/ai-costs | |Koszty AI dziennie / per model |
---------------------------------------------
| |GET | |/api/admin/dlugomat/analytics/document-types | |Analityka per typ pisma |
---------------------------------------------
| |GET | |/api/admin/dlugomat/notifications/logs | |Logi powiadomień (e-mail + SMS) |
---------------------------------------------
| |POST | |/api/admin/dlugomat/notifications/cron/trigger | |Ręczne uruchomienie CRON |
---------------------------------------------
| |GET | |/api/admin/dlugomat/settings | |Aktualna konfiguracja |
---------------------------------------------
| |PUT | |/api/admin/dlugomat/settings | |Aktualizacja ustawień |
---------------------------------------------
| |GET | |/api/admin/dlugomat/settings/integrations | |Statusy integracji |
---------------------------------------------
| |POST | |/api/admin/dlugomat/settings/integrations/[service]/test | |Test połączenia |
Każdy endpoint chroniony middleware adminAuthMiddleware sprawdzającym: token Supabase → profil → role IN ('admin', 'super_admin'). Wszystkie operacje zapisu logowane w admin_logs z danymi before/after. Rate limiting: 100 req/min per admin.
