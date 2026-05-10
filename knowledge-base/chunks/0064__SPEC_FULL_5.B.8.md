# 5.B.8 — Baza wiedzy i RAG

_source: SPEC_FULL · tags: database, ai-engine · line 594 · 1380 chars_

Strona /admin/dlugomat/knowledge zarządza źródłami wiedzy prawnej dla RAG:
Artykuły i dokumenty źródłowe – lista z kolumnami: tytuł, kolekcja (kodeks_cywilny, kpc, orzecznictwo, komentarze, ustawy_specjalne), status (aktywny / draft / archiwum), data dodania, liczba chunków, rozmiar embeddingów. Akcje: edycja, podgląd, re-embedding, dezaktywacja.
Dodawanie źródła – formularz: upload pliku (PDF, DOCX, TXT) lub wklejenie tekstu. Opcje chunkingu: rozmiar chunka (domyślnie 1000 tokenów), overlap (200 tokenów), metadane (kolekcja, tagi, data obowiązywania). Po zapisie system automatycznie: dzieli tekst na chunki → generuje embeddingi via OpenAI text-embedding-3-small → zapisuje w tabeli legal_knowledge z wektorem embedding.
Monitor embeddingów – statystyki: łączna liczba chunków, rozmiar bazy wektorowej, rozkład po kolekcjach (bar chart), średni similarity score przy wyszukiwaniu, koszt embeddingów (OpenAI).
Testowanie RAG – pole tekstowe „Zapytanie testowe" → system wykonuje search_legal_knowledge → wyświetla top-10 wyników z similarity score, fragmentem tekstu, metadanymi. Pozwala adminowi weryfikować jakość wyszukiwania.
E-booki i checklisty – osobna podsekcja do zarządzania treściami edukacyjnymi (lead magnets). Pola: tytuł, opis, kategoria, plik PDF, miniatura, status (opublikowany / draft), czy bezpłatny, czy wymaga e-maila (lead capture). CRUD z podglądem.
