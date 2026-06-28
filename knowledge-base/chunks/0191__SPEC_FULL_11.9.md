# 11.9 — D9 — OCR + AI Parser (wspólny moduł)

_source: SPEC_FULL · tags: ocr, modules · line 2201 · 333 chars_

Moduł techniczny (nie user-facing jako osobny produkt). Obsługuje wszystkie moduły D1–D8. Specjalizowane parsery: NakazParser (EPU), KomornikParser (pisma komornicze), PozewParser (pozwy funduszów), BIKParser (raporty BIK). Każdy parser to klasa z metodą parse(rawText: string): ExtractedData. Wspólny interfejs, różne implementacje.
