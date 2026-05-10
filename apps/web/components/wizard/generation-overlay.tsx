"use client";

/**
 * GenerationOverlay — fullscreen modal pokazywany w trakcie generowania pisma.
 *
 * Tarcza ton:
 *   - 5 spokojnych faz (każda 1.5–2s, łącznie ~8–12s — pasuje do realnego LLM call)
 *   - Każda faza ma deterministyczny status, by user nie czuł się "zawieszony"
 *   - Brak panicznych ostrzeżeń, brak liczników "X% done" (Sonnet streaming jest
 *     niedeterministyczny w czasie — zamiast cyfr pokazujemy fazę)
 *   - Po sukcesie automatycznie zamyka się i przekazuje routing wyżej
 *
 * Implementacja:
 *   - Open/close kontrolowane przez `isOpen` z parent (CaseWizardClient)
 *   - Faza animowana przez Framer Motion (24ms shield-out ease)
 *   - Cycle przez fazy co `phaseInterval` ms; ostatnia faza ("Finalizuję")
 *     trzyma się aż parent zamknie modal
 */
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Brain,
  ShieldCheck,
  FileCheck2,
  Loader2,
} from "lucide-react";

const PHASES = [
  {
    id: "analyze",
    icon: Brain,
    label: "Analizuję dane Twojej sprawy",
    detail: "Mapowanie zarzutów na podstawy prawne…",
  },
  {
    id: "context",
    icon: Sparkles,
    label: "Pobieram kontekst prawny",
    detail: "Wyszukuję najbliższe przepisy i orzecznictwo…",
  },
  {
    id: "generate",
    icon: Sparkles,
    label: "Piszę projekt pisma",
    detail: "Claude Sonnet 4.5 — generator argumentacji…",
  },
  {
    id: "validate",
    icon: ShieldCheck,
    label: "Walidacja prawnicza",
    detail: "Claude Haiku — sprawdzam petitum, kompletność, cytaty…",
  },
  {
    id: "finalize",
    icon: FileCheck2,
    label: "Finalizuję dokument",
    detail: "Renderuję wersję gotową do druku…",
  },
] as const;

type PhaseId = typeof PHASES[number]["id"];

interface GenerationOverlayProps {
  isOpen: boolean;
  /** Interwał między fazami w ms. Default 1800ms (×4 = ~7.2s do ostatniej fazy). */
  phaseInterval?: number;
}

export function GenerationOverlay({
  isOpen,
  phaseInterval = 1800,
}: GenerationOverlayProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setPhaseIndex(0);
      return;
    }
    // Cycle through phases; ostatnia (finalize) trzyma się aż do zamknięcia
    const id = window.setInterval(() => {
      setPhaseIndex((i) => Math.min(i + 1, PHASES.length - 1));
    }, phaseInterval);
    return () => window.clearInterval(id);
  }, [isOpen, phaseInterval]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="gen-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-shield-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mx-4 w-full max-w-md rounded-2xl border border-shield-100 bg-white p-6 shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-shield-100 text-shield-700">
                <Loader2 className="size-5 animate-spin" aria-hidden />
              </div>
              <div>
                <p className="text-fluid-xs font-medium uppercase tracking-wider text-shield-700">
                  Długomat · AI
                </p>
                <h2
                  id="gen-title"
                  className="text-fluid-lg font-semibold text-shield-950"
                >
                  Przygotowuję Twoje pismo
                </h2>
              </div>
            </div>

            <ol
              className="mt-5 space-y-2"
              aria-live="polite"
              aria-atomic="false"
            >
              {PHASES.map((phase, idx) => {
                const state =
                  idx < phaseIndex
                    ? "done"
                    : idx === phaseIndex
                      ? "active"
                      : "pending";
                return (
                  <PhaseItem
                    key={phase.id}
                    id={phase.id}
                    icon={phase.icon}
                    label={phase.label}
                    detail={phase.detail}
                    state={state}
                  />
                );
              })}
            </ol>

            <p className="mt-5 border-t border-shield-50 pt-3 text-fluid-xs text-iron-600">
              Generowanie zwykle zajmuje 8–15 sekund. Twoje dane są przetwarzane
              w bezpiecznym środowisku — żadne treści nie trafiają do trenowania
              modeli.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhaseItem({
  id,
  icon: Icon,
  label,
  detail,
  state,
}: {
  id: PhaseId;
  icon: typeof Sparkles;
  label: string;
  detail: string;
  state: "done" | "active" | "pending";
}) {
  return (
    <li
      className={`flex items-start gap-3 rounded-lg p-2 transition-colors ${
        state === "active"
          ? "bg-shield-50/80"
          : state === "done"
            ? "opacity-70"
            : "opacity-40"
      }`}
      aria-current={state === "active" ? "step" : undefined}
      data-state={state}
      data-phase={id}
    >
      <div
        className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
          state === "active"
            ? "bg-shield-500 text-white"
            : state === "done"
              ? "bg-hope-500 text-white"
              : "bg-iron-100 text-iron-400"
        }`}
        aria-hidden
      >
        {state === "active" ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Icon className="size-3.5" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-fluid-sm font-medium text-shield-900">{label}</p>
        {state === "active" && (
          <p className="text-fluid-xs text-iron-600">{detail}</p>
        )}
      </div>
    </li>
  );
}
