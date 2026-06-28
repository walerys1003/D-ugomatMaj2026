# Radca prawny — Consent Checklist & Runbook

Status: **BLOCKING dla launch produkcyjnego** (Plan v1 Priority 3)
Owner: Founder / Compliance
Last updated: 2026-05-27

---

## 1. Dlaczego ten dokument istnieje

Landing Długomat (komponenty `trust-bar.tsx` i `cta-band.tsx`) zawiera
sekcje wyświetlające dane radcy prawnego nadzorującego merytorycznie
szablony pism procesowych. Pokazywanie nieprawdziwego nazwiska + numeru
wpisu KIRP to:

- **fraud reklamowy** (UOKiK, art. 7 ustawy o przeciwdziałaniu nieuczciwym praktykom rynkowym),
- **naruszenie ustawy o radcach prawnych** (art. 12 — zakaz podszywania się),
- **ryzyko RODO** (publikacja danych osobowych bez podstawy z art. 6 RODO).

Dlatego do czasu uzyskania kompletu danych + zgody — flaga
`NEXT_PUBLIC_RADCA_ENABLED=false`, landing wyświetla neutralny fallback
"Współpraca z radcą prawnym — informacja dostępna wkrótce".

---

## 2. Architektura gating'u

```
lib/features/radca-flag.ts
  ├─ RADCA_ENABLED        (bool — strict 'true')
  └─ getRadcaInfo()       (RadcaInfo | null)
       ├─ wymaga: ENABLED=true + NAME + KIRP
       ├─ opcjonalne: SCOPE / OIRP / INITIALS (mają defaulty)
       └─ safety: zwraca null gdy NAME lub KIRP puste

components/landing/trust-bar.tsx
  └─ Surface raised (mt-12, max-w-3xl)
       ├─ radca === null → "Współpraca z radcą prawnym — w przygotowaniu"
       └─ radca !== null → name + KIRP + OIRP + scope + initials

components/landing/cta-band.tsx
  └─ Mono fine-print (max-w-[42ch])
       ├─ radca === null → "Długomat to fintech-narzędzie..."
       └─ radca !== null → "Nad każdym szablonem czuwa {name}, KIRP {kirp}..."
```

Layout identyczny w obu wariantach — toggle flagi nie psuje
kompozycji wizualnej landing.

---

## 3. Checklist zgody radcy (BLOCKING)

Przed ustawieniem `NEXT_PUBLIC_RADCA_ENABLED=true` musisz mieć:

### 3.1 Umowa o nadzór merytoryczny

- [ ] Podpisana umowa cywilnoprawna (zlecenie / B2B / inna)
- [ ] Określony zakres: jakie szablony, jak często weryfikacja
      (rekomendacja: kwartalny audit + ad-hoc consult przy zmianach KPC)
- [ ] Wynagrodzenie / forma rozliczenia
- [ ] Klauzula poufności (NDA na materiały robocze)
- [ ] OC zawodowe radcy obejmuje współpracę z Długomat
      (potwierdzenie od ubezpieczyciela)

### 3.2 Zgoda na publikację danych osobowych (RODO)

- [ ] **Pisemna zgoda** na publikację imienia i nazwiska w landing
      (RODO art. 6 ust. 1 lit. a — zgoda)
- [ ] Zgoda na publikację numeru wpisu KIRP
      (numer wpisu jest danych publicznym, ale lepiej mieć zgodę explicit)
- [ ] Zgoda na publikację cytatu / opisu zakresu współpracy
- [ ] Klauzula wycofania zgody — co się dzieje gdy radca cofnie zgodę
      (rekomendacja: 7 dni na wyłączenie flagi `NEXT_PUBLIC_RADCA_ENABLED=false`)
- [ ] Zgoda na transgraniczne przetwarzanie (jeśli hosting Vercel EU
      przetwarza dane poza EOG przez fallback CDN — sprawdzić)

### 3.3 Weryfikacja KIRP

- [ ] Numer wpisu z pieczęci radcy (format: PL-XXXX, np. WA-1234)
- [ ] Weryfikacja w wyszukiwarce KIRP:
      https://kirp.pl/szukaj-radcy/
      Imię + nazwisko + miasto OIRP → wpis aktywny, status: czynny
- [ ] Brak zawieszenia w wykonywaniu zawodu
- [ ] Brak postępowania dyscyplinarnego (zapytanie do OIRP)

### 3.4 Treść publikowana

- [ ] Imię i nazwisko: ______________________________
      (forma do publikacji — z tytułem / bez tytułu, ustal z radcą)
- [ ] Numer wpisu KIRP: ______________________________
      (z prefiksem OIRP, np. "WA-1234")
- [ ] Nazwa OIRP: ______________________________
      (np. "Okręgowa Izba Radców Prawnych w Warszawie")
