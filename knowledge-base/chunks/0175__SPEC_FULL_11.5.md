# 11.5 — D5 — BIK-Fix (129 zł)

_source: SPEC_FULL · tags: modules, security · line 2148 · 628 chars_

Cel: usunięcie lub korekta negatywnych wpisów w BIK (Biuro Informacji Kredytowej).
Workflow (3-etapowy):
Etap 1 — Reklamacja do banku: formularz z danymi kredytu/pożyczki (bank, numer umowy, data, kwota, status w BIK). Generowanie reklamacji do banku z żądaniem usunięcia/korekty wpisu. Termin odpowiedzi banku: 30 dni.
Etap 2 — Wniosek do BIK: jeśli bank odmówi lub nie odpowie. Generowanie wniosku do BIK S.A. z powołaniem na RODO art. 16 (prawo do sprostowania). Termin: 30 dni.
Etap 3 — Skarga do UODO: jeśli BIK odmówi. Generowanie skargi do Prezesa Urzędu Ochrony Danych Osobowych.
Generowane pisma (3 typy, sekwencyjnie):
