/**
 * Tier 10 — E2E test scenario catalog. Used by Playwright runner + readiness gate.
 */
export interface E2EScenario {
  id: string;
  area: "auth" | "wizard" | "billing" | "affiliate" | "case" | "i18n" | "admin";
  title: string;
  steps: string[];
  smoke?: boolean;
}

export const E2E_SCENARIOS: E2EScenario[] = [
  {
    id: "auth.signup",
    area: "auth",
    title: "User signs up with email",
    steps: [
      "GOTO /rejestracja",
      "FILL email + password",
      "SUBMIT",
      "EXPECT redirect to /panel",
      "EXPECT welcome drip enrollment row in DB",
    ],
    smoke: true,
  },
  {
    id: "wizard.exekucja.happy",
    area: "wizard",
    title: "Generate exekucja case PDF",
    steps: [
      "LOGIN test@dlugomat.pl",
      "GOTO /panel/nowa-sprawa",
      "SELECT case_type=exekucja",
      "FILL wizard fields",
      "CLICK Generate",
      "EXPECT document.kind=exekucja_pismo present",
    ],
    smoke: true,
  },
  {
    id: "billing.checkout.starter.monthly",
    area: "billing",
    title: "Subscribe to Starter monthly",
    steps: [
      "LOGIN test@dlugomat.pl",
      "GOTO /cennik/subskrypcje",
      "CLICK Starter Monthly",
      "ON stripe test card 4242 4242 4242 4242",
      "EXPECT subscription.status=active",
    ],
    smoke: true,
  },
  {
    id: "billing.portal",
    area: "billing",
    title: "Customer portal opens",
    steps: ["LOGIN user_with_active_sub", "GOTO /panel/subskrypcja", "CLICK Manage billing", "EXPECT stripe portal URL"],
  },
  {
    id: "affiliate.signup",
    area: "affiliate",
    title: "Affiliate signs up + slug unique",
    steps: ["GOTO /program-afiliacyjny/zarejestruj", "FILL form", "SUBMIT", "EXPECT affiliate_accounts row + slug"],
  },
  {
    id: "case.timeline",
    area: "case",
    title: "Case timeline renders deadlines",
    steps: ["LOGIN", "GOTO /panel/sprawa/<id>", "EXPECT timeline events ordered desc"],
  },
  {
    id: "i18n.cz",
    area: "i18n",
    title: "CZ locale resolves on dlugomat.cz",
    steps: ["GOTO https://dlugomat.cz/", "EXPECT html lang=cs", "EXPECT navigation in Czech"],
  },
  {
    id: "admin.flags.toggle",
    area: "admin",
    title: "Admin toggles a feature flag",
    steps: [
      "LOGIN admin",
      "GOTO /admin/feature-flags",
      "TOGGLE flag pricing_v2_promo",
      "EXPECT audit log entry feature_flag.update",
    ],
  },
];

export function listSmokeScenarios(): E2EScenario[] {
  return E2E_SCENARIOS.filter((s) => s.smoke);
}
