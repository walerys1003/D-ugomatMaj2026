# 3.4.3 — System cieni

_source: SPEC_BRAND · tags: misc · line 209 · 1082 chars_

Cienie w Długomat są chłodne (blue-tinted) i subtelne. Nigdy ciepłe, nigdy ostre. Cień nie „dekoruje" — cień buduje hierarchię warstw.
:root {
  --shadow-xs:  0 1px 2px 0 rgba(11, 29, 58, 0.04);
  --shadow-sm:  0 1px 3px 0 rgba(11, 29, 58, 0.06), 0 1px 2px -1px rgba(11, 29, 58, 0.06);
  --shadow-md:  0 4px 6px -1px rgba(11, 29, 58, 0.07), 0 2px 4px -2px rgba(11, 29, 58, 0.05);
  --shadow-lg:  0 10px 15px -3px rgba(11, 29, 58, 0.08), 0 4px 6px -4px rgba(11, 29, 58, 0.04);
  --shadow-xl:  0 20px 25px -5px rgba(11, 29, 58, 0.10), 0 8px 10px -6px rgba(11, 29, 58, 0.04);
  --shadow-2xl: 0 25px 50px -12px rgba(11, 29, 58, 0.18);

  /* Special: card hover — subtelne podniesienie */
  --shadow-card-hover: 0 12px 24px -4px rgba(11, 29, 58, 0.12), 0 4px 8px -2px rgba(11, 29, 58, 0.06);

  /* Special: focus ring shadow (zamiast outline) */
  --shadow-focus: 0 0 0 3px rgba(43, 105, 202, 0.35);
}

Reguła: Każda karta w stanie default ma --shadow-sm. Hover podnosi do --shadow-card-hover z transition 200ms. Kliknięta/aktywna karta wraca do --shadow-md. Modalle zawsze --shadow-2xl.
