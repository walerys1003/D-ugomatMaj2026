# 3.3.2 — Skala typograficzna — fluid typography z clamp()

_source: SPEC_BRAND · tags: frontend · line 138 · 1354 chars_

Zastosowanie fluid typography eliminuje breakpointowe skoki rozmiaru. Agent AI implementuje to jako CSS custom properties z clamp():
:root {
  /* Display scale — tylko landing i marketing */
  --text-display-hero: clamp(2.25rem, 3vw + 1rem, 3.5rem);     /* 36-56px */
  --text-display-h1:   clamp(1.875rem, 2.5vw + 0.75rem, 3rem); /* 30-48px */
  --text-display-h2:   clamp(1.5rem, 2vw + 0.5rem, 2.25rem);   /* 24-36px */

  /* Interface scale — dashboard i aplikacja */
  --text-h1:    clamp(1.375rem, 1.5vw + 0.5rem, 1.75rem);  /* 22-28px */
  --text-h2:    clamp(1.125rem, 1.2vw + 0.4rem, 1.5rem);   /* 18-24px */
  --text-h3:    clamp(1rem, 1vw + 0.3rem, 1.25rem);         /* 16-20px */
  --text-body:  clamp(0.9375rem, 0.5vw + 0.75rem, 1.0625rem); /* 15-17px */
  --text-small: clamp(0.8125rem, 0.3vw + 0.7rem, 0.875rem);  /* 13-14px */
  --text-xs:    0.75rem;                                       /* 12px — fixed */

  /* Line heights */
  --leading-tight:   1.25;
  --leading-snug:    1.375;
  --leading-normal:  1.5;
  --leading-relaxed: 1.625;
  --leading-loose:   1.75;

  /* Letter spacing */
  --tracking-tight:  -0.02em;  /* Nagłówki display */
  --tracking-normal:  0em;
  --tracking-wide:    0.01em;  /* Small text, labels */
  --tracking-wider:   0.05em;  /* Overline, badge text */
  --tracking-widest:  0.1em;   /* Caps in badges */
}
