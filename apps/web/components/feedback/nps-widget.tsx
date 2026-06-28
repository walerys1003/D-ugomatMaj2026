"use client";

/**
 * Tier 33-5 — NPS in-app survey widget.
 *
 * Pływający widget w prawym dolnym rogu, pokazywany 1× per user co 90 dni
 * (cooldown w localStorage `dlugomat:nps:last_shown`). Eligibility:
 *   - user zalogowany ≥ 14 dni
 *   - ≥ 1 wygenerowane pismo
 *   - nie odpowiedział w ostatnich 90 dniach
 *
 * Flow:
 *   Score (0-10) → opcjonalny komentarz → submit → "Dziękujemy"
 *
 * Anti-spam: jednorazowe dismissable (X w rogu), wraca po 30 dniach.
 */
import { useEffect, useState } from "react";

const STORAGE_KEY = "dlugomat:nps:last_shown";
const DISMISS_KEY = "dlugomat:nps:dismissed_at";
const COOLDOWN_DAYS = 90;
const DISMISS_COOLDOWN_DAYS = 30;

type Stage = "hidden" | "score" | "comment" | "thanks";

export interface NpsWidgetProps {
  /** Czy backend zezwala na wyświetlenie (eligibility check). */
  enabled: boolean;
  /** Kanał — domyślnie `in_app`. */
  channel?: "in_app" | "email" | "sms";
  /** Endpoint POST do zapisania odpowiedzi. */
  endpoint?: string;
}

function isCooldownActive(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const last = window.localStorage.getItem(STORAGE_KEY);
    if (last && Date.now() - parseInt(last, 10) < COOLDOWN_DAYS * 86400_000) return true;
    const dismissed = window.localStorage.getItem(DISMISS_KEY);
    if (dismissed && Date.now() - parseInt(dismissed, 10) < DISMISS_COOLDOWN_DAYS * 86400_000) return true;
    return false;
  } catch {
    return true;
  }
}

export function NpsWidget({ enabled, channel = "in_app", endpoint = "/api/nps/submit" }: NpsWidgetProps) {
  const [stage, setStage] = useState<Stage>("hidden");
  const [score, setScore] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (isCooldownActive()) return;
    // Lekkie opóźnienie, żeby nie pokazywać widgetu od razu po load
    const t = setTimeout(() => setStage("score"), 4000);
    return () => clearTimeout(t);
  }, [enabled]);

  function dismiss() {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      /* noop */
    }
    setStage("hidden");
  }

  async function submitScore(s: number) {
    setScore(s);
    setStage("comment");
  }

  async function submitFinal() {
    if (score == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, comment: comment.trim() || null, channel }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* noop */
      }
      setStage("thanks");
      // Auto-hide po 4s
      setTimeout(() => setStage("hidden"), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "submit_failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (stage === "hidden") return null;

  const baseStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 88,
    right: 24,
    width: 360,
    maxWidth: "calc(100vw - 32px)",
    background: "#FFFFFF",
    border: "1px solid #E5E7EB",
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(15,23,42,0.15)",
    padding: 20,
    zIndex: 9998,
    fontFamily: "system-ui, -apple-system, Helvetica, sans-serif",
    color: "#0F172A",
  };

  return (
    <div role="dialog" aria-label="Ankieta NPS" style={baseStyle}>
      <button
        type="button"
        aria-label="Zamknij ankietę"
        onClick={dismiss}
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "transparent",
          border: "none",
          fontSize: 18,
          color: "#9CA3AF",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ×
      </button>

      {stage === "score" && (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Pomóż nam się rozwijać
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14 }}>
            Jak prawdopodobne jest, że polecisz Długomata znajomemu lub rodzinie?
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
            {Array.from({ length: 11 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => submitScore(i)}
                aria-label={`Ocena ${i}`}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  border: "1px solid #D1D5DB",
                  background: "#FFFFFF",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#0F172A",
                  cursor: "pointer",
                }}
              >
                {i}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF" }}>
            <span>Niemożliwe</span>
            <span>Bardzo prawdopodobne</span>
          </div>
        </>
      )}

      {stage === "comment" && (
        <>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
            Dziękujemy za ocenę {score}/10
          </div>
          <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 12 }}>
            {score! >= 9
              ? "Świetnie! Co podoba Ci się najbardziej?"
              : score! >= 7
                ? "Co możemy poprawić, żeby było jeszcze lepiej?"
                : "Co poszło nie tak? Twoja opinia pomoże nam to naprawić."}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Opcjonalny komentarz (max 500 znaków)"
            maxLength={500}
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              border: "1px solid #D1D5DB",
              borderRadius: 6,
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
              marginBottom: 12,
            }}
          />
          {error && (
            <div style={{ fontSize: 12, color: "#B91C1C", marginBottom: 8 }}>
              Błąd wysyłki: {error}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <button
              type="button"
              onClick={() => submitFinal()}
              disabled={submitting}
              style={{
                padding: "8px 16px",
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                cursor: submitting ? "wait" : "pointer",
                opacity: submitting ? 0.6 : 1,
              }}
            >
              {submitting ? "Wysyłam…" : "Wyślij"}
            </button>
          </div>
        </>
      )}

      {stage === "thanks" && (
        <div style={{ textAlign: "center", padding: "12px 0" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>Dziękujemy za feedback!</div>
          <div style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}>
            Twoja opinia trafiła do zespołu produktu.
          </div>
        </div>
      )}
    </div>
  );
}
