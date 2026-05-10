# 7 — Zakończ pismo znacznikiem ---KONIEC---

_source: SPEC_FULL · tags: ai-engine, modules · line 1971 · 2344 chars_

Warstwa 2 — Legal Context (RAG): wklejony kontekst z bazy legal_knowledge. Przykład dla sprzeciwu EPU:
KONTEKST PRAWNY (wykorzystaj jako podstawę argumentacji):

Art. 505^1 KPC: Sprzeciw od nakazu zapłaty wnosi się do sądu, który wydał
nakaz zapłaty. [...]

Art. 118 KC: Termin przedawnienia wynosi sześć lat, a dla roszczeń o świadczenia
okresowe oraz roszczeń związanych z prowadzeniem działalności gospodarczej – trzy lata.
[...]

Art. 117 § 2^1 KC: Po upływie terminu przedawnienia nie można domagać się
zaspokojenia roszczenia przysługującego przeciwko konsumentowi. [...]

Wyrok SN II CSK 456/21: "Fundusz sekurytyzacyjny nabywający wierzytelność
nie może powoływać się na przerwanie biegu przedawnienia dokonane przez
pierwotnego wierzyciela..."

[...kolejne fragmenty z RAG...]

Warstwa 3 — User Data (structured): dane z formularza w formacie JSON.
DANE SPRAWY:
{
  "sygnatura": "VI Nc-e 2345678/25",
  "sad": "Sąd Rejonowy Lublin-Zachód w Lublinie, VI Wydział Cywilny",
  "data_nakazu": "2025-11-20",
  "data_doreczenia": "2026-04-01",
  "powod": {
    "nazwa": "Fundusz Sekurytyzacyjny Gamma Sp. z o.o.",
    "adres": "ul. Przykładowa 10, 00-001 Warszawa"
  },
  "pozwany": {
    "nazwa": "Anna Nowak",
    "adres": "ul. Testowa 5/12, 30-001 Kraków"
  },
  "kwota_glowna": 8450.00,
  "kwota_odsetki": 3210.50,
  "kwota_koszty": 30.00,
  "zarzuty": ["przedawnienie", "brak_legitymacji_czynnej", "niewlasciwa_cesja"],
  "dodatkowe_okolicznosci": "Umowa pożyczki z 2018 roku z bankiem XYZ.
    Pożyczka spłacona w 80%. Fundusz kupił wierzytelność w 2024."
}

Warstwa 4 — Output Format (instrukcje formatowania):
WYMAGANY FORMAT PISMA:

## [Miejscowość], dnia [data_dzisiejsza]

## Sąd Rejonowy Lublin-Zachód w Lublinie
## VI Wydział Cywilny

Sygn. akt: [sygnatura]

Pozwany: [pozwany_nazwa], [pozwany_adres]
Powód: [powod_nazwa], [powod_adres]

## SPRZECIW OD NAKAZU ZAPŁATY W POSTĘPOWANIU UPOMINAWCZYM

Działając w imieniu własnym, wnoszę sprzeciw od nakazu zapłaty z dnia
[data_nakazu], doręczonego w dniu [data_doreczenia], wydanego w sprawie
[sygnatura], i wnoszę o:

[ŻĄDANIE — oddalenie powództwa w całości + zasądzenie kosztów]

## UZASADNIENIE

[Dla każdego zarzutu: osobny akapit z argumentacją + powołanie na przepis]

## PODSTAWA PRAWNA

[Lista artykułów]

## ZAŁĄCZNIKI

[Lista załączników]

[podpis pozwanego]

---KONIEC---
