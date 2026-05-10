# 3.12 — STANY PUSTE I BŁĘDY

_source: SPEC_BRAND · tags: frontend, brand · line 1280 · 2202 chars_

EMPTY STATE — Brak spraw:
  Container: center, max-width 400px, py-16
  Ilustracja: geometric shield with checkmark, 120x120px,
    colors: dlug-200 (shield), accent-300 (check)
    Styl: monoline 2px, geometric, flat
  H3: "Brak aktywnych spraw" Inter 600 18px iron-800
  P: "Gdy wygenerujesz pierwsze pismo — pojawi się tutaj.
      Zacznij od skanowania dokumentu."
      Inter 400 15px iron-500, center, mt-2
  CTA: [Skanuj dokument →] ghost button, dlug-500, mt-6

EMPTY STATE — Brak dokumentów:
  Ikona: FileX, 80px, iron-300
  H3: "Brak dokumentów"
  P: "Wygenerowane pisma pojawią się na tej liście."
  CTA: [Utwórz nowe pismo →]

ERROR STATE — Błąd serwera (500):
  Container: center, max-width 400px, py-16
  Ikona: ServerCrash, 80px, danger-300
  H3: "Coś poszło nie tak" Inter 600 18px iron-800
  P: "Nasz serwer potrzebuje chwili. Spróbuj ponownie za minutę.
      Jeśli problem się powtarza — napisz do nas."
      Inter 400 15px iron-500
  CTA: [Spróbuj ponownie] primary, dlug-500
  Link: "Napisz do wsparcia →" text link, iron-600

ERROR STATE — 404:
  Minimalistyczny layout (bez sidebara)
  H1: "404" Space Grotesk 700 96px iron-200
  P: "Ta strona nie istnieje lub została przeniesiona."
     Inter 400 16px iron-600
  CTA: [Wróć do panelu →] primary, dlug-500

ERROR STATE — Brak połączenia:
  Toast notification (top-center):
    Bg: warn-50, border warn-200, radius-lg, shadow-lg, p-4
    Ikona: WifiOff 20px warn-600
    "Brak połączenia z internetem. Sprawdź sieć i odśwież stronę."
    Inter 14px 500 iron-800
    Auto-dismiss: never (persist until online)
    On reconnect: auto-replace with success toast:
      "Połączenie przywrócone ✓" (accent-500, auto-dismiss 3s)

LOADING STATES:
  Skeleton screens — NIE spinnery.
  Skeleton: bg iron-100, radius-md, animate-pulse (opacity 0.4→1→0.4, 1.5s)
  Odwzoruj kształt treści: prostokąty dla tekstu (h-4 rounded,
  różne width: 100%, 75%, 60%), kwadraty dla ikon (w-10 h-10),
  karty dla kart (w-full h-32).

  Wyjątek — AI generation:
    Zamiast skeleton: typewriter effect (patrz 3.6.4 krok 4)
    + processing bar (indeterminate, dlug-500, h-1, animate)
    + label: "Generuję pismo... (~10 sekund)" Inter 14px 500 iron-600