- [ ] Zakres współpracy (max 120 znaków): _______________________
      _______________________________________________________________
      _______________________________________________________________
      (Przykład: "Konsultacja prawna w obszarze prawa konsumenckiego,
      windykacji oraz ochrony dłużników w postępowaniu egzekucyjnym.")
- [ ] Inicjały do awatara (max 2 znaki): __ __

---

## 4. Runbook — aktywacja flagi po uzyskaniu zgody

### 4.1 Lokalnie (test)

```bash
# 1. Skopiuj template (jeśli jeszcze nie masz .env.local)
cp apps/web/.env.example apps/web/.env.local

# 2. Edytuj .env.local — sekcja "Radca prawny — feature flag"
NEXT_PUBLIC_RADCA_ENABLED=true
NEXT_PUBLIC_RADCA_NAME=Anna Kowalska
NEXT_PUBLIC_RADCA_KIRP=WA-1234
NEXT_PUBLIC_RADCA_SCOPE=Konsultacja prawna w prawie konsumenckim i windykacji.
NEXT_PUBLIC_RADCA_OIRP=Okręgowa Izba Radców Prawnych w Warszawie
NEXT_PUBLIC_RADCA_INITIALS=AK

# 3. Restart dev server (env'y są snapshot'owane przy starcie)
pnpm --filter web dev

# 4. Sprawdź wizualnie:
#    - http://localhost:3000 → scroll do trust-bar
#    - sprawdź że nazwisko + KIRP + scope są poprawne
#    - scroll do cta-band → disclaimer z nazwiskiem
```

### 4.2 Vercel (production)

```bash
# 1. Vercel CLI lub Dashboard → Settings → Environment Variables
# 2. Dodaj 6 zmiennych (TYLKO production, nie preview):
#    NEXT_PUBLIC_RADCA_ENABLED=true
#    NEXT_PUBLIC_RADCA_NAME=<imię nazwisko>
#    NEXT_PUBLIC_RADCA_KIRP=<numer>
#    NEXT_PUBLIC_RADCA_SCOPE=<opis>
#    NEXT_PUBLIC_RADCA_OIRP=<izba>
#    NEXT_PUBLIC_RADCA_INITIALS=<2 znaki>
#
# 3. Redeploy (Vercel → Deployments → Redeploy)
#    NEXT_PUBLIC_* są inline'owane w bundle przy build — zmiana wymaga rebuild.
#
# 4. Verify production:
#    https://dlugomat.pl → trust-bar + cta-band → realne dane
#    curl -s https://dlugomat.pl | grep -E "KIRP nr" → ma się pojawić numer
```

### 4.3 Procedura cofnięcia zgody (emergency rollback)

Gdy radca wycofa zgodę:

```bash
# Opcja A — najszybsza (5 minut):
# Vercel Dashboard → Settings → Environment Variables
# Zmień NEXT_PUBLIC_RADCA_ENABLED z "true" na "false"
# Redeploy

# Opcja B — z lokalnego repo:
# Edytuj .env.production / lub usuń zmienne na Vercel
# git commit & push → automatyczny deploy

# Verify rollback:
curl -s https://dlugomat.pl | grep -c "Współpraca z radcą prawnym" # → 1 (fallback aktywny)
curl -s https://dlugomat.pl | grep -c "KIRP nr"                    # → 0
```

**SLA cofnięcia: 7 dni od żądania radcy** (zgodnie z umową).
W praktyce — kilka minut, bo to jeden env flag.

---

## 5. Compliance — checklist post-launch

Po aktywacji flagi:

- [ ] Screenshot landing z prawdziwymi danymi → archiwum
- [ ] Email do radcy z confirmation linkiem (jak wygląda live)
- [ ] Wpis do rejestru czynności przetwarzania (RCP — RODO art. 30)
  - Cel: publikacja danych nadzorującego radcy w materiale marketingowym
  - Podstawa: art. 6 ust. 1 lit. a RODO (zgoda)
  - Kategorie danych: imię, nazwisko, numer wpisu KIRP, OIRP
  - Retencja: do cofnięcia zgody lub zakończenia współpracy
  - Odbiorcy: publiczność strony www, hostingu Vercel/Cloudflare
- [ ] Update polityki prywatności — sekcja "Dane radcy prawnego"
- [ ] KIRP zgłoszenie (opcjonalne): czy OIRP wymaga zgłoszenia
      udziału w platformie legal-tech? Sprawdzić w lokalnym OIRP.

---

## 6. FAQ techniczne

**Q: Co jeśli ustawię ENABLED=true ale nie wpiszę KIRP?**
A: `getRadcaInfo()` zwróci `null` (safety fallback) — landing pokaże
fallback "Współpraca w przygotowaniu". Brak ryzyka wyrenderowania
"undefined" lub placeholdera.

**Q: Co jeśli ENABLED=1 zamiast true?**
A: `RADCA_ENABLED = process.env.NEXT_PUBLIC_RADCA_ENABLED === "true"`
— strict equals. "1", "yes", "TRUE" są **odrzucane**. Tylko literalne
"true" (lowercase) aktywuje.

**Q: Czy mogę użyć radcy bez podawania OIRP?**
A: Tak — OIRP ma default "Okręgowa Izba Radców Prawnych w Warszawie".
Ale rekomenduję podać poprawnie (numer wpisu KIRP jest powiązany z OIRP,
więc rozjazd to red flag dla compliance audit).

**Q: Czy testy pokrywają flagę?**
A: Tak — `tests/lib/radca-flag.test.ts` (12 testów):
- bool flag (4) — strict equals, edge cases
- getRadcaInfo (8) — null cases, full data, defaults, overrides

```bash
cd apps/web && npx vitest run tests/lib/radca-flag.test.ts
```

---

## 7. Linki

- KIRP — wyszukiwarka radców: https://kirp.pl/szukaj-radcy/
- Ustawa o radcach prawnych: https://isap.sejm.gov.pl/isap.nsf/DocDetails.xsp?id=WDU19820190145
- RODO art. 6 (podstawy przetwarzania): https://gdpr-info.eu/art-6-gdpr/
- Wzór zgody na publikację danych: docs/legal/zgoda-radca-publikacja.md *(do utworzenia)*
- Polityka prywatności: app/polityka-prywatnosci/page.tsx
