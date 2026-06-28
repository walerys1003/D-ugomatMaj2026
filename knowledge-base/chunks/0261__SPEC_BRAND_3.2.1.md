# 3.2.1 — Paleta Primary — Shield Navy

_source: SPEC_BRAND · tags: frontend, brand · line 17 · 1343 chars_

Navy to kolor instytucji finansowych, kancelarii prawnych, ubezpieczycieli — a więc dokładnie tych podmiotów, z którymi użytkownik walczy. Długomat przejmuje ten kolor, by stanąć na równi z przeciwnikiem. To nie granat „internetowy" ani „startupowy" — to granat gabinetowy, ciężki, niezachwiany.
:root {
  --dlug-950: #060E1F;   /* Tło modali, overlay */
  --dlug-900: #0B1D3A;   /* Sidebar, nawigacja główna, hero gradient START */
  --dlug-850: #0F2750;   /* Hover state sidebar */
  --dlug-800: #132D5E;   /* Hero gradient END, nagłówki sekcji */
  --dlug-700: #1B3F82;   /* Aktywne elementy nawigacji, border-left sprawa pilna */
  --dlug-600: #2354A6;   /* Linki, ikony aktywne */
  --dlug-500: #2B69CA;   /* Primary button background, focus ring */
  --dlug-400: #5A8FDB;   /* Ikony sidebar nieaktywne, tekst pomocniczy */
  --dlug-300: #89B5EC;   /* Badge'e informacyjne, tło pól disabled */
  --dlug-200: #B8DBFD;   /* Tło kart informacyjnych (light) */
  --dlug-100: #E0EFFF;   /* Tło sekcji, hover kart */
  --dlug-50:  #F0F7FF;   /* Subtelne tło stron, alternating rows */
}

Tailwind config extension:
dlugomat: {
  950: '#060E1F',
  900: '#0B1D3A',
  850: '#0F2750',
  800: '#132D5E',
  700: '#1B3F82',
  600: '#2354A6',
  500: '#2B69CA',
  400: '#5A8FDB',
  300: '#89B5EC',
  200: '#B8DBFD',
  100: '#E0EFFF',
  50:  '#F0F7FF',
}
