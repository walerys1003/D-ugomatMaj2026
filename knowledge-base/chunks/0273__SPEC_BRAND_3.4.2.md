# 3.4.2 — Border radius

_source: SPEC_BRAND · tags: payments · line 197 · 562 chars_

:root {
  --radius-none: 0px;
  --radius-sm:   6px;     /* Badge, tag, chip */
  --radius-md:   10px;    /* Input, select, textarea */
  --radius-lg:   14px;    /* Karty, modalle */
  --radius-xl:   18px;    /* Karty hero, pricing cards */
  --radius-2xl:  24px;    /* Duże sekcje, feature cards */
  --radius-full: 9999px;  /* Pill buttons, avatary, badge round */
}

Reguła: Żaden element w interfejsie nie może mieć border-radius mniejszego niż 6px (oprócz linii i separatorów). Sharp corners (0px radius) komunikują „tanim systemem" — Długomat tego nie robi.
