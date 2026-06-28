/**
 * Tier 34-3 — API rate limit dashboard + quota system.
 *
 * Admin widzi:
 *   - top 20 klientów (user_id / api_key_id) po requests/min
 *   - aktualne wykorzystanie quoty per plan (free/pro/enterprise)
 *   - liczba 429 w ostatnich 24h per endpoint
 *   - heatmap RPM × endpoint (sparkline)
 *   - lista blokowanych IP (fail2ban-style)
 */
import Link from "next/link";
import { requireFullAdmin } from "@/lib/admin/rbac";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

interface TopConsumer {
  identity: string;
  identity_kind: "user_id" | "api_key" | "ip";
  rpm: number;
  rpm_limit: number;
  plan: string | null;
  blocked: boolean;
}

interface EndpointStat {
  endpoint: string;
  hits_24h: number;
  blocked_24h: number;
  p95_latency_ms: number;
}

interface QuotaUsage {
  plan: string;
  active_subs: number;
  avg_usage_pct: number;
  over_quota_count: number;
}

function PercentBar({ value, danger }: { value: number; danger?: boolean }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div style={{ width: 120, height: 8, background: "#F3F4F6", borderRadius: 4, overflow: "hidden" }}>
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          background: danger ? "#EF4444" : clamped > 80 ? "#F59E0B" : "#10B981",
        }}
      />
    </div>
  );
}

