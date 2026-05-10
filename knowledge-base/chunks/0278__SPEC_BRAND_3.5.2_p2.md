# 3.5.2#p2 — Dashboard — architektura (part 2)

_source: SPEC_BRAND · tags: frontend, notifications, modules, brand, strategy · line 323 · 1158 chars_

Dashboard — strona główna (po zalogowaniu):
Widok główny składa się z 4 widgetów w gridzie 2x2 (desktop) / 1-kolumna (mobile):
Widget 1: Deadline Radar (colspan 2 na desktop)
Pełna szerokość, bg white, shadow-sm, radius-lg, p-6.
Horizontal timeline z punktami dla najbliższych terminów.
Każdy punkt: kółko 12px z kolorem pilności (accent-300 >7d, warn-500 3-7d, danger-500 <3d).
Najbliższy termin: pulsujący ring (animation: pulse 2s infinite), etykieta pogrubiona.
Jeśli brak terminów: „Brak pilnych terminów. Wszystkie sprawy pod kontrolą." z ilustracją tarczy + checkmark.
Widget 2: Aktywne sprawy
Lista 3-5 najnowszych spraw. Każda: flex row, border-left 4px (kolor zależny od statusu modułu), icon modułu, nazwa sprawy (skrócona), badge statusu, data.
CTA: „Zobacz wszystkie →"
Widget 3: Ostatnie dokumenty
Lista 3 ostatnich PDF. Każdy: ikona FileText, nazwa, data, badge (Wygenerowany / Opłacony / Pobrany).
CTA: „Wszystkie dokumenty →"
Widget 4: Szybkie akcje
Grid 2x2 małych kart-buttonów: „Nowy sprzeciw EPU", „Skarga na komornika", „Reklamacja BIK", „Sprawdź cesję".
Każdy: icon + label, bg dlug-50, hover bg dlug-100, border iron-200, radius-lg.
