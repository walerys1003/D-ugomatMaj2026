# 5.B.15 — RLS i bezpieczeństwo panelu admina

_source: SPEC_FULL · tags: frontend, backend, database, ai-engine, security, admin · line 727 · 935 chars_

Polityki RLS dla tabel administracyjnych Długomat:
Tabela admin_logs – SELECT: role IN ('admin','super_admin'); INSERT: trigger-only (nie bezpośrednio przez admina); UPDATE/DELETE: role = 'super_admin' only.
Tabela case_type_config – SELECT: publiczny (potrzebny na frontendzie do renderowania formularzy); INSERT/UPDATE/DELETE: role IN ('admin','super_admin').
Tabela category_config – jak wyżej.
Tabela legal_knowledge – SELECT: publiczny (potrzebny do RAG); INSERT/UPDATE/DELETE: role IN ('admin','super_admin').
Wszystkie tabele z danymi użytkowników (cases, documents, payments, events, chat) – admin widzi wszystkie rekordy (policy: role IN ('admin','super_admin')), zwykły user widzi tylko swoje (policy: auth.uid() = user_id).
Dodatkowe zabezpieczenia: audit trail (admin_logs) dla każdej operacji, IP logging w middleware, session timeout 4h, wymuszony MFA dla kont admin (Supabase Auth MFA), CSP headers w Next.js middleware.
