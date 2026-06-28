import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

/**
 * Długomat Tailwind config — implements the "Tarcza" design system.
 *
 * Token mapping (single source of truth):
 *   - Raw scales (dlugomat / accent / warn / danger / iron) live as CSS
 *     variables in styles/globals.css and are surfaced here as Tailwind colours.
 *   - Semantic tokens (background, foreground, primary, etc.) reference the
 *     scales via CSS variables so dark mode is just a different :root scope.
 *
 * Why custom scales (not just `slate`/`emerald`):
 *   - The brand spec mandates exact hex values for institutional trust
 *     (§3.2 — "Shield Navy" navy ≠ Tailwind slate; "Controlled Hope" green
 *     ≠ Tailwind emerald). Mapping them as named scales keeps designer intent
 *     enforceable in code review.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./styles/**/*.{ts,tsx,css}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem", // 20px — 8pt grid (was 16)
        sm: "1.5rem", // 24px
        lg: "2rem", // 32px
        xl: "2.5rem", // 40px
        "2xl": "3rem", // 48px
      },
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        // ---- Raw brand scales (referenced via CSS variables) -----------
        // Primary — Shield Navy (institutional authority).
        dlugomat: {
          50: "hsl(var(--dlugomat-50) / <alpha-value>)",
          100: "hsl(var(--dlugomat-100) / <alpha-value>)",
          200: "hsl(var(--dlugomat-200) / <alpha-value>)",
          300: "hsl(var(--dlugomat-300) / <alpha-value>)",
          400: "hsl(var(--dlugomat-400) / <alpha-value>)",
          500: "hsl(var(--dlugomat-500) / <alpha-value>)",
          600: "hsl(var(--dlugomat-600) / <alpha-value>)",
          700: "hsl(var(--dlugomat-700) / <alpha-value>)",
          800: "hsl(var(--dlugomat-800) / <alpha-value>)",
          850: "hsl(var(--dlugomat-850) / <alpha-value>)",
          900: "hsl(var(--dlugomat-900) / <alpha-value>)",
          950: "hsl(var(--dlugomat-950) / <alpha-value>)",
        },
        // Accent — Controlled Hope Green (success, completion only).
        accent: {
          50: "hsl(var(--accent-50) / <alpha-value>)",
          100: "hsl(var(--accent-100) / <alpha-value>)",
          200: "hsl(var(--accent-200) / <alpha-value>)",
          300: "hsl(var(--accent-300) / <alpha-value>)",
          400: "hsl(var(--accent-400) / <alpha-value>)",
          500: "hsl(var(--accent-500) / <alpha-value>)",
          600: "hsl(var(--accent-600) / <alpha-value>)",
          700: "hsl(var(--accent-700) / <alpha-value>)",
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        // Status — Temporal Signals (only with numeric context, never decoration).
        warn: {
          50: "hsl(var(--warn-50) / <alpha-value>)",
          100: "hsl(var(--warn-100) / <alpha-value>)",
          500: "hsl(var(--warn-500) / <alpha-value>)",
          600: "hsl(var(--warn-600) / <alpha-value>)",
        },
        danger: {
          50: "hsl(var(--danger-50) / <alpha-value>)",
          100: "hsl(var(--danger-100) / <alpha-value>)",
          500: "hsl(var(--danger-500) / <alpha-value>)",
          600: "hsl(var(--danger-600) / <alpha-value>)",
          700: "hsl(var(--danger-700) / <alpha-value>)",
        },
        // Iron neutrals — DEPRECATED for body/borders/neutral surfaces in
        // v3. Pozostawione dla brand-touched akcentów (focus complement,
        // dark mode navy chrome). Nowe komponenty: użyj `ink-*`.
        iron: {
          50: "hsl(var(--iron-50) / <alpha-value>)",
          100: "hsl(var(--iron-100) / <alpha-value>)",
          200: "hsl(var(--iron-200) / <alpha-value>)",
          300: "hsl(var(--iron-300) / <alpha-value>)",
          400: "hsl(var(--iron-400) / <alpha-value>)",
          500: "hsl(var(--iron-500) / <alpha-value>)",
          600: "hsl(var(--iron-600) / <alpha-value>)",
          700: "hsl(var(--iron-700) / <alpha-value>)",
          800: "hsl(var(--iron-800) / <alpha-value>)",
          900: "hsl(var(--iron-900) / <alpha-value>)",
          950: "hsl(var(--iron-950) / <alpha-value>)",
        },
        // Ink (Tarcza v3) — TRUE NEUTRALS. Default for body, borders,
        // sekundarne tła. HSL 0 0% X% — bez niebieskiego tintu który
        // sprawiał, że produkt wyglądał jak „demo banku".
        ink: {
          50: "hsl(var(--ink-50) / <alpha-value>)",
          100: "hsl(var(--ink-100) / <alpha-value>)",
          150: "hsl(var(--ink-150) / <alpha-value>)",
          200: "hsl(var(--ink-200) / <alpha-value>)",
          300: "hsl(var(--ink-300) / <alpha-value>)",
          400: "hsl(var(--ink-400) / <alpha-value>)",
          500: "hsl(var(--ink-500) / <alpha-value>)",
          600: "hsl(var(--ink-600) / <alpha-value>)",
          700: "hsl(var(--ink-700) / <alpha-value>)",
          800: "hsl(var(--ink-800) / <alpha-value>)",
          900: "hsl(var(--ink-900) / <alpha-value>)",
          950: "hsl(var(--ink-950) / <alpha-value>)",
        },

        // ---- Semantic tokens (shadcn-compatible) -----------------------
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
        // `display` to alias dla nagłówków hero/H1/H2 — Inter w tej samej
        // rodzinie co sans, ale z osobnym tokenem żeby designer mógł kiedyś
        // podmienić na display-font (np. Söhne, Geist) bez refaktoru JSX.
        display: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // ===========================================================
        // Tarcza v3 "Stoic" modular type scale (1.250 — Major Third).
        // Każdy rozmiar = poprzedni × 1.25 (z mikro-korektą, by ostatnie
        // dwa nie były bouncy). Wartości w px dla deterministycznego
        // renderingu (clamp zostawione tylko dla display tier — hero h1).
        //
        // Klucze numeryczne (xs/sm/base/...) = canonical v3.
        // `fluid-*` zostawione jako LEGACY ALIASY (back-compat z v2):
        //   - fluid-base → base
        //   - fluid-xl   → xl
        //   - fluid-Nxl  → Nxl
        // Pozwala v2-owym komponentom renderować się poprawnie do czasu
        // migracji JSX na `<Text size>` / `<Heading level>`.
        // ===========================================================
        xs: ["0.75rem", { lineHeight: "1.45", letterSpacing: "0.005em" }], // 12
        sm: ["0.875rem", { lineHeight: "1.5", letterSpacing: "0" }],       // 14
        base: ["0.9375rem", { lineHeight: "1.6", letterSpacing: "0" }],    // 15  ← body default
        md: ["1rem", { lineHeight: "1.6", letterSpacing: "0" }],           // 16
        lg: ["1.125rem", { lineHeight: "1.5", letterSpacing: "-0.005em" }],// 18
        xl: ["1.25rem", { lineHeight: "1.4", letterSpacing: "-0.01em" }],  // 20
        "2xl": ["1.5rem", { lineHeight: "1.3", letterSpacing: "-0.015em" }],     // 24
        "3xl": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],    // 30
        "4xl": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.022em" }],   // 36
        "5xl": ["3rem", { lineHeight: "1.05", letterSpacing: "-0.025em" }],      // 48
        "6xl": ["3.75rem", { lineHeight: "1.02", letterSpacing: "-0.028em" }],   // 60
        "7xl": ["4.5rem", { lineHeight: "1.0", letterSpacing: "-0.03em" }],      // 72
        // Legacy aliases (Tarcza v2 fluid scale → v3 numeric).
        "fluid-xs": ["0.75rem", { lineHeight: "1.45" }],
        "fluid-sm": ["0.875rem", { lineHeight: "1.5" }],
        "fluid-base": ["0.9375rem", { lineHeight: "1.6" }],
        "fluid-lg": ["1.125rem", { lineHeight: "1.5" }],
        "fluid-xl": ["1.25rem", { lineHeight: "1.4" }],
        "fluid-2xl": ["1.5rem", { lineHeight: "1.3" }],
        "fluid-3xl": ["1.875rem", { lineHeight: "1.2" }],
        "fluid-4xl": ["2.25rem", { lineHeight: "1.15" }],
        "fluid-5xl": ["3rem", { lineHeight: "1.05" }],
        "fluid-6xl": ["3.75rem", { lineHeight: "1.02" }],
      },
      borderRadius: {
        // Tarcza v3 "Stoic" radii — Linear/Vercel-grade tight scale.
        // Skok modularny ~1.33 (4→6→8→10→14) zamiast skoku 1.5–1.7 z v2.
        // Pill (rounded-full) tylko na avatarach.
        none: "0",
        xs: "0.125rem",       // 2px  — kbd outline, badge dot pulse
        sm: "0.25rem",        // 4px  — input, badge (was rounded-full!), kbd
        DEFAULT: "0.375rem",  // 6px  — button, surface raised
        md: "0.5rem",         // 8px  — card, surface elevated
        lg: "0.625rem",       // 10px — surface floating, popover
        xl: "0.875rem",       // 14px — modal, hero panel
        "2xl": "1.25rem",     // 20px — empty-state hero card
        "3xl": "1.75rem",     // 28px — splash/onboarding card (rare)
        full: "9999px",
      },
      boxShadow: {
        // Tarcza v3 — kolor-tinted, kierunkowe, zawsze para warstw.
        // Mapowane na CSS-vars w globals.css (auto dark-mode bump).
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        // ---- v2 legacy aliases (do migracji) -----------------------
        subtle: "var(--shadow-sm)",
        card: "var(--shadow-md)",
        pop: "var(--shadow-lg)",
        focus: "0 0 0 3px hsl(var(--ring) / 0.45)",
        "shield-focus":
          "0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(var(--dlugomat-500) / 0.50)",
        pressed: "inset 0 1px 2px 0 hsl(var(--dlugomat-950) / 0.16)",
        // Inset borders dla "ring" efektu na card (Linear pattern).
        "inset-border": "inset 0 0 0 1px hsl(var(--ink-200))",
      },
      spacing: {
        // Tarcza v3 — explicit 8pt grid extension. Tailwind ma 1=4px, 2=8px,
        // 3=12px, 4=16px — to mapuje 1:1 na nasz grid. Dodajemy tylko
        // wartości semantic-named które są używane często.
        "px": "1px",
        "0.5": "0.125rem",   // 2 — micro nudge
        "header": "3.5rem",   // 56 — site header height (v3)
        "sidebar": "16rem",   // 256 — panel/admin sidebar
        "section-y": "6rem",  // 96 — default vertical section padding
      },
      transitionDuration: {
        // Motion tokens — calm-confident, never bouncy. §3.4 motion.
        snappy: "120ms",
        base: "200ms",
        smooth: "280ms",
        deliberate: "360ms",
      },
      transitionTimingFunction: {
        "shield-out": "cubic-bezier(0.22, 0.61, 0.36, 1)",
        "shield-in": "cubic-bezier(0.55, 0.06, 0.68, 0.19)",
        "shield-inout": "cubic-bezier(0.65, 0.05, 0.36, 1)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "shield-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--ring) / 0.4)" },
          "50%": { boxShadow: "0 0 0 6px hsl(var(--ring) / 0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 280ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        "fade-up": "fade-up 320ms cubic-bezier(0.22, 0.61, 0.36, 1)",
        "shield-pulse": "shield-pulse 1.8s cubic-bezier(0.22, 0.61, 0.36, 1) infinite",
      },
    },
  },
  plugins: [animate],
};

export default config;
