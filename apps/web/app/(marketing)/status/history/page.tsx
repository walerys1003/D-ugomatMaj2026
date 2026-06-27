/**
 * Tier 34-4 — Public status page with incidents history.
 *
 * Pokazuje publicznie:
 *   - 90-dniowy uptime per komponent (web, api, db, ai, storage)
 *   - timeline incydentów (najnowsze 50)
 *   - dla każdego incydentu: severity, scope, czas trwania, post-mortem link
 *
 * Aktualizacja: ISR 60s. Brak danych userów — tylko agregaty.
 */
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";

export const revalidate = 60;
export const dynamic = "force-static";

interface IncidentRow {
  id: string;
  title: string;
  severity: "sev1" | "sev2" | "sev3" | "sev4";
  status: "investigating" | "identified" | "monitoring" | "resolved";
  started_at: string;
  resolved_at: string | null;
  affected_components: string[];
  summary: string | null;
  postmortem_url: string | null;
}

interface UptimePoint {
  component: string;
  day: string; // YYYY-MM-DD
  uptime_pct: number;
}

function SeverityBadge({ s }: { s: IncidentRow["severity"] }) {
  const map = {
    sev1: { bg: "#FEE2E2", fg: "#991B1B", label: "SEV-1 · Major" },
    sev2: { bg: "#FEF3C7", fg: "#92400E", label: "SEV-2 · Partial" },
    sev3: { bg: "#DBEAFE", fg: "#1E40AF", label: "SEV-3 · Minor" },
    sev4: { bg: "#F3F4F6", fg: "#374151", label: "SEV-4 · Info" },
  }[s];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: map.bg,
        color: map.fg,
      }}
    >
      {map.label}
    </span>
  );
}

function StatusBadge({ s }: { s: IncidentRow["status"] }) {
  const map = {
    investigating: { bg: "#FEF3C7", fg: "#92400E", label: "Investigating" },
    identified: { bg: "#FED7AA", fg: "#9A3412", label: "Identified" },
    monitoring: { bg: "#DBEAFE", fg: "#1E40AF", label: "Monitoring" },
    resolved: { bg: "#D1FAE5", fg: "#065F46", label: "Resolved" },
  }[s];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        background: map.bg,
        color: map.fg,
      }}
    >
      {map.label}
    </span>
  );
}

function UptimeBar({ days }: { days: UptimePoint[] }) {
  // 90 dni × kolorowe kafelki: zielone (>= 99.9), żółte (>= 99.0), czerwone (< 99.0)
  const cells = days.slice(-90);
  return (
    <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 24 }}>
      {cells.map((d) => {
        const color =
          d.uptime_pct >= 99.9 ? "#10B981" : d.uptime_pct >= 99.0 ? "#F59E0B" : "#EF4444";
        return (
          <div
            key={d.day}
            title={`${d.day}: ${d.uptime_pct.toFixed(2)}%`}
            style={{
              flex: 1,
              minWidth: 3,
              height: "100%",
              background: color,
              borderRadius: 1,
            }}
          />
        );
      })}
    </div>
  );
}

