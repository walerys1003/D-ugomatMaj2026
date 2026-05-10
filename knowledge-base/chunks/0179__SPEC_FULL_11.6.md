# 11.6 — D6 — CesjaCheck (149 zł)

_source: SPEC_FULL · tags: ai-engine, ocr, modules · line 2160 · 848 chars_

Cel: obrona przed pozwami funduszy sekurytyzacyjnych, które kupiły wierzytelność od banku za ułamek wartości.
Workflow:
Krok 1 — Upload pozwu funduszu: OCR lub ręczne dane. Parser identyfikuje: fundusz (nazwa, KRS), cedent (bank), data cesji, umowa pierwotna, kwota.
Krok 2 — Analiza AI: Sonnet analizuje pozew pod kątem typowych słabości funduszy: brak dowodu cesji (umowy cesji lub wyciągu z umowy), brak zawiadomienia dłużnika o cesji (art. 512 KC), przedawnienie (cesja nie przerywa biegu przedawnienia — uchwała SN III CZP 29/16), nieudowodnienie wysokości (brak historii kredytu, wyciągu z ksiąg funduszu).
Krok 3 — Formularz odpowiedzi: dane pozwanego, wybór zarzutów (pre-selected przez AI), okoliczności dodatkowe.
Krok 4 — Generowanie odpowiedzi na pozew.
Krok 5 — Podgląd, edycja, płatność, pobranie.
Generowane pisma (1 typ + warianty):
