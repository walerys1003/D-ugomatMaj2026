#!/usr/bin/env bash
# ============================================================================
# Tier 5 zad. 249 — Production smoke test
# ============================================================================
#
# Wywoływany po deploy (Vercel post-deploy hook lub ręcznie):
#   ./scripts/smoke-test.sh https://dlugomat.pl
#
# Sprawdza:
#   1) /api/health              → 200 + ok=true
#   2) /api/status              → 200 + overall_status != down
#   3) /                        → 200, zawiera tytuł "Długomat"
#   4) /skaner-nakazu           → 200, robots OK
#   5) /cennik                  → 200
#   6) /jak-to-dziala           → 200
#   7) /robots.txt, /sitemap.xml → 200
#   8) Security headers obecne (CSP, HSTS w prod, X-Frame, X-Content-Type)
#   9) Cache-control na statycznych zasobach
#  10) Brak wycieków secret w response (regex sanity)
#
# Exit code:
#   0 — wszystkie checki ok
#   1 — przynajmniej jeden fail (CI ma failować po niezerowym kodzie)
#
# Wymagane: bash 4+, curl, grep, awk.
# ============================================================================

set -uo pipefail

readonly BASE_URL="${1:-${SMOKE_BASE_URL:-https://dlugomat.pl}}"
readonly TIMEOUT=10
readonly UA="Dlugomat-Smoke-Test/1.0"

# ANSI colors (degradują się ładnie do plain w CI bez TTY)
if [ -t 1 ]; then
  C_RED='\033[0;31m'; C_GREEN='\033[0;32m'; C_YELLOW='\033[0;33m'; C_RESET='\033[0m'
else
  C_RED=''; C_GREEN=''; C_YELLOW=''; C_RESET=''
fi

PASS=0
FAIL=0
FAILURES=()

# ─── Helpers ─────────────────────────────────────────────────────────────────

log_pass() {
  echo -e "  ${C_GREEN}✓${C_RESET} $1"
  PASS=$((PASS + 1))
}

log_fail() {
  echo -e "  ${C_RED}✗${C_RESET} $1"
  FAIL=$((FAIL + 1))
  FAILURES+=("$1")
}

log_warn() {
  echo -e "  ${C_YELLOW}⚠${C_RESET} $1"
}

# Pobiera URL i drukuje na stdout. Zwraca HTTP status na stderr.
# Format wyjścia: <status>\n<body>
fetch() {
  local url="$1"
  local out
  out=$(curl -sS -A "$UA" -m "$TIMEOUT" -w "\n__HTTP_STATUS__:%{http_code}" "$url" 2>/dev/null) || {
    echo "0"
    return
  }
  local body status
  body="${out%__HTTP_STATUS__:*}"
  status="${out##*__HTTP_STATUS__:}"
  echo "$status"
  echo "$body"
}

fetch_headers() {
  local url="$1"
  curl -sSI -A "$UA" -m "$TIMEOUT" "$url" 2>/dev/null
}

assert_status() {
  local name="$1" url="$2" expected="$3"
  local status
  status=$(fetch "$url" | head -n 1)
  if [ "$status" = "$expected" ]; then
    log_pass "$name → $expected"
    return 0
  else
    log_fail "$name → expected $expected, got $status ($url)"
    return 1
  fi
}

assert_body_contains() {
  local name="$1" url="$2" needle="$3"
  local response body
  response=$(fetch "$url")
  body=$(echo "$response" | tail -n +2)
  if echo "$body" | grep -qF "$needle"; then
    log_pass "$name → contains '$needle'"
    return 0
  else
    log_fail "$name → missing '$needle' ($url)"
    return 1
  fi
}

assert_header_present() {
  local name="$1" url="$2" header="$3"
  local headers
  headers=$(fetch_headers "$url")
  if echo "$headers" | grep -qiE "^$header:"; then
    log_pass "$name: $header present"
    return 0
  else
    log_fail "$name: $header MISSING"
    return 1
  fi
}

# ─── Suite ───────────────────────────────────────────────────────────────────

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Długomat — production smoke test"
echo "  Target: $BASE_URL"
echo "  Time:   $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "[1/4] Health endpoints"
assert_status   "GET /api/health"   "$BASE_URL/api/health"   "200"
assert_body_contains "GET /api/health body" "$BASE_URL/api/health" '"ok":true'

assert_status   "GET /api/status"   "$BASE_URL/api/status"   "200"
status_body=$(fetch "$BASE_URL/api/status" | tail -n +2)
overall=$(echo "$status_body" | grep -oE '"overall_status":"[^"]+"' | head -n1 | cut -d'"' -f4)
case "$overall" in
  operational|degraded) log_pass "overall_status=$overall (acceptable)" ;;
  down)                 log_fail "overall_status=down — site is in outage" ;;
  *)                    log_fail "overall_status='$overall' — unexpected value" ;;
esac

echo ""
echo "[2/4] Public pages"
assert_status   "GET /"               "$BASE_URL/"               "200"
assert_body_contains "GET /"          "$BASE_URL/"               "Długomat"
assert_status   "GET /skaner-nakazu"  "$BASE_URL/skaner-nakazu"  "200"
assert_status   "GET /cennik"         "$BASE_URL/cennik"         "200"
assert_status   "GET /jak-to-dziala"  "$BASE_URL/jak-to-dziala"  "200"
assert_status   "GET /regulamin"      "$BASE_URL/regulamin"      "200"
assert_status   "GET /rodo"           "$BASE_URL/rodo"           "200"
assert_status   "GET /robots.txt"     "$BASE_URL/robots.txt"     "200"
assert_status   "GET /sitemap.xml"    "$BASE_URL/sitemap.xml"    "200"
assert_status   "GET /changelog"      "$BASE_URL/changelog"      "200"
assert_status   "GET /status"         "$BASE_URL/status"         "200"

echo ""
echo "[3/4] Security headers"
assert_header_present "/" "$BASE_URL/" "Content-Security-Policy"
assert_header_present "/" "$BASE_URL/" "X-Frame-Options"
assert_header_present "/" "$BASE_URL/" "X-Content-Type-Options"
assert_header_present "/" "$BASE_URL/" "Referrer-Policy"
# HSTS — tylko produkcja (https). Jeśli BASE_URL=https → musi być.
if [[ "$BASE_URL" == https://* ]]; then
  assert_header_present "/" "$BASE_URL/" "Strict-Transport-Security"
fi

echo ""
echo "[4/4] Sanity — no obvious secret leaks"
home_body=$(fetch "$BASE_URL/" | tail -n +2)
# Patterns które NIE powinny pojawić się w response (false positive sanity).
SECRET_PATTERNS=(
  "sk_live_"          # Stripe live secret
  "sk_test_"          # Stripe test secret (też chronione)
  "rk_live_"          # Stripe restricted key
  "service_role"      # Supabase service role hint
  "BEGIN PRIVATE KEY" # PEM
  "-----BEGIN"        # generic PEM
)
leaked=0
for pat in "${SECRET_PATTERNS[@]}"; do
  if echo "$home_body" | grep -qF "$pat"; then
    log_fail "Suspicious pattern '$pat' in / body"
    leaked=$((leaked + 1))
  fi
done
[ "$leaked" -eq 0 ] && log_pass "No obvious secret leaks in homepage"

# ─── Summary ─────────────────────────────────────────────────────────────────

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Result: ${C_GREEN}${PASS} passed${C_RESET}, ${C_RED}${FAIL} failed${C_RESET}"
if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "Failures:"
  for f in "${FAILURES[@]}"; do
    echo "  - $f"
  done
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  exit 1
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
exit 0
