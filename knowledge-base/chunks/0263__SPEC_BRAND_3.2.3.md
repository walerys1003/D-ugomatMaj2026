# 3.2.3 — Paleta Status — Temporal Signals

_source: SPEC_BRAND · tags: frontend, brand · line 63 · 558 chars_

Kolory statusowe istnieją wyłącznie do komunikowania czasu i pilności. Nigdy nie są dekoracyjne. Nigdy nie pojawiają się bez kontekstu liczbowego (np. „3 dni") obok.
:root {
  /* AMBER — ostrzeżenie, zbliżający się termin (3-7 dni) */
  --dlug-warn-600: #D97706;
  --dlug-warn-500: #F59E0B;
  --dlug-warn-100: #FEF3C7;
  --dlug-warn-50:  #FFFBEB;

  /* RED — krytyczne, termin <3 dni lub przeterminowane */
  --dlug-danger-700: #B91C1C;
  --dlug-danger-600: #DC2626;
  --dlug-danger-500: #EF4444;
  --dlug-danger-100: #FEE2E2;
  --dlug-danger-50:  #FEF2F2;
}
