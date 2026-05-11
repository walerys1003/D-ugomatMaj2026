/**
 * Tier 33-4 — AI Prompt versioning UI (admin).
 *
 * Strona pokazuje pełną historię wersji jednego promptu AI:
 *  - timeline wersji (semver + commit-style msg)
 *  - diff side-by-side między dowolnymi 2 wersjami
 *  - status każdej wersji: draft / staged / production / deprecated
 *  - kto i kiedy promował do production
 *  - rollback (jednoklik — przerzuca starszą wersję do production)
 *  - metryki per wersja: avg latency, output_quality_score, error_rate
 */
import Link from "next/link";
import { requireFullAdmin } from "@/lib/admin/rbac";
import { createServerSupabase } from "@/lib/db/supabase-server";
import { notFound } from "next/navigation";

interface PromptVersion {
  id: string;
  prompt_id: string;
  version: string; // semver
  status: "draft" | "staged" | "production" | "deprecated";
  body: string;
  commit_message: string;
  created_by: string | null;
  created_at: string;
  promoted_at: string | null;
  promoted_by: string | null;
  metrics: {
    avg_latency_ms?: number;
    avg_quality_score?: number;
    error_rate?: number;
    invocations_24h?: number;
  } | null;
}

interface PromptRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
}

function StatusBadge({ status }: { status: PromptVersion["status"] }) {
  const map = {
    draft: { bg: "#F3F4F6", fg: "#374151", label: "Draft" },
    staged: { bg: "#FEF3C7", fg: "#92400E", label: "Staged" },
    production: { bg: "#D1FAE5", fg: "#065F46", label: "Production" },
    deprecated: { bg: "#FEE2E2", fg: "#991B1B", label: "Deprecated" },
  }[status];
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

function MetricCell({ label, value, suffix = "" }: { label: string; value: number | undefined; suffix?: string }) {
  if (value == null || Number.isNaN(value)) {
    return (
      <div style={{ fontSize: 12, color: "#9CA3AF" }}>
        <div style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontSize: 16, color: "#6B7280" }}>—</div>
      </div>
    );
  }
  return (
    <div style={{ fontSize: 12, color: "#6B7280" }}>
      <div style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 16, color: "#0F172A", fontWeight: 600 }}>
        {value}
        {suffix}
      </div>
    </div>
  );
}