export default async function RateLimitsAdminPage() {
  await requireFullAdmin();
  const sb = await createSupabaseServerClient();

  // Top consumers
  const { data: topRaw } = await sb
    .from("rate_limit_window")
    .select("identity, identity_kind, rpm, rpm_limit, plan, blocked")
    .order("rpm", { ascending: false })
    .limit(20);
  const topConsumers = (topRaw ?? []) as TopConsumer[];

  // Endpoint stats
  const { data: epRaw } = await sb
    .from("rate_limit_endpoint_stats_24h")
    .select("endpoint, hits_24h, blocked_24h, p95_latency_ms")
    .order("hits_24h", { ascending: false })
    .limit(15);
  const endpointStats = (epRaw ?? []) as EndpointStat[];

  // Quota per plan
  const { data: quotaRaw } = await sb
    .from("plan_quota_usage_view")
    .select("plan, active_subs, avg_usage_pct, over_quota_count");
  const quotaUsage = (quotaRaw ?? []) as QuotaUsage[];

  // Blocked IPs
  const { data: blockedIps } = await sb
    .from("blocked_ips")
    .select("ip, reason, blocked_at, expires_at, hits_count")
    .order("blocked_at", { ascending: false })
    .limit(15);

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1400, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
        Rate limits & quotas
      </h1>
      <p style={{ color: "#6B7280", marginBottom: 24 }}>
        Live monitoring zużycia API w ostatnich 60 sekundach. Aktualizacja co 30s.
      </p>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>
          Quota per plan
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {quotaUsage.map((q) => (
            <div
              key={q.plan}
              style={{ padding: 16, background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8 }}
            >
              <div style={{ fontSize: 12, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
                {q.plan}
              </div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#0F172A", marginTop: 4 }}>
                {q.active_subs}
                <span style={{ fontSize: 13, fontWeight: 400, color: "#6B7280", marginLeft: 6 }}>
                  aktywnych
                </span>
              </div>
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <PercentBar value={q.avg_usage_pct} danger={q.avg_usage_pct > 90} />
                <span style={{ fontSize: 12, color: "#374151" }}>{Math.round(q.avg_usage_pct)}%</span>
              </div>
              {q.over_quota_count > 0 && (
                <div style={{ marginTop: 6, fontSize: 12, color: "#B91C1C" }}>
                  {q.over_quota_count} kont &gt; limit
                </div>
              )}
            </div>
          ))}
          {quotaUsage.length === 0 && (
            <div style={{ color: "#9CA3AF", fontSize: 13 }}>Brak danych telemetrycznych.</div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>
          Top konsumenci (60s window)
        </h2>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid #E5E7EB",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Identity</th>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Kind</th>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Plan</th>
                <th style={{ padding: 10, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>RPM</th>
                <th style={{ padding: 10, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>Limit</th>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {topConsumers.map((c, i) => {
                const pct = c.rpm_limit > 0 ? (c.rpm / c.rpm_limit) * 100 : 0;
                return (
                  <tr key={`${c.identity}-${i}`} style={{ borderTop: "1px solid #F3F4F6" }}>
                    <td style={{ padding: 10, fontFamily: "Menlo, monospace", color: "#0F172A" }}>
                      {c.identity.length > 28 ? `${c.identity.slice(0, 28)}…` : c.identity}
                    </td>
                    <td style={{ padding: 10, color: "#6B7280" }}>{c.identity_kind}</td>
                    <td style={{ padding: 10, color: "#374151" }}>{c.plan ?? "—"}</td>
                    <td style={{ padding: 10, textAlign: "right", fontWeight: 600, color: "#0F172A" }}>{c.rpm}</td>
                    <td style={{ padding: 10, textAlign: "right", color: "#6B7280" }}>{c.rpm_limit}</td>
                    <td style={{ padding: 10 }}>
                      <PercentBar value={pct} danger={c.blocked} />
                    </td>
                  </tr>
                );
              })}
              {topConsumers.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 16, textAlign: "center", color: "#9CA3AF" }}>
                    Brak ruchu w ostatnich 60s.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 12 }}>
          Endpointy — 24h
        </h2>
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Endpoint</th>
                <th style={{ padding: 10, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>Hits</th>
                <th style={{ padding: 10, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>429s</th>
                <th style={{ padding: 10, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>p95 latency</th>
              </tr>
            </thead>
            <tbody>
              {endpointStats.map((e) => (
                <tr key={e.endpoint} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: 10, fontFamily: "Menlo, monospace", color: "#0F172A" }}>{e.endpoint}</td>
                  <td style={{ padding: 10, textAlign: "right", color: "#374151" }}>{e.hits_24h}</td>
                  <td
                    style={{
                      padding: 10,
                      textAlign: "right",
                      color: e.blocked_24h > 0 ? "#B91C1C" : "#6B7280",
                      fontWeight: e.blocked_24h > 0 ? 600 : 400,
                    }}
                  >
                    {e.blocked_24h}
                  </td>
                  <td style={{ padding: 10, textAlign: "right", color: "#374151" }}>{e.p95_latency_ms} ms</td>
                </tr>
              ))}
              {endpointStats.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#9CA3AF" }}>
                    Brak danych z ostatnich 24h.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A" }}>Zablokowane IP</h2>
          <Link
            href="/admin/rate-limits/blocked"
            style={{ fontSize: 13, color: "#0F172A", textDecoration: "underline" }}
          >
            Zarządzaj blokami
          </Link>
        </div>
        <div style={{ background: "#FFFFFF", border: "1px solid #E5E7EB", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>IP</th>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Powód</th>
                <th style={{ padding: 10, textAlign: "right", color: "#6B7280", fontWeight: 600 }}>Hits</th>
                <th style={{ padding: 10, textAlign: "left", color: "#6B7280", fontWeight: 600 }}>Wygasa</th>
              </tr>
            </thead>
            <tbody>
              {(blockedIps ?? []).map((row) => (
                <tr key={row.ip as string} style={{ borderTop: "1px solid #F3F4F6" }}>
                  <td style={{ padding: 10, fontFamily: "Menlo, monospace", color: "#0F172A" }}>
                    {row.ip as string}
                  </td>
                  <td style={{ padding: 10, color: "#374151" }}>{(row.reason as string) ?? "—"}</td>
                  <td style={{ padding: 10, textAlign: "right", color: "#B91C1C", fontWeight: 600 }}>
                    {(row.hits_count as number) ?? 0}
                  </td>
                  <td style={{ padding: 10, color: "#6B7280" }}>
                    {row.expires_at
                      ? new Date(row.expires_at as string).toLocaleString("pl-PL")
                      : "stała blokada"}
                  </td>
                </tr>
              ))}
              {(!blockedIps || blockedIps.length === 0) && (
                <tr>
                  <td colSpan={4} style={{ padding: 16, textAlign: "center", color: "#9CA3AF" }}>
                    Brak aktywnych blokad. Czysto :)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
