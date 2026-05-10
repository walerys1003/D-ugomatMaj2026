# 6.3.8 — Admin (/api/admin/)

_source: SPEC_FULL · tags: frontend, admin · line 944 · 371 chars_

GET /api/admin/stats — dashboard administracyjny. Metryki: liczba użytkowników (total, nowi w okresie), liczba spraw (per typ, per status), liczba dokumentów (generated, paid, downloaded), MRR, ARPU, conversion rate, churn, NPS. Chronione: wymaga role: 'admin' w profiles.
GET /api/admin/users — lista użytkowników z filtrami, paginacją. Akcje: dezaktywacja, zmiana roli.
