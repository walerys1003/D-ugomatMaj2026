"use client";

/**
 * AI suggestions panel ("radca podpowiada") — zad. 312 UI
 *
 * Sticky right-side panel that fetches and displays AiSuggestion[] for the current
 * wizard answers. Includes apply/dismiss actions.
 */

import * as React from "react";

export interface AiSuggestionUI {
  id: string;
  category: "warning" | "improvement" | "completeness" | "legal_argument" | "evidence";
  severity: "info" | "warning" | "critical";
  suggestion: string;
  related_field?: string;
  applied?: boolean;
  dismissed?: boolean;
}

interface SuggestionsPanelProps {
  caseId: string;
  caseType: string;
  answers: Record<string, unknown>;
  facts?: string;
  onApply?: (suggestionId: string) => void;
  onFieldFocus?: (field: string) => void;
}

export function SuggestionsPanel(props: SuggestionsPanelProps) {
  const { caseId, caseType, answers, facts, onApply, onFieldFocus } = props;
  const [suggestions, setSuggestions] = React.useState<AiSuggestionUI[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [rateLimited, setRateLimited] = React.useState<number | null>(null);
  const [collapsed, setCollapsed] = React.useState(false);

  async function fetchSuggestions() {
    setLoading(true);
    setError(null);
    setRateLimited(null);
    try {
      const resp = await fetch("/api/wizard/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ case_id: caseId, case_type: caseType, answers, facts }),
      });
      if (resp.status === 429) {
        const data = await resp.json().catch(() => ({}));
        setRateLimited(data?.retry_after_seconds ?? 3600);
        return;
      }
      if (!resp.ok) {
        setError(`Błąd: ${resp.status}`);
        return;
      }
      const data = await resp.json();
      setSuggestions(data.suggestions ?? []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function dismissSuggestion(id: string) {
    setSuggestions((prev) => prev.map((s) => (s.id === id ? { ...s, dismissed: true } : s)));
    try {
      await fetch(`/api/wizard/suggestions/${id}`, { method: "DELETE" });
    } catch {
      // best-effort
    }
  }

  function applySuggestion(s: AiSuggestionUI) {
    onApply?.(s.id);
    setSuggestions((prev) => prev.map((x) => (x.id === s.id ? { ...x, applied: true } : x)));
    if (s.related_field) onFieldFocus?.(s.related_field);
  }

  const visible = suggestions.filter((s) => !s.dismissed);
  const criticalCount = visible.filter((s) => s.severity === "critical").length;

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={() => setCollapsed(false)}
        style={collapsedButtonStyle}
        aria-label="Pokaż podpowiedzi"
      >
        💡 {visible.length}
        {criticalCount > 0 && <span style={badgeStyle}>{criticalCount}</span>}
      </button>
    );
  }

  return (
    <aside style={panelStyle} aria-label="AI podpowiedzi">
      <header style={headerStyle}>
        <h3 style={titleStyle}>💡 Radca podpowiada</h3>
        <button type="button" onClick={() => setCollapsed(true)} style={iconButtonStyle} aria-label="Zwiń">
          ✕
        </button>
      </header>

      <div style={actionRowStyle}>
        <button type="button" onClick={fetchSuggestions} disabled={loading} style={refreshButtonStyle}>
          {loading ? "Ładowanie…" : "Sprawdź"}
        </button>
      </div>

      {rateLimited !== null && (
        <p style={{ ...messageStyle, color: "#92400e" }}>
          Limit zapytań osiągnięty. Spróbuj za {Math.round(rateLimited / 60)} min.
        </p>
      )}
      {error && <p style={{ ...messageStyle, color: "#dc2626" }}>{error}</p>}

      {visible.length === 0 && !loading && !error && rateLimited === null && (
        <p style={messageStyle}>Brak sugestii. Wypełnij więcej pól, a radca AI sprawdzi Twoją sprawę.</p>
      )}

      <ul style={listStyle}>
        {visible.map((s) => (
          <li key={s.id} style={{ ...itemStyle, ...severityStyle(s.severity), opacity: s.applied ? 0.5 : 1 }}>
            <div style={itemHeaderStyle}>
              <span style={severityBadgeStyle(s.severity)}>{labelForSeverity(s.severity)}</span>
              <span style={categoryStyle}>{labelForCategory(s.category)}</span>
            </div>
            <p style={suggestionTextStyle}>{s.suggestion}</p>
            <div style={itemActionsStyle}>
              {!s.applied && (
                <button type="button" onClick={() => applySuggestion(s)} style={applyButtonStyle}>
                  Zastosuj
                </button>
              )}
              {!s.applied && (
                <button type="button" onClick={() => dismissSuggestion(s.id)} style={dismissButtonStyle}>
                  Odrzuć
                </button>
              )}
              {s.applied && <span style={{ color: "#059669", fontSize: 12 }}>✓ Zastosowano</span>}
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function labelForSeverity(s: AiSuggestionUI["severity"]): string {
  return s === "critical" ? "Pilne" : s === "warning" ? "Ostrzeżenie" : "Info";
}
function labelForCategory(c: AiSuggestionUI["category"]): string {
  switch (c) {
    case "warning": return "Ryzyko";
    case "improvement": return "Ulepszenie";
    case "completeness": return "Kompletność";
    case "legal_argument": return "Argument prawny";
    case "evidence": return "Dowód";
  }
}
function severityStyle(s: AiSuggestionUI["severity"]): React.CSSProperties {
  if (s === "critical") return { borderLeft: "3px solid #dc2626" };
  if (s === "warning") return { borderLeft: "3px solid #f59e0b" };
  return { borderLeft: "3px solid #2563eb" };
}
function severityBadgeStyle(s: AiSuggestionUI["severity"]): React.CSSProperties {
  const base: React.CSSProperties = { fontSize: 11, padding: "2px 6px", borderRadius: 4, fontWeight: 600 };
  if (s === "critical") return { ...base, background: "#fee2e2", color: "#991b1b" };
  if (s === "warning") return { ...base, background: "#fef3c7", color: "#92400e" };
  return { ...base, background: "#dbeafe", color: "#1e40af" };
}

const panelStyle: React.CSSProperties = {
  position: "sticky",
  top: 16,
  width: 320,
  maxHeight: "calc(100vh - 32px)",
  overflow: "auto",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
};
const headerStyle: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 16, fontWeight: 600 };
const actionRowStyle: React.CSSProperties = { marginTop: 12, marginBottom: 12 };
const refreshButtonStyle: React.CSSProperties = {
  width: "100%", padding: "8px 12px", fontSize: 14, fontWeight: 600,
  background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer",
};
const iconButtonStyle: React.CSSProperties = { background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#6b7280" };
const messageStyle: React.CSSProperties = { fontSize: 13, color: "#6b7280", margin: "8px 0" };
const listStyle: React.CSSProperties = { listStyle: "none", padding: 0, margin: 0 };
const itemStyle: React.CSSProperties = { padding: 10, marginBottom: 8, background: "#f9fafb", borderRadius: 6 };
const itemHeaderStyle: React.CSSProperties = { display: "flex", gap: 6, marginBottom: 6 };
const categoryStyle: React.CSSProperties = { fontSize: 11, color: "#6b7280" };
const suggestionTextStyle: React.CSSProperties = { fontSize: 13, color: "#1f2937", margin: "4px 0", lineHeight: 1.4 };
const itemActionsStyle: React.CSSProperties = { display: "flex", gap: 8, marginTop: 8 };
const applyButtonStyle: React.CSSProperties = { padding: "4px 10px", fontSize: 12, background: "#10b981", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer" };
const dismissButtonStyle: React.CSSProperties = { padding: "4px 10px", fontSize: 12, background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer" };
const collapsedButtonStyle: React.CSSProperties = {
  position: "fixed", right: 16, top: "50%", transform: "translateY(-50%)",
  padding: "10px 14px", background: "#2563eb", color: "#fff", border: "none",
  borderRadius: "999px", cursor: "pointer", fontSize: 14, fontWeight: 600,
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: 6,
};
const badgeStyle: React.CSSProperties = {
  background: "#dc2626", color: "#fff", borderRadius: "999px",
  padding: "1px 6px", fontSize: 10, marginLeft: 4,
};