export default async function PromptVersionsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireFullAdmin();
  const { id } = await params;
  const sb = await createServerSupabase();

  const { data: prompt } = await sb
    .from("ai_prompts")
    .select("id, key, name, description")
    .eq("id", id)
    .maybeSingle<PromptRow>();

  if (!prompt) notFound();

  const { data: versions } = await sb
    .from("ai_prompt_versions")
    .select(
      "id, prompt_id, version, status, body, commit_message, created_by, created_at, promoted_at, promoted_by, metrics",
    )
    .eq("prompt_id", id)
    .order("created_at", { ascending: false })
    .limit(50);

  const list = (versions ?? []) as PromptVersion[];
  const productionVersion = list.find((v) => v.status === "production");

  return (
    <div style={{ padding: "24px 32px", maxWidth: 1280, margin: "0 auto" }}>
      <div style={{ marginBottom: 24 }}>
        <Link
          href="/admin/prompts"
          style={{ color: "#6B7280", fontSize: 13, textDecoration: "none" }}
        >
          ← Wszystkie prompty
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 4px", color: "#0F172A" }}>
          {prompt.name}
        </h1>
        <div style={{ fontFamily: "Menlo, monospace", fontSize: 13, color: "#6B7280" }}>
          {prompt.key}
        </div>
        {prompt.description && (
          <p style={{ marginTop: 8, color: "#374151", maxWidth: 720 }}>{prompt.description}</p>
        )}
      </div>

      {productionVersion && (
        <div
          style={{
            padding: 16,
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 8,
            marginBottom: 24,
          }}
        >
          <div style={{ fontSize: 12, textTransform: "uppercase", color: "#065F46", letterSpacing: 0.5 }}>
            Obecnie w produkcji
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <span style={{ fontFamily: "Menlo, monospace", fontSize: 18, fontWeight: 600, color: "#0F172A" }}>
              v{productionVersion.version}
            </span>
            <span style={{ fontSize: 13, color: "#6B7280" }}>
              promowana {productionVersion.promoted_at ? new Date(productionVersion.promoted_at).toLocaleString("pl-PL") : "—"}
            </span>
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: "#0F172A" }}>Historia wersji</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href={`/admin/prompts/${id}/diff`}
            style={{
              padding: "8px 14px",
              background: "#FFFFFF",
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 13,
              color: "#0F172A",
              textDecoration: "none",
            }}
          >
            Porównaj wersje
          </Link>
          <Link
            href={`/admin/prompts/${id}/edit`}
            style={{
              padding: "8px 14px",
              background: "#0F172A",
              color: "#FFFFFF",
              borderRadius: 6,
              fontSize: 13,
              textDecoration: "none",
            }}
          >
            + Nowa wersja
          </Link>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.length === 0 && (
          <div style={{ padding: 24, background: "#F9FAFB", borderRadius: 8, color: "#6B7280", textAlign: "center" }}>
            Brak wersji. Utwórz pierwszą wersję promptu.
          </div>
        )}

        {list.map((v) => (
          <article
            key={v.id}
            style={{
              padding: 20,
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: 8,
              borderLeftWidth: 4,
              borderLeftColor:
                v.status === "production"
                  ? "#10B981"
                  : v.status === "staged"
                    ? "#F59E0B"
                    : v.status === "deprecated"
                      ? "#EF4444"
                      : "#9CA3AF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: "Menlo, monospace", fontSize: 16, fontWeight: 600, color: "#0F172A" }}>
                    v{v.version}
                  </span>
                  <StatusBadge status={v.status} />
                  <span style={{ fontSize: 12, color: "#6B7280" }}>
                    {new Date(v.created_at).toLocaleString("pl-PL")}
                  </span>
                </div>
                <div style={{ marginTop: 6, fontSize: 14, color: "#374151" }}>
                  {v.commit_message || <em style={{ color: "#9CA3AF" }}>brak opisu zmiany</em>}
                </div>
                <div style={{ marginTop: 4, fontSize: 12, color: "#6B7280" }}>
                  Autor: {v.created_by ?? "system"}
                  {v.promoted_at && (
                    <> · promowana: {new Date(v.promoted_at).toLocaleDateString("pl-PL")} przez {v.promoted_by ?? "?"}</>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                {v.status !== "production" && (
                  <form
                    action={`/api/admin/prompts/${id}/versions/${v.id}/promote`}
                    method="POST"
                    style={{ margin: 0 }}
                  >
                    <button
                      type="submit"
                      style={{
                        padding: "6px 12px",
                        background: "#10B981",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: 6,
                        fontSize: 12,
                        cursor: "pointer",
                      }}
                    >
                      → Promuj do prod
                    </button>
                  </form>
                )}
                <Link
                  href={`/admin/prompts/${id}/versions/${v.id}`}
                  style={{ fontSize: 12, color: "#6B7280", textDecoration: "underline" }}
                >
                  Podgląd / diff
                </Link>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 16,
                marginTop: 16,
                paddingTop: 16,
                borderTop: "1px solid #F3F4F6",
              }}
            >
              <MetricCell label="Wywołania 24h" value={v.metrics?.invocations_24h} />
              <MetricCell label="Avg latency" value={v.metrics?.avg_latency_ms} suffix=" ms" />
              <MetricCell
                label="Quality"
                value={v.metrics?.avg_quality_score != null ? Math.round(v.metrics.avg_quality_score * 100) : undefined}
                suffix="%"
              />
              <MetricCell
                label="Error rate"
                value={v.metrics?.error_rate != null ? Math.round(v.metrics.error_rate * 1000) / 10 : undefined}
                suffix="%"
              />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
