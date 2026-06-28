"use client";

/**
 * Diff view — zad. 319 UI
 *
 * Side-by-side or unified paragraph-level diff between two document versions.
 * Backend provides `DiffEntry[]`; component renders them with color coding.
 */

import * as React from "react";

export type DiffEntryType = "added" | "removed" | "unchanged" | "modified";

export interface DiffEntry {
  type: DiffEntryType;
  before?: string;
  after?: string;
  paragraph_index: number;
}

interface DiffViewProps {
  diff: DiffEntry[];
  mode?: "side-by-side" | "unified";
  /** Hide unchanged paragraphs (useful for long docs). */
  hide_unchanged?: boolean;
  /** Always show this many paragraphs of context around changes. */
  context_lines?: number;
}

export function DiffView({ diff, mode = "side-by-side", hide_unchanged, context_lines = 2 }: DiffViewProps) {
  const filtered = hide_unchanged ? filterWithContext(diff, context_lines) : diff;

  if (mode === "unified") {
    return (
      <div style={containerStyle}>
        {filtered.map((entry, i) => (
          <DiffRowUnified key={i} entry={entry} />
        ))}
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={sideHeaderStyle}>
        <div style={headerCellStyle}>Poprzednia wersja</div>
        <div style={headerCellStyle}>Nowa wersja</div>
      </div>
      {filtered.map((entry, i) => (
        <DiffRowSideBySide key={i} entry={entry} />
      ))}
    </div>
  );
}

function DiffRowSideBySide({ entry }: { entry: DiffEntry }) {
  const beforeBg = entry.type === "removed" || entry.type === "modified" ? "#fee2e2" : "transparent";
  const afterBg = entry.type === "added" || entry.type === "modified" ? "#d1fae5" : "transparent";
  return (
    <div style={rowStyle}>
      <div style={{ ...cellStyle, background: beforeBg }}>
        {entry.before ?? <span style={{ color: "#9ca3af" }}>—</span>}
      </div>
      <div style={{ ...cellStyle, background: afterBg }}>
        {entry.after ?? <span style={{ color: "#9ca3af" }}>—</span>}
      </div>
    </div>
  );
}

function DiffRowUnified({ entry }: { entry: DiffEntry }) {
  if (entry.type === "unchanged") {
    return <div style={{ ...unifiedRowStyle, color: "#6b7280" }}>{entry.before}</div>;
  }
  if (entry.type === "added") {
    return (
      <div style={{ ...unifiedRowStyle, background: "#d1fae5", color: "#065f46" }}>
        + {entry.after}
      </div>
    );
  }
  if (entry.type === "removed") {
    return (
      <div style={{ ...unifiedRowStyle, background: "#fee2e2", color: "#991b1b", textDecoration: "line-through" }}>
        − {entry.before}
      </div>
    );
  }
  // modified
  return (
    <>
      <div style={{ ...unifiedRowStyle, background: "#fee2e2", color: "#991b1b", textDecoration: "line-through" }}>
        − {entry.before}
      </div>
      <div style={{ ...unifiedRowStyle, background: "#d1fae5", color: "#065f46" }}>
        + {entry.after}
      </div>
    </>
  );
}

function filterWithContext(diff: DiffEntry[], context: number): DiffEntry[] {
  if (diff.length === 0) return diff;
  const keep = new Set<number>();
  for (let i = 0; i < diff.length; i++) {
    if (diff[i].type !== "unchanged") {
      for (let j = Math.max(0, i - context); j <= Math.min(diff.length - 1, i + context); j++) {
        keep.add(j);
      }
    }
  }
  return diff.filter((_, i) => keep.has(i));
}

const containerStyle: React.CSSProperties = {
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontSize: 13,
  lineHeight: 1.6,
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  overflow: "hidden",
};
const sideHeaderStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  background: "#f9fafb",
  borderBottom: "1px solid #e5e7eb",
};
const headerCellStyle: React.CSSProperties = {
  padding: "8px 12px",
  fontSize: 12,
  fontWeight: 600,
  color: "#374151",
};
const rowStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  borderBottom: "1px solid #f3f4f6",
};
const cellStyle: React.CSSProperties = {
  padding: "6px 12px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
};
const unifiedRowStyle: React.CSSProperties = {
  padding: "6px 12px",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  borderBottom: "1px solid #f3f4f6",
};
