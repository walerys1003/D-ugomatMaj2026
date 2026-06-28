# 5.B.16 — Komponenty React panelu admina – Długomat

_source: SPEC_FULL · tags: frontend, backend, database, ai-engine, payments, notifications, strategy, admin · line 735 · 2600 chars_

Dedykowane komponenty w components/admin/dlugomat/:
DlugomatKPICards.tsx – cztery karty KPI z animowanymi wartościami (count-up), sparkline (Recharts), badge trendu. Props: data: { mrr, users, casesToday, conversion }.
DlugomatRevenueChart.tsx – dual-axis chart (bar + line) z selektorem zakresu czasowego. Dane z /api/admin/dlugomat/dashboard/charts.
DlugomatCategoryDonut.tsx – donut chart z legendą i tooltipami. Kolory z design system Długomat.
DlugomatScoringHistogram.tsx – histogram rozkładu scoringu przedawnienia z trzema strefami kolorystycznymi.
DlugomatAICostChart.tsx – area chart kosztów AI z linią budżetu i alertem.
DlugomatLiveFeed.tsx – tabela strumieniowa z auto-scroll, animacją wejścia, filtrami. Supabase Realtime subscription na tabeli events.
DlugomatCaseTable.tsx – zaawansowana tabela (TanStack Table) z virtual scrolling, multi-sort, multi-filter, column resize, row selection, bulk actions (zmiana statusu, eksport).
DlugomatUserDetail.tsx – page component z zakładkami, ładowaniem danych z wielu endpointów równolegle (Promise.all).
DlugomatTemplateEditor.tsx – złożony formularz z zakładkami, Monaco Editor, podglądem formularza, wizualizacją branching (react-flow), diff viewer, rollback.
DlugomatPromptEditor.tsx – Monaco Editor z markdown + Mustache, panel zmiennych, testowy streaming AI, diff, A/B config.
DlugomatRAGManager.tsx – upload, chunking progress, lista źródeł, test search, statystyki embeddingów.
DlugomatCalculatorConfig.tsx – tabele edytowalne (terminy przedawnienia, stopy NBP) z walidacją, importem CSV, historią zmian.
DlugomatFunnelChart.tsx – wizualizacja lejka (custom SVG lub Recharts funnel) z drop-off percentages i porównaniem okresów.
DlugomatCohortHeatmap.tsx – tabela kohortowa z heatmapą kolorystyczną (zielony = wysoka retencja, czerwony = niska).
DlugomatPaymentsTable.tsx – tabela transakcji z inline refund modal, linkami Stripe, filtrami.
DlugomatPromoCodeForm.tsx – formularz CRUD kodu promo z walidacją dat, limitów, preview rabatu.
DlugomatNotificationLogs.tsx – tabela logów z filtrami po typie (email/SMS), statusie, szablonie.
DlugomatSettingsForm.tsx – formularz ustawień z feature flag toggles, edycją limitów, konfiguracją CRON, statusami integracji z przyciskami testowymi.
Niniejszy podrozdział 5.B stanowi kompletny opis panelu administracyjnego modułu Długomat. Powinien być wstawiony do specyfikacji bezpośrednio po podrozdziale 5.A (Panel użytkownika – Długomat) i przed istniejącym podrozdziałem opisującym Panel administracyjny Mandatomat, zachowując ciągłość numeracji i spójność architektoniczną całego dokumentu.
