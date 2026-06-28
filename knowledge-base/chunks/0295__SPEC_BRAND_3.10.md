# 3.10 — DARK MODE

_source: SPEC_BRAND · tags: frontend, brand · line 1182 · 1632 chars_

Długomat implementuje dark mode oparty na prefers-color-scheme: dark z opcją manualnego przełączenia (toggle w ustawieniach + header).
/* Dark mode — semantic tokens override */
:root[data-theme="dark"] {
  /* Backgrounds */
  --bg-page:       #0C1019;   /* Prawie czarny z micro-blue */
  --bg-card:       #141925;   /* Karty */
  --bg-card-hover: #1A2133;   /* Karty hover */
  --bg-input:      #1A2133;   /* Inputy */
  --bg-sidebar:    #080C14;   /* Sidebar — jeszcze ciemniejszy */
  --bg-modal:      #141925;   /* Modale */

  /* Borders */
  --border-subtle:  #1E2A3E;
  --border-default: #2A3650;
  --border-strong:  #3B4D6B;

  /* Text */
  --text-primary:   #E8ECF2;
  --text-secondary: #9BA4B5;
  --text-tertiary:  #6B7A90;
  --text-disabled:  #4A5568;

  /* Primary (navy shifts lighter in dark mode) */
  --dlug-500-dark:  #5A8FDB;   /* Linki, focus ring */
  --dlug-400-dark:  #89B5EC;   /* Ikony sidebar */
  --dlug-300-dark:  #B8DBFD;   /* Hover tekst */

  /* Accent green (slightly desaturated for dark bg) */
  --accent-500-dark: #34D07E;
  --accent-700-dark: #10B461;

  /* Status colors: identyczne hue, nieco jaśniejsze */
  --warn-500-dark:   #FBBF24;
  --danger-500-dark:  #F87171;

  /* Shadows: blue-black tinted, stronger opacity */
  --shadow-sm-dark:  0 1px 3px 0 rgba(0, 0, 0, 0.3);
  --shadow-md-dark:  0 4px 6px -1px rgba(0, 0, 0, 0.4);
  --shadow-lg-dark:  0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

Reguła dark mode: Nigdy nie invertować kolorów mechanicznie. Każdy token ma oddzielną wartość dark — ręcznie dobrane. Kontrast tekst-na-tle musi spełniać WCAG 2.1 AA także w dark mode (testować osobno).
