# 3.7 — MODUŁY — IDENTYFIKACJA WIZUALNA

_source: SPEC_BRAND · tags: frontend, modules, brand · line 773 · 1308 chars_

Każdy z 8 modułów Długomat ma przypisany unikalny kolor akcentowy i ikonę. Kolory są wariacjami głównej palety navy — utrzymują spójność, ale pozwalają użytkownikowi natychmiast rozpoznać, w którym module się znajduje.
MODUŁ          KOD    KOLOR AKCENTOWY       IKONA LUCIDE      CENA
─────────────────────────────────────────────────────────────────────
D1 Skaner      FREE   dlug-400 (#5A8FDB)    ScanSearch         0 zł
D2 Sprzeciwomat EPU   dlug-600 (#2354A6)    ShieldAlert      159 zł
D3 KomornikShield      dlug-800 (#132D5E)    Gavel            199 zł
D4 PotrąceniaStop      warn-500 (#F59E0B)    Scissors         199 zł
D5 BIK-Fix             accent-500 (#10B461)  CreditCard       129 zł
D6 CesjaCheck          dlug-500 (#2B69CA)    FileSearch       149 zł
D7 UgodoMat            accent-600 (#0D8A4A)  Handshake        119 zł
D8 Upadłość-Lite       dlug-700 (#1B3F82)    LifeBuoy         249 zł

Implementacja w UI:
Sidebar: ikona modułu kolorowana na kolor akcentowy gdy aktywna.
Karta modułu na dashboardzie: border-left: 4px solid {kolor_modulu}.
Breadcrumb: badge z nazwą modułu w tle {kolor_modulu}-50, tekst {kolor_modulu}-700.
Wizard progress bar: fill w kolorze modułu zamiast domyślnego dlug-500.
Wygenerowany PDF: subtelna linia kolorowa (1px) na górze pierwszej strony w kolorze modułu.
