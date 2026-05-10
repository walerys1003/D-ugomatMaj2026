# 6.3.5 — Documents (/api/documents/)

_source: SPEC_FULL · tags: frontend, database, ai-engine, modules · line 931 · 844 chars_

GET /api/documents — lista dokumentów użytkownika. Filtr: case_id, status (draft, generated, paid, downloaded), type.
GET /api/documents/[id] — szczegóły dokumentu z treścią Markdown.
PATCH /api/documents/[id] — edycja treści dokumentu (użytkownik modyfikuje wygenerowany tekst). Zapisuje wersję (tabela document_versions).
GET /api/documents/[id]/pdf — renderowanie PDF. Pipeline: pobranie Markdown z bazy → konwersja do HTML z szablonem (templates/base-layout.html + templates/[type].html) → wstrzyknięcie danych (strony, sąd, sygnatura, data) → Puppeteer render → zwrot PDF jako stream (Content-Type: application/pdf). Cache: PDF cachowany w Supabase Storage, regeneracja tylko po edycji.
POST /api/documents/[id]/send — (V2) wysyłka pisma na adres sądu/komornika/wierzyciela. Integracja z usługą e-PUAP lub InPost Paczkomat (list polecony).
