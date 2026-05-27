"use client";

/**
 * Tarcza v4-δ — AI Artifact primitive.
 *
 * Display container for streaming AI output (drafts, analyses, redactions,
 * summaries). Mirrors Claude/ChatGPT "artifact" pattern: dedicated panel that
 * shows AI work-in-progress separate from chat scroll, with state machine
 * surfacing progress to the user.
 *
 * State machine:
 *   idle ──start──► streaming ──chunk*──► streaming ──finalize──► done
 *                       │                                  ▲
 *                       └─────────error──► error ──retry───┘
 *
 * Wired for real streaming (fetch + ReadableStream + TextDecoder) AND mock
 * mode for design/QA work without a backend. Switch via `mode` prop.
 *
 * NOT a chat input. Pair with `<ChatStream>` upstream, or trigger from a
 * server action / button click.
 */

import * as React from "react";
import {
  Sparkles,
  Loader2,
  CircleAlert,
  CircleCheck,
  Copy,
  Check,
  RotateCcw,
  StopCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Eyebrow, Heading, Text, Mono } from "@/components/ui/typography";

// ──────────────────────────────────────────────────────────────────────────
// Types

export type ArtifactState = "idle" | "streaming" | "done" | "error";

export type ArtifactKind =
  | "letter"        // Pismo procesowe (D1, D2 modules)
  | "analysis"     // Analiza sprawy
  | "redaction"    // Anonimizacja
  | "summary"      // Streszczenie
  | "transcript"   // Transkrypcja
  | "generic";

export interface ArtifactProps {
  /** Header label, e.g. "Pismo procesowe — Sprzeciw od nakazu zapłaty" */
  title: string;
  /** Subtitle / context, e.g. case ID or document type */
  subtitle?: string;
  /** Kind controls icon + accent. */
  kind?: ArtifactKind;
  /** Initial content (for `done` state replays or `idle` placeholders). */
  initialContent?: string;
  /** External controlled state (optional — defaults to internal). */
  state?: ArtifactState;
  /** Callback when streaming completes. */
  onComplete?: (finalContent: string) => void;
  /** Callback when user clicks retry. */
  onRetry?: () => void;
  /**
   * Streaming source.
   * - "mock": uses internal token generator (for design/QA).
   * - SSE endpoint URL: opens fetch + ReadableStream and pipes chunks.
   * - undefined: idle, waiting for external state changes.
   */
  streamSource?: "mock" | string;
  /** Mock streaming text (only used when streamSource="mock"). */
  mockContent?: string;
  /** Mock streaming speed in ms per chunk. */
  mockSpeed?: number;
  /** Optional className for wrapper. */
  className?: string;
  /** If true, auto-start streaming on mount. */
  autoStart?: boolean;
}

// ──────────────────────────────────────────────────────────────────────────
// Kind metadata

const KIND_META: Record<ArtifactKind, { label: string; accent: string }> = {
  letter: { label: "Pismo procesowe", accent: "text-ink-900" },
  analysis: { label: "Analiza", accent: "text-blue-700" },
  redaction: { label: "Anonimizacja", accent: "text-purple-700" },
  summary: { label: "Streszczenie", accent: "text-amber-700" },
  transcript: { label: "Transkrypcja", accent: "text-emerald-700" },
  generic: { label: "Artefakt AI", accent: "text-ink-700" },
};

// ──────────────────────────────────────────────────────────────────────────
// Main component

