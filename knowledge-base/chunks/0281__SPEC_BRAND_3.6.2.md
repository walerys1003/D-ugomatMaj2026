# 3.6.2 — Animacje przejść między krokami

_source: SPEC_BRAND · tags: frontend · line 483 · 1813 chars_

Agent AI implementuje przejścia między krokami wizarda z użyciem Framer Motion. Cel: płynność, brak „teleportacji", ale bez przesadnej teatralności. Użytkownik jest w stresie — animacja ma być spokojna i kierunkowa, nie spektakularna.
// Konfiguracja animacji przejścia między krokami wizarda
// Plik: src/components/wizard/WizardStepTransition.tsx

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,  // 80px — krótki, pewny ruch
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

const stepTransition = {
  x: {
    type: "spring",
    stiffness: 350,   // szybka reakcja
    damping: 35,       // brak „odbicia" — pewność, nie zabawa
    mass: 0.8
  },
  opacity: {
    duration: 0.2,
    ease: "easeInOut"
  },
};

// Komponent:
<AnimatePresence mode="wait" custom={direction}>
  <motion.div
    key={currentStep}
    custom={direction}
    variants={stepVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={stepTransition}
  >
    {children}
  </motion.div>
</AnimatePresence>

Reguły animacji — bezwzględne:
Czas trwania przejścia: 200-350ms. Nigdy powyżej 400ms. Użytkownik nie ogląda — użytkownik działa.
Kierunek: Dalej = slide left-to-right (x: 80→0). Wstecz = slide right-to-left (x: -80→0). Spójne z mentalnym modelem „postępu".
Progress bar: animacja width z transition: width 500ms cubic-bezier(0.16, 1, 0.3, 1) — nieco wolniejsza niż krok, daje poczucie „napełniania się".
prefers-reduced-motion: reduce — wyłącz wszystkie animacje x/y, zostaw tylko opacity fade 150ms. Bezwzględnie.
Żaden element formularza nie może animować się po załadowaniu kroku. Formularz jest gotowy natychmiast — żadnych „wjeżdżających" inputów.
