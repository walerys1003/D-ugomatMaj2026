/**
 * Tier 14 — Dashboard registry. Pre-built reports for product/finance/ops.
 */
export interface DashboardWidget {
  id: string;
  title: string;
  type: "scorecard" | "line" | "bar" | "funnel" | "table" | "heatmap";
  data_source: string; // endpoint path or RPC name
  refresh_seconds?: number;
  span: { col: number; row: number; w: number; h: number };
}

export interface Dashboard {
  id: string;
  title: string;
  audience: "ops" | "finance" | "product" | "exec";
  widgets: DashboardWidget[];
}

export const DASHBOARDS: Dashboard[] = [
  {
    id: "exec",
    title: "Executive overview",
    audience: "exec",
    widgets: [
      { id: "mrr", title: "MRR", type: "scorecard", data_source: "/api/analytics/revenue", span: { col: 0, row: 0, w: 3, h: 2 } },
      { id: "arr", title: "ARR", type: "scorecard", data_source: "/api/analytics/revenue", span: { col: 3, row: 0, w: 3, h: 2 } },
      { id: "active_users", title: "Aktywni 30d", type: "scorecard", data_source: "/api/analytics/users/active", span: { col: 6, row: 0, w: 3, h: 2 } },
      { id: "nps", title: "NPS", type: "scorecard", data_source: "/api/analytics/nps", span: { col: 9, row: 0, w: 3, h: 2 } },
      { id: "mrr_trend", title: "Trend MRR (12mo)", type: "line", data_source: "/api/analytics/revenue/trend", span: { col: 0, row: 2, w: 12, h: 4 } },
    ],
  },
  {
    id: "product",
    title: "Product analytics",
    audience: "product",
    widgets: [
      { id: "signup_funnel", title: "Lejek rejestracji", type: "funnel", data_source: "/api/analytics/funnel/signup", span: { col: 0, row: 0, w: 6, h: 4 } },
      { id: "wizard_funnel", title: "Lejek kreatora", type: "funnel", data_source: "/api/analytics/funnel/wizard", span: { col: 6, row: 0, w: 6, h: 4 } },
      { id: "cohorts", title: "Retencja kohortowa", type: "heatmap", data_source: "/api/analytics/cohorts", span: { col: 0, row: 4, w: 12, h: 6 } },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    audience: "finance",
    widgets: [
      { id: "revenue_30d", title: "Przychód 30d", type: "scorecard", data_source: "/api/analytics/revenue", span: { col: 0, row: 0, w: 3, h: 2 } },
      { id: "ltv", title: "LTV", type: "scorecard", data_source: "/api/analytics/revenue", span: { col: 3, row: 0, w: 3, h: 2 } },
      { id: "cac", title: "CAC (proxy)", type: "scorecard", data_source: "/api/analytics/cac", span: { col: 6, row: 0, w: 3, h: 2 } },
      { id: "vat_summary", title: "Podsumowanie VAT", type: "table", data_source: "/api/analytics/vat", span: { col: 0, row: 2, w: 12, h: 4 } },
    ],
  },
  {
    id: "ops",
    title: "Operations",
    audience: "ops",
    widgets: [
      { id: "errors", title: "Błędy 24h", type: "scorecard", data_source: "/api/analytics/errors/24h", span: { col: 0, row: 0, w: 3, h: 2 } },
      { id: "queue", title: "Kolejka webhooków", type: "scorecard", data_source: "/api/analytics/queue", span: { col: 3, row: 0, w: 3, h: 2 } },
      { id: "ai_cost", title: "Koszt AI 30d", type: "scorecard", data_source: "/api/analytics/ai/cost", span: { col: 6, row: 0, w: 3, h: 2 } },
      { id: "uptime", title: "Uptime 30d", type: "scorecard", data_source: "/api/analytics/uptime", span: { col: 9, row: 0, w: 3, h: 2 } },
    ],
  },
];

export function getDashboard(id: string): Dashboard | undefined {
  return DASHBOARDS.find((d) => d.id === id);
}