export function Artifact({
  title,
  subtitle,
  kind = "generic",
  initialContent = "",
  state: controlledState,
  onComplete,
  onRetry,
  streamSource,
  mockContent = DEFAULT_MOCK_CONTENT,
  mockSpeed = 20,
  className,
  autoStart = false,
}: ArtifactProps) {
  const [internalState, setInternalState] = React.useState<ArtifactState>(
    controlledState ?? (initialContent ? "done" : "idle"),
  );
  const [content, setContent] = React.useState(initialContent);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const state = controlledState ?? internalState;
  const meta = KIND_META[kind];

  // ─── Streaming logic ──────────────────────────────────────────────────

  const startStream = React.useCallback(async () => {
    if (!streamSource) return;
    setInternalState("streaming");
    setError(null);
    setContent("");
    abortRef.current = new AbortController();

    try {
      if (streamSource === "mock") {
        await streamMock(mockContent, mockSpeed, abortRef.current.signal, (chunk) => {
          setContent((prev) => prev + chunk);
        });
      } else {
        await streamSSE(streamSource, abortRef.current.signal, (chunk) => {
          setContent((prev) => prev + chunk);
        });
      }
      setInternalState("done");
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        setInternalState("idle");
        return;
      }
      setError((err as Error).message || "Nieznany błąd streamingu");
      setInternalState("error");
    }
  }, [streamSource, mockContent, mockSpeed]);

  React.useEffect(() => {
    if (autoStart && state === "idle" && streamSource) {
      void startStream();
    }
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]);

  React.useEffect(() => {
    if (state === "done" && onComplete) {
      onComplete(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // ─── Actions ──────────────────────────────────────────────────────────

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* noop — clipboard API not always available */
    }
  };

  const handleAbort = () => abortRef.current?.abort();

  const handleRetry = () => {
    if (onRetry) onRetry();
    void startStream();
  };

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <section
      className={cn(
        "rounded-2xl border border-ink-200 bg-white shadow-sm",
        "overflow-hidden",
        className,
      )}
      aria-busy={state === "streaming"}
      aria-live="polite"
    >
      {/* Header */}
      <header className="flex items-center justify-between gap-4 border-b border-ink-100 bg-ink-50/50 px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Sparkles
              className={cn("h-4 w-4 shrink-0", meta.accent)}
              aria-hidden="true"
            />
            <Eyebrow className={meta.accent}>{meta.label}</Eyebrow>
            <StateBadge state={state} />
          </div>
          <Heading level={4} className="mt-1 truncate text-ink-900">
            {title}
          </Heading>
          {subtitle && (
            <Text size="sm" className="mt-0.5 truncate text-ink-600">
              {subtitle}
            </Text>
          )}
        </div>

        {/* Action cluster */}
        <div className="flex shrink-0 items-center gap-2">
          {state === "streaming" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleAbort}
              className="gap-1.5"
            >
              <StopCircle className="h-3.5 w-3.5" aria-hidden="true" />
              Stop
            </Button>
          )}
          {state === "done" && content && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="gap-1.5"
              aria-label="Kopiuj treść artefaktu"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Skopiowano
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  Kopiuj
                </>
              )}
            </Button>
          )}
          {state === "error" && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleRetry}
              className="gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Spróbuj ponownie
            </Button>
          )}
          {state === "idle" && streamSource && (
            <Button
              size="sm"
              onClick={() => void startStream()}
              className="gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Generuj
            </Button>
          )}
        </div>
      </header>

      {/* Body */}
      <div className="px-5 py-5">
        {state === "idle" && !content && (
          <Text size="sm" className="text-ink-500">
            Artefakt nie został jeszcze wygenerowany. Kliknij{" "}
            <span className="font-medium text-ink-700">Generuj</span> aby
            rozpocząć.
          </Text>
        )}

        {state === "error" && (
          <div className="rounded-lg border border-red-200 bg-red-50/60 p-4">
            <div className="flex items-start gap-2">
              <CircleAlert
                className="mt-0.5 h-4 w-4 shrink-0 text-red-600"
                aria-hidden="true"
              />
              <div className="flex-1">
                <Text size="sm" className="font-medium text-red-900">
                  Generowanie nie powiodło się
                </Text>
                <Mono className="mt-1 text-xs text-red-700">
                  {error ?? "unknown_error"}
                </Mono>
              </div>
            </div>
          </div>
        )}

        {(state === "streaming" || state === "done" || content) && (
          <div className="relative">
            {/* Output area — monospace for letters/transcripts, prose elsewhere */}
            <pre
              className={cn(
                "whitespace-pre-wrap break-words",
                "font-mono text-[13.5px] leading-relaxed text-ink-900",
                "max-h-[60vh] overflow-y-auto",
                "rounded-lg border border-ink-100 bg-ink-50/30 px-4 py-3",
              )}
            >
              {content}
              {state === "streaming" && (
                <span
                  className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-ink-900"
                  aria-hidden="true"
                />
              )}
            </pre>

            {state === "streaming" && (
              <div className="mt-3 flex items-center gap-2">
                <Loader2
                  className="h-3.5 w-3.5 animate-spin text-ink-500"
                  aria-hidden="true"
                />
                <Text size="xs" className="text-ink-500">
                  Generowanie w toku — możesz przerwać w dowolnym momencie.
                </Text>
              </div>
            )}

            {state === "done" && (
              <div className="mt-3 flex items-center gap-2">
                <CircleCheck
                  className="h-3.5 w-3.5 text-emerald-600"
                  aria-hidden="true"
                />
                <Text size="xs" className="text-ink-500">
                  Gotowe. {content.length.toLocaleString("pl-PL")} znaków —
                  sprawdź treść przed wysłaniem.
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components

function StateBadge({ state }: { state: ArtifactState }) {
  const config = {
    idle: { label: "oczekuje", className: "bg-ink-100 text-ink-700" },
    streaming: { label: "generowanie…", className: "bg-blue-100 text-blue-800" },
    done: { label: "gotowe", className: "bg-emerald-100 text-emerald-800" },
    error: { label: "błąd", className: "bg-red-100 text-red-800" },
  } as const;
  const c = config[state];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] font-medium uppercase tracking-wide",
        c.className,
      )}
    >
      {c.label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Streaming helpers

async function streamMock(
  text: string,
  chunkMs: number,
  signal: AbortSignal,
  onChunk: (chunk: string) => void,
): Promise<void> {
  // Split into "word-ish" tokens for natural feel.
  const tokens = text.match(/\S+\s*|\s+/g) ?? [text];
  for (const tok of tokens) {
    if (signal.aborted) throw new DOMException("aborted", "AbortError");
    await new Promise((r) => setTimeout(r, chunkMs));
    onChunk(tok);
  }
}

async function streamSSE(
  url: string,
  signal: AbortSignal,
  onChunk: (chunk: string) => void,
): Promise<void> {
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  if (!res.body) {
    throw new Error("no_response_body");
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // SSE protocol: split on double newline.
    const parts = buffer.split("\n\n");
    buffer = parts.pop() ?? "";
    for (const part of parts) {
      const lines = part.split("\n");
      for (const line of lines) {
        if (line.startsWith("data:")) {
          const payload = line.slice(5).trim();
          if (payload === "[DONE]") return;
          try {
            const obj = JSON.parse(payload);
            if (typeof obj.delta === "string") onChunk(obj.delta);
            else if (typeof obj.content === "string") onChunk(obj.content);
          } catch {
            // Plain text payload — pass through.
            onChunk(payload);
          }
        }
      }
    }
  }
  // Flush remainder.
  if (buffer.trim()) onChunk(buffer);
}

// ──────────────────────────────────────────────────────────────────────────
// Default mock content (Polish legal letter sample)

const DEFAULT_MOCK_CONTENT = `Warszawa, dnia 27 maja 2026 r.

Sąd Rejonowy dla Warszawy-Mokotowa
Wydział I Cywilny
ul. Ogrodowa 51A
00-873 Warszawa

Sygn. akt: I C 1234/26

Powód: [imię i nazwisko]
Pozwany: [imię i nazwisko / nazwa firmy]

SPRZECIW OD NAKAZU ZAPŁATY

w postępowaniu upominawczym

Działając w imieniu własnym, niniejszym wnoszę sprzeciw od nakazu zapłaty wydanego przez Sąd Rejonowy dla Warszawy-Mokotowa w dniu 15 maja 2026 r. w sprawie o sygn. akt I Nc 5678/26, doręczonego mi w dniu 20 maja 2026 r.

UZASADNIENIE

1. Roszczenie objęte nakazem zapłaty jest bezzasadne w całości.
2. Pozwany kwestionuje istnienie zobowiązania, jego wysokość oraz wymagalność.
3. Zarzucam przedawnienie roszczenia — termin trzyletni upłynął w dniu [data].

Wnoszę o:
   1) uchylenie nakazu zapłaty w całości;
   2) oddalenie powództwa;
   3) zasądzenie od powoda na rzecz pozwanego kosztów procesu według norm przepisanych.

[podpis]
`;
