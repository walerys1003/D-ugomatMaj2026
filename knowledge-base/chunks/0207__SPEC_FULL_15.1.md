# 15.1 — RODO (GDPR) Compliance

_source: SPEC_FULL · tags: backend, ai-engine, ocr, security · line 2245 · 696 chars_

Minimalizacja danych: zbieramy tylko dane niezbędne do wygenerowania pisma. Dane PESEL opcjonalne (nie wymagane do generowania — tylko jeśli użytkownik chce wpisać w pismo). Retencja: dane sprawy 30 dni po statusie completed, potem anonimizacja (usunięcie danych osobowych, zachowanie metadata do analityki). Prawo do usunięcia: endpoint /api/profile/delete — hard delete profilu + kaskadowe usunięcie spraw + dokumentów + OCR + plików Storage. Prawo do eksportu: endpoint /api/profile/export — JSON z wszystkimi danymi użytkownika. Cookie banner: analityka (PostHog) i marketing require opt-in. Polityka prywatności: szczegółowy dokument opisujący zbieranie, przetwarzanie, udostępnianie danych.
