#!/usr/bin/env bash
# =============================================================================
# Długomat — interaktywny skrypt deployu (Vercel + Supabase)
# =============================================================================
# Uruchom z roota repo:   bash scripts/deploy.sh
#
# Skrypt jest BEZPIECZNY i IDEMPOTENTNY:
#   - nie commituje sekretów,
#   - przed każdym destrukcyjnym krokiem pyta o potwierdzenie,
#   - można go uruchamiać wielokrotnie.
#
# Wymagania wstępne (zainstaluj raz):
#   npm i -g vercel
#   npm i -g supabase   (lub: brew install supabase/tap/supabase)
#
# Pełna checklista i tabela ENV: docs/DEPLOY_QUICKSTART.md
# =============================================================================
set -euo pipefail

# --- Kolory -------------------------------------------------------------------
BOLD='\033[1m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
info()  { echo -e "${BLUE}▸${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}⚠${NC} $*"; }
err()   { echo -e "${RED}✗${NC} $*" >&2; }
step()  { echo -e "\n${BOLD}━━━ $* ━━━${NC}"; }

confirm() {
  read -r -p "$(echo -e "${YELLOW}?${NC} $1 [t/N] ")" ans
  [[ "$ans" =~ ^([tTyY])$ ]]
}

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WEB="$ROOT/apps/web"
cd "$ROOT"

# 7 zmiennych twardo wymaganych przez next.config.mjs (build rzuca bez nich).
REQUIRED_ENV=(
  NEXT_PUBLIC_APP_URL
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  STRIPE_SECRET_KEY
  STRIPE_WEBHOOK_SECRET
  CRON_SECRET
)

# =============================================================================
step "0. Sprawdzenie narzędzi (preflight)"
# =============================================================================
MISSING_TOOLS=0
for tool in node npm git; do
  if command -v "$tool" >/dev/null 2>&1; then ok "$tool: $($tool --version 2>&1 | head -1)"; else err "Brak: $tool"; MISSING_TOOLS=1; fi
done
if command -v vercel >/dev/null 2>&1; then ok "vercel CLI: $(vercel --version 2>&1 | head -1)"; else warn "Brak vercel CLI → npm i -g vercel"; fi
if command -v supabase >/dev/null 2>&1; then ok "supabase CLI: $(supabase --version 2>&1 | head -1)"; else warn "Brak supabase CLI → npm i -g supabase"; fi
[[ "$MISSING_TOOLS" == "1" ]] && { err "Zainstaluj brakujące narzędzia i uruchom ponownie."; exit 1; }

# =============================================================================
step "1. Jakość kodu (typecheck + lint + build lokalny)"
# =============================================================================
if confirm "Uruchomić typecheck + lint + build lokalnie (zalecane przed deployem)?"; then
  ( cd "$WEB"
    info "tsc --noEmit ..."; npx tsc --noEmit && ok "Typecheck OK"
    info "next lint ..."; npx next lint && ok "Lint OK"
    info "next build (z SKIP_PROD_ENV_CHECK=1 — tylko test kompilacji) ..."
    SKIP_PROD_ENV_CHECK=1 npx next build && ok "Build OK"
  )
else
  warn "Pominięto lokalną walidację."
fi

# =============================================================================
step "2. Supabase — migracje bazy (57 plików w supabase/migrations)"
# =============================================================================
if command -v supabase >/dev/null 2>&1; then
  echo "Aby wypchnąć schemat na produkcyjny projekt Supabase:"
  echo "  1) Utwórz projekt na https://supabase.com/dashboard"
  echo "  2) Skopiuj Project Ref (Settings → General → Reference ID)"
  echo "  3) supabase login            # raz, otwiera przeglądarkę"
  echo "  4) supabase link --project-ref <PROJECT_REF>"
  echo "  5) supabase db push          # uruchamia wszystkie migracje"
  echo ""
  if confirm "Czy chcesz teraz zlinkować i wypchnąć migracje (supabase db push)?"; then
    read -r -p "Podaj Supabase PROJECT_REF: " PROJECT_REF
    if [[ -n "$PROJECT_REF" ]]; then
      supabase link --project-ref "$PROJECT_REF" || warn "link nieudany (może już zlinkowany)"
      if confirm "POTWIERDŹ: uruchomić 'supabase db push' na projekcie $PROJECT_REF?"; then
        supabase db push && ok "Migracje wypchnięte"
      fi
    fi
  fi
  echo ""
  info "Edge Functions (opcjonalnie): supabase functions deploy deadline-cron image-resize push-fanout scheduled-cleanup"
else
  warn "Pomijam Supabase — brak CLI. Zainstaluj: npm i -g supabase"
fi

# =============================================================================
step "3. Vercel — link projektu"
# =============================================================================
if command -v vercel >/dev/null 2>&1; then
  if [[ -d "$ROOT/.vercel" ]]; then
    ok "Projekt już zlinkowany z Vercel (.vercel istnieje)"
  else
    info "Projekt nie jest zlinkowany. UWAGA: monorepo → Root Directory = apps/web"
    if confirm "Uruchomić 'vercel link' teraz?"; then
      vercel link && ok "Zlinkowano"
      warn "W panelu Vercel ustaw: Settings → General → Root Directory = apps/web"
    fi
  fi

  # --- ENV ---
  step "4. Vercel — zmienne środowiskowe (production)"
  echo "7 zmiennych WYMAGANYCH (bez nich build na Vercel rzuci błędem):"
  for k in "${REQUIRED_ENV[@]}"; do echo "   - $k"; done
  echo ""
  echo "Dodaj je interaktywnie (wartości NIE są logowane do repo):"
  echo "   vercel env add <NAZWA> production"
  echo "lub hurtowo z lokalnego pliku .env.production:"
  echo "   while IFS='=' read -r k v; do [[ \"\$k\" =~ ^[A-Z] ]] && echo \"\$v\" | vercel env add \"\$k\" production; done < .env.production"
  echo ""
  if confirm "Dodać teraz 7 wymaganych zmiennych interaktywnie?"; then
    for k in "${REQUIRED_ENV[@]}"; do
      if confirm "  Dodać $k?"; then vercel env add "$k" production || warn "  $k pominięte/istnieje"; fi
    done
  fi

  # --- Deploy ---
  step "5. Vercel — deploy produkcyjny"
  if confirm "POTWIERDŹ: uruchomić 'vercel --prod' (deploy produkcyjny)?"; then
    vercel --prod && ok "Deploy wystartował"
  else
    warn "Pominięto deploy. Uruchom ręcznie: vercel --prod"
  fi
else
  warn "Pomijam Vercel — brak CLI. Zainstaluj: npm i -g vercel"
fi

# =============================================================================
step "6. Po deployu — smoke test"
# =============================================================================
cat <<'EOF'
Po deployu sprawdź:
  - https://<twoja-domena>/api/health          → { ok: true }
  - https://<twoja-domena>/logowanie           → rejestracja/logowanie
  - /panel/skaner                              → upload skanu → OCR
  - /panel/moje-zadluzenie/kreator             → generowanie pisma
  - Stripe → Developers → Webhooks → endpoint:
      https://<twoja-domena>/api/stripe/webhook  (Events: checkout.session.completed, ...)

Pełna lista: docs/DEPLOY_QUICKSTART.md  oraz  docs/LAUNCH_CHECKLIST.md
EOF

ok "Skrypt zakończony."
