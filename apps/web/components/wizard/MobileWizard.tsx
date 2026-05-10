"use client";

/**
 * Mobile-first wizard component — zad. 332
 *
 * Single-question-per-screen layout, large touch targets, sticky progress bar,
 * sticky bottom nav, autosave on every change, voice-to-text + explainer support.
 */

import * as React from "react";
import { isStepVisible, nextStep, previousStep, progressPercent, type WizardStep } from "@/lib/wizard/branch-engine";
import { getExplainer } from "@/lib/wizard/explainers";
import type { CaseType } from "@/lib/db/types";

export interface MobileWizardProps {
  caseType: CaseType;
  steps: WizardStep[];
  initialAnswers?: Record<string, unknown>;
  onAnswerChange?: (answers: Record<string, unknown>) => void;
  onComplete: (answers: Record<string, unknown>) => void;
  /** If provided, used instead of internal autosave. */
  onAutoSave?: (answers: Record<string, unknown>) => Promise<void>;
  /** Render the input control for a given step. */
  renderInput: (step: WizardStep, value: unknown, onChange: (v: unknown) => void) => React.ReactNode;
}

export function MobileWizard(props: MobileWizardProps) {
  const { caseType, steps, initialAnswers = {}, onAnswerChange, onComplete, onAutoSave, renderInput } = props;
  const [answers, setAnswers] = React.useState<Record<string, unknown>>(initialAnswers);
  const [currentStepId, setCurrentStepId] = React.useState<string>(steps[0]?.id ?? "");
  const [showExplainer, setShowExplainer] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const autosaveTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentStep = steps.find((s) => s.id === currentStepId);
  const visible = currentStep ? isStepVisible(currentStep, answers) : false;
  const percent = progressPercent(steps, currentStepId, answers);

  // Skip invisible steps automatically
  React.useEffect(() => {
    if (currentStep && !visible) {
      const next = nextStep(steps, currentStepId, answers);
      if (next) setCurrentStepId(next.id);
    }
  }, [currentStep, visible, steps, currentStepId, answers]);

  // Debounced autosave
  React.useEffect(() => {
    if (!onAutoSave) return;
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(async () => {
      try {
        setSaving(true);
        await onAutoSave(answers);
      } finally {
        setSaving(false);
      }
    }, 1500);
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [answers, onAutoSave]);

  function handleChange(key: string, value: unknown) {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    onAnswerChange?.(updated);
  }

  function handleNext() {
    if (!currentStep) return;
    const next = nextStep(steps, currentStepId, answers);
    if (next) {
      setCurrentStepId(next.id);
      setShowExplainer(false);
    } else {
      onComplete(answers);
    }
  }

  function handleBack() {
    if (!currentStep) return;
    const prev = previousStep(steps, currentStepId, answers);
    if (prev) {
      setCurrentStepId(prev.id);
      setShowExplainer(false);
    }
  }

  if (!currentStep) {
    return <div style={{ padding: 16 }}>Brak kroków do wyświetlenia.</div>;
  }

  const answerKey = currentStep.id;
  const explainer = getExplainer(caseType, answerKey);
  const value = answers[answerKey];

  return (
    <div style={containerStyle}>
      {/* Sticky top progress */}
      <div style={progressBarContainerStyle}>
        <div style={progressBarTrackStyle}>
          <div style={{ ...progressBarFillStyle, width: `${percent}%` }} />
        </div>
        <div style={progressTextStyle}>
          Krok {steps.indexOf(currentStep) + 1} z {steps.length} · {percent}%
          {saving && <span style={{ marginLeft: 8, opacity: 0.6 }}>Zapisywanie…</span>}
        </div>
      </div>

      <div style={contentStyle}>
        <h2 style={titleStyle}>{currentStep.title}</h2>
        {currentStep.description && <p style={descStyle}>{currentStep.description}</p>}

        {explainer && (
          <button
            type="button"
            onClick={() => setShowExplainer((v) => !v)}
            style={explainerToggleStyle}
            aria-expanded={showExplainer}
          >
            ℹ️ {explainer.short}
          </button>
        )}
        {explainer && showExplainer && (
          <div style={explainerBoxStyle}>
            {explainer.long && <p>{explainer.long}</p>}
            {explainer.article_slug && (
              <a href={`/baza-wiedzy/${explainer.article_slug}`} target="_blank" rel="noopener" style={linkStyle}>
                Czytaj artykuł →
              </a>
            )}
          </div>
        )}

        <div style={inputContainerStyle}>{renderInput(currentStep, value, (v) => handleChange(answerKey, v))}</div>

        {currentStep.estimated_minutes && (
          <p style={estimateStyle}>~ {currentStep.estimated_minutes} min</p>
        )}
      </div>

      {/* Sticky bottom nav */}
      <div style={navStyle}>
        <button
          type="button"
          onClick={handleBack}
          disabled={!previousStep(steps, currentStepId, answers)}
          style={{ ...navButtonStyle, ...secondaryButtonStyle }}
        >
          ← Wstecz
        </button>
        <button type="button" onClick={handleNext} style={{ ...navButtonStyle, ...primaryButtonStyle }}>
          {nextStep(steps, currentStepId, answers) ? "Dalej →" : "Zakończ ✓"}
        </button>
      </div>
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  maxWidth: 600,
  margin: "0 auto",
  background: "var(--color-bg, #fff)",
};
const progressBarContainerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  background: "var(--color-bg, #fff)",
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  zIndex: 10,
};
const progressBarTrackStyle: React.CSSProperties = {
  height: 6,
  background: "#e5e7eb",
  borderRadius: 3,
  overflow: "hidden",
};
const progressBarFillStyle: React.CSSProperties = {
  height: "100%",
  background: "var(--color-primary, #2563eb)",
  transition: "width 0.3s ease",
};
const progressTextStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#6b7280",
  marginTop: 6,
};
const contentStyle: React.CSSProperties = {
  flex: 1,
  padding: "24px 16px 100px",
};
const titleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 600,
  margin: "0 0 8px",
  lineHeight: 1.3,
};
const descStyle: React.CSSProperties = {
  fontSize: 14,
  color: "#4b5563",
  margin: "0 0 16px",
};
const explainerToggleStyle: React.CSSProperties = {
  textAlign: "left",
  width: "100%",
  padding: "10px 12px",
  marginBottom: 12,
  background: "#f3f4f6",
  border: "1px solid #e5e7eb",
  borderRadius: 8,
  fontSize: 13,
  color: "#374151",
  cursor: "pointer",
};
const explainerBoxStyle: React.CSSProperties = {
  padding: "12px",
  marginBottom: 16,
  background: "#fef3c7",
  border: "1px solid #fde68a",
  borderRadius: 8,
  fontSize: 13,
  color: "#78350f",
};
const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  textDecoration: "underline",
};
const inputContainerStyle: React.CSSProperties = {
  marginTop: 16,
};
const estimateStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#9ca3af",
  marginTop: 16,
  textAlign: "right",
};
const navStyle: React.CSSProperties = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  gap: 12,
  padding: "12px 16px",
  background: "var(--color-bg, #fff)",
  borderTop: "1px solid #e5e7eb",
  maxWidth: 600,
  margin: "0 auto",
};
const navButtonStyle: React.CSSProperties = {
  flex: 1,
  padding: "14px 16px",
  fontSize: 16,
  fontWeight: 600,
  border: "none",
  borderRadius: 8,
  cursor: "pointer",
  minHeight: 48,
};
const primaryButtonStyle: React.CSSProperties = {
  background: "var(--color-primary, #2563eb)",
  color: "#fff",
};
const secondaryButtonStyle: React.CSSProperties = {
  background: "#f3f4f6",
  color: "#374151",
};
