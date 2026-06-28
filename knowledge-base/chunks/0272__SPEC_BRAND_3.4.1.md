# 3.4.1 — Grid bazowy

_source: SPEC_BRAND · tags: brand, strategy · line 176 · 1025 chars_

Cały system przestrzeni oparty jest na siatce 4px. Każda wartość paddingu, marginesu, gapu, wysokości i szerokości musi być wielokrotnością 4.
:root {
  --space-0:   0px;
  --space-0.5: 2px;     /* Micro-gaps: border offsets */
  --space-1:   4px;     /* Ikona-tekst gap wewnętrzny */
  --space-1.5: 6px;     /* Badge padding vertical */
  --space-2:   8px;     /* Gap między badge'ami, inline spacing */
  --space-3:   12px;    /* Padding wewnętrzny mały (tag, chip) */
  --space-4:   16px;    /* Standard gap, padding input vertical */
  --space-5:   20px;    /* Padding button vertical */
  --space-6:   24px;    /* Gap między elementami listy */
  --space-8:   32px;    /* Padding kart wewnętrzny */
  --space-10:  40px;    /* Sekcja gap mały */
  --space-12:  48px;    /* Sekcja gap medium */
  --space-16:  64px;    /* Sekcja gap duży */
  --space-20:  80px;    /* Padding sekcji marketing vertical */
  --space-24:  96px;    /* Hero padding top */
  --space-32:  128px;   /* Mega spacing — hero bottom, footer top */
}
