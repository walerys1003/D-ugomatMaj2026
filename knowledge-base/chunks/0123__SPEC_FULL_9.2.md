# 9.2 — NakazParser — specjalizowany parser

_source: SPEC_FULL · tags: ocr, modules, strategy · line 1898 · 961 chars_

NakazParser (lib/ocr/nakaz-parser.ts) to specjalizowany moduł do ekstrakcji danych z nakazów zapłaty EPU. Nakazy EPU mają standaryzowany format (generowane przez system e-Sądu), co pozwala na regex-based extraction z wysoką dokładnością.
Pola do ekstrakcji: sygnatura (regex: /VI\s*Nc-e\s*\d{5,7}\/\d{2}/i), sąd (zawsze „Sąd Rejonowy Lublin-Zachód w Lublinie, VI Wydział Cywilny"), data wydania (regex: /dnia\s+(\d{1,2})\s+(stycznia|lutego|...|grudnia)\s+(\d{4})/i), powód (nazwa i adres — sekcja po „Powód:“), pozwany (sekcja po „Pozwany:”), kwota główna (regex: /kwot[ęa]\s+([\d\s]+[,\.]\d{2})\s*z[łl]/i), odsetki (regex po „odsetkami"), koszty procesu (regex po „kosztami procesu"), oraz podstawa roszczenia (sekcja „z tytułu" lub „na podstawie").
Confidence scoring: pola krytyczne (sygnatura, sąd, data, kwota) mają wyższą wagę. Jeśli sygnatura i data wykryte → base confidence +40%. Kwoty wykryte → +30%. Strony wykryte → +20%. Pełna identyfikacja → 90%+.