function formatDuration(startedAt: string, resolvedAt: string | null): string {
  const start = new Date(startedAt).getTime();
  const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
  const mins = Math.max(1, Math.round((end - start) / 60000));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}min`;
}

export default async function StatusHistoryPage() {
  const sb = await createSupabaseServerClient();

  const { data: incidentsRaw } = await sb
    .from("status_incidents")
    .select(
      "id, title, severity, status, started_at, resolved_at, affected_components, summary, postmortem_url",
    )
    .order("started_at", { ascending: false })
    .limit(50);
  const incidents = (incidentsRaw ?? []) as IncidentRow[];

  const { data: uptimeRaw } = await sb
    .from("status_uptime_daily")
    .select("component, day, uptime_pct")
    .gte("day", new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10))
    .order("day", { ascending: true });
  const uptime = (uptimeRaw ?? []) as UptimePoint[];

  const components = ["web", "api", "database", "ai", "storage"];
  const uptimeByComponent: Record<string, UptimePoint[]> = {};
  for (const c of components) {
    uptimeByComponent[c] = uptime.filter((u) => u.component === c);
  }

  function overallAvg(c: string): number {
    const arr = uptimeByComponent[c] ?? [];
    if (arr.length === 0) return 100;
    return arr.reduce((acc, p) => acc + p.uptime_pct, 0) / arr.length;
  }

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ marginBottom: 32 }}>
        <Link href="/status" style={{ fontSize: 13, color: "#6B7280", textDecoration: "none" }}>
          ← Live status
        </Link>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#0F172A", marginTop: 8 }}>
          Historia incydentów
        </h1>
        <p style={{ color: "#6B7280", marginTop: 4 }}>
          Pełna transparentność — 90 dni dostępności + chronologia zdarzeń.
        </p>
      </header>

      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: 24,
          marginBottom: 32,
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>
          Uptime (90 dni)
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {components.map((c) => (
            <div key={c}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 14, color: "#0F172A", fontWeight: 500, textTransform: "capitalize" }}>
                  {c}
                </span>
                <span style={{ fontSize: 13, color: "#6B7280", fontFamily: "Menlo, monospace" }}>
                  {overallAvg(c).toFixed(3)}%
                </span>
              </div>
              <UptimeBar days={uptimeByComponent[c] ?? []} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, fontSize: 12, color: "#6B7280", display: "flex", gap: 16 }}>
          <span>
            <span style={{ display: "inline-block", width: 10, height: 10, background: "#10B981", borderRadius: 2, marginRight: 4 }} />
            ≥ 99.9%
          </span>
          <span>
            <span style={{ display: "inline-block", width: 10, height: 10, background: "#F59E0B", borderRadius: 2, marginRight: 4 }} />
            99.0 – 99.9%
          </span>
          <span>
            <span style={{ display: "inline-block", width: 10, height: 10, background: "#EF4444", borderRadius: 2, marginRight: 4 }} />
            &lt; 99.0%
          </span>
        </div>
      </section>

      <section>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>
          Ostatnie incydenty
        </h2>

        {incidents.length === 0 && (
          <div
            style={{
              padding: 24,
              background: "#F0FDF4",
              border: "1px solid #BBF7D0",
              borderRadius: 8,
              color: "#065F46",
              textAlign: "center",
            }}
          >
            Brak incydentów w ostatnich 90 dniach. 🎉
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {incidents.map((inc) => (
            <article
              key={inc.id}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 12,
                padding: 20,
                borderLeftWidth: 4,
                borderLeftColor:
                  inc.severity === "sev1"
                    ? "#EF4444"
                    : inc.severity === "sev2"
                      ? "#F59E0B"
                      : inc.severity === "sev3"
                        ? "#3B82F6"
                        : "#9CA3AF",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                <SeverityBadge s={inc.severity} />
                <StatusBadge s={inc.status} />
                <span style={{ fontSize: 12, color: "#6B7280", alignSelf: "center" }}>
                  {new Date(inc.started_at).toLocaleString("pl-PL")} ·{" "}
                  {formatDuration(inc.started_at, inc.resolved_at)}
                </span>
              </div>

              <h3 style={{ fontSize: 16, fontWeight: 600, color: "#0F172A", marginBottom: 6 }}>
                {inc.title}
              </h3>

              {inc.summary && (
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 8 }}>{inc.summary}</p>
              )}

              {inc.affected_components && inc.affected_components.length > 0 && (
                <div style={{ fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                  <strong>Dotknięte komponenty:</strong> {inc.affected_components.join(", ")}
                </div>
              )}

              {inc.postmortem_url && (
                <a
                  href={inc.postmortem_url}
                  style={{
                    fontSize: 13,
                    color: "#0F172A",
                    textDecoration: "underline",
                    fontWeight: 500,
                  }}
                >
                  → Post-mortem
                </a>
              )}
            </article>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: 48, paddingTop: 24, borderTop: "1px solid #E5E7EB", fontSize: 13, color: "#6B7280" }}>
        Subskrybuj alerty:{" "}
        <a href="/api/status/rss" style={{ color: "#0F172A", textDecoration: "underline" }}>
          RSS
        </a>{" "}
        ·{" "}
        <a href="/api/status/atom" style={{ color: "#0F172A", textDecoration: "underline" }}>
          Atom
        </a>{" "}
        · Email subscribe wkrótce.
      </footer>
    </main>
  );
}
