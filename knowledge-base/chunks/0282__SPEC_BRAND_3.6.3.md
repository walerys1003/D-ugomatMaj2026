# 3.6.3 — Walidacja w wizardzie

_source: SPEC_BRAND · tags: frontend, ai-engine, brand, strategy · line 537 · 1055 chars_

STRATEGIA WALIDACJI:
  Moment: on blur (po opuszczeniu pola) + on submit (przy próbie przejścia dalej)
  NIE on change — użytkownik w stresie nie potrzebuje czerwonych
  komunikatów podczas pisania.

STYL BŁĘDU:
  Input border: danger-500 (2px, transition 150ms)
  Poniżej inputa: flex row, gap-2, mt-1.5
    Ikona: AlertCircle 14px danger-500
    Tekst: Inter 13px 500 danger-600
    Np: "Podaj sygnaturę akt w formacie: I Nc 1234/26"

  Input w stanie błędu: bg danger-50 (subtelne czerwone tło)

STYL SUKCESU (dla pól krytycznych — np. sygnatura, PESEL):
  Input border: accent-500 (2px)
  Ikona: CheckCircle 14px accent-600 wewnątrz inputa (right side)
  Brak dodatkowego tekstu — sam zielony check wystarczy.

STYL FOCUS:
  Input border: dlug-500 (2px)
  Box-shadow: --shadow-focus (0 0 0 3px rgba(43, 105, 202, 0.35))
  Transition: all 150ms ease

POLA WYMAGANE:
  Label: Inter 14px 600 iron-800
  Asterisk: danger-500, ml-0.5 (nie słowo "wymagane" — asterisk wystarczy)

POLA OPCJONALNE:
  Label z dopiskiem "(opcjonalne)" — Inter 14px 400 iron-500
