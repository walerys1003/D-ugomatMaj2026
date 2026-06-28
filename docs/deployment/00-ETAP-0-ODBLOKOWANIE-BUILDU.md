# ETAP 0 — Odblokowanie buildu (BLOKER)

> **Cel:** doprowadzić `next build` do stanu **EXIT 0**. To jest pierwszy krok — bez niego
> nie zbudujesz aplikacji, nie wdrożysz na Vercel, nie odpalisz testów E2E.
> **Czas:** ~30 minut. **Trudność:** niska.

⬅️ [Powrót do indeksu](./README.md) · Następny → [ETAP 1: Baza Supabase](./01-ETAP-1-BAZA-SUPABASE.md)

---

## 0.1. Diagnoza — dlaczego build się wywala

Po uruchomieniu builda:

```bash
cd apps/web
npx next build
```

dostajesz błędy webpacka:

```
Module not found: Can't resolve 'stripe'
  ./app/api/billing/portal/route.ts
    → ./lib/billing/subscriptions.ts
    → ./lib/billing/upgrade-flow.ts
  ./app/api/billing/change-plan/route.ts
    → ./lib/coupons/coupon-engine.ts

Module not found: Can't resolve 'pdf-lib'
  ./app/api/invoices/[id]/route.ts
    → ./lib/invoices/invoice-generator.ts

Build failed because of webpack errors
```

### Przyczyna

Kod **importuje** biblioteki `stripe` i `pdf-lib`, ale **nie ma ich** w `apps/web/package.json`
w sekcji `dependencies`. Najprawdopodobniej zostały kiedyś dodane lokalnie i nie trafiły do
pliku zależności (albo `package.json` był edytowany ręcznie). To czysto „higieniczny" bloker.

### Pliki, które importują te biblioteki (potwierdzone w repo)

**`stripe`** używają:
- `apps/web/lib/billing/customer-portal.ts`
- `apps/web/lib/billing/plans.ts`
- `apps/web/lib/billing/subscriptions.ts`
- `apps/web/lib/billing/upgrade-flow.ts`
- `apps/web/lib/coupons/coupon-engine.ts`

**`pdf-lib`** używają:
- `apps/web/lib/documents/pdf-renderer.ts`
- `apps/web/lib/invoices/invoice-generator.ts`
- `apps/web/lib/pdf/pdfa-conformance.ts`

> Weryfikacja na własne oczy:
> ```bash
> grep -rln "from \"stripe\"\|from 'stripe'" apps/web/lib
> grep -rln "pdf-lib" apps/web/lib
> ```

---

## 0.2. ZADANIE 0.1 — Dodać `stripe` i `pdf-lib` do zależności

> **Uwaga o wersjach:** poniżej podaję wersje sprawdzone jako kompatybilne z Next 14.2 / Node 20.
> Jeśli zespół ma politykę „latest", użyj `@latest` i przetestuj build. Zalecam **pinować** wersje
> (bez `^`), tak jak reszta tego repo (patrz `package.json` — wszystkie zależności są pinowane).

Z katalogu **głównego repo** (monorepo, npm workspaces):

```bash
# stripe SDK (serwerowy) — wersja zgodna z API "2024-..."
npm install --workspace apps/web stripe@17.4.0

# pdf-lib — generowanie/edycja PDF (faktury, render pism, PDF/A)
npm install --workspace apps/web pdf-lib@1.17.1
```

> Jeśli `--workspace` nie działa w Twojej wersji npm:
> ```bash
> cd apps/web && npm install stripe@17.4.0 pdf-lib@1.17.1
> ```

Po instalacji `apps/web/package.json` → `dependencies` powinno zawierać:

```jsonc
{
  "dependencies": {
    // ... istniejące ...
    "pdf-lib": "1.17.1",
    "stripe": "17.4.0"
    // ...
  }
}
```

> ℹ️ `pdf-lib` ma własne typy TS — **nie** potrzebujesz `@types/pdf-lib`.
> `stripe` również dostarcza typy w pakiecie.

---

## 0.3. ZADANIE 0.2 — Sprawdzić wersję API Stripe w kodzie

Stripe SDK wymaga zadeklarowania `apiVersion`. Sprawdź, jak inicjalizowany jest klient:

```bash
grep -rn "new Stripe(" apps/web/lib
```

Jeśli zobaczysz coś w stylu:

```ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});
```

to **zostaw bez zmian** — to działa. Jeśli TypeScript zgłosi błąd typu na `apiVersion`
(bo SDK 17.x oczekuje nowszej daty), dopasuj wartość do tej z błędu kompilatora, np.:

```ts
apiVersion: "2024-12-18.acacia",
```

> **Nie zgaduj** wartości — TypeScript w komunikacie błędu poda dokładnie akceptowane wartości.

---

## 0.4. ZADANIE 0.3 — Zweryfikować build

```bash
# z katalogu głównego
npm --workspace apps/web run build
# lub:
cd apps/web && npx next build
```

**Oczekiwany rezultat:** brak `Module not found`, na końcu `✓ Compiled successfully` i wygenerowane
trasy (`Route (app)` lista). Build kończy się **EXIT 0**.

Dodatkowo (sanity check):

```bash
cd apps/web
npx tsc --noEmit   # ma być EXIT 0
npx next lint      # ma być EXIT 0 (warningi dopuszczalne)
```

---

## 0.5. Częste problemy (troubleshooting)

| Objaw | Przyczyna | Rozwiązanie |
|---|---|---|
| `Type error: ... apiVersion` | SDK 17.x oczekuje nowszej daty API | Wpisz datę z komunikatu błędu (patrz 0.3) |
| Build dalej nie widzi pakietu | `node_modules` z innego workspace | `rm -rf node_modules apps/web/node_modules && npm install` |
| `pdf-lib` ostrzega o `fontkit` | opcjonalny submoduł do custom fontów | dodaj `@pdf-lib/fontkit` tylko jeśli kod go importuje (`grep -rn fontkit apps/web`) |
| Inne `Module not found` | kolejna brakująca zależność | dodaj analogicznie: `npm install --workspace apps/web <pakiet>` |

---

## 0.6. Commit (zgodnie z polityką repo)

> **Polityka repo: każda zmiana kodu = commit.** Pracujemy na branchu `genspark_ai_developer`.

```bash
git checkout genspark_ai_developer
git add apps/web/package.json apps/web/package-lock.json
git commit -m "fix(build): add missing stripe + pdf-lib deps to unblock next build"
git push origin genspark_ai_developer
```

---

## 0.7. Definition of Done — ETAP 0

- [ ] `stripe` i `pdf-lib` są w `apps/web/package.json` → `dependencies` (pinowane wersje).
- [ ] `npm --workspace apps/web run build` kończy się **EXIT 0**.
- [ ] `npx tsc --noEmit` → EXIT 0.
- [ ] Zmiana zacommitowana i wypchnięta na `genspark_ai_developer`.

✅ Po odhaczeniu → przejdź do **[ETAP 1: Baza Supabase](./01-ETAP-1-BAZA-SUPABASE.md)**.
