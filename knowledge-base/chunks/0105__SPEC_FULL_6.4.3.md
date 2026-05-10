# 6.4.3 — System wersjonowania dokumentów

_source: SPEC_FULL · tags: misc · line 989 · 253 chars_

Każda edycja dokumentu tworzy nowy wiersz w document_versions. Pole version_number auto-inkrementowane. Diff między wersjami obliczany na froncie (library diff). Użytkownik może przywrócić starszą wersję. Limit wersji: 20 per dokument (starsze usuwane).
