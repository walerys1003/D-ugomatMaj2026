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
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem",
        xl: "2.5rem",
        "2xl": "3rem",
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
        // Iron neutrals — body text, borders, surfaces.
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
      },
      fontSize: {
        // Fluid type scale (clamp): brand spec §3.3.2.
        // [min, max] sizes interpolate between 360px and 1280px viewports.
        "fluid-xs": ["clamp(0.75rem, 0.7rem + 0.2vw, 0.8125rem)", { lineHeight: "1.5" }],
        "fluid-sm": ["clamp(0.875rem, 0.82rem + 0.25vw, 0.9375rem)", { lineHeight: "1.55" }],
        "fluid-base": ["clamp(1rem, 0.95rem + 0.25vw, 1.0625rem)", { lineHeight: "1.65" }],
        "fluid-lg": ["clamp(1.125rem, 1.06rem + 0.3vw, 1.1875rem)", { lineHeight: "1.6" }],
        "fluid-xl": ["clamp(1.25rem, 1.15rem + 0.5vw, 1.375rem)", { lineHeight: "1.5" }],
        "fluid-2xl": ["clamp(1.5rem, 1.35rem + 0.75vw, 1.75rem)", { lineHeight: "1.35" }],
        "fluid-3xl": ["clamp(1.875rem, 1.65rem + 1.1vw, 2.25rem)", { lineHeight: "1.25" }],
        "fluid-4xl": ["clamp(2.25rem, 1.95rem + 1.5vw, 2.875rem)", { lineHeight: "1.15" }],
        "fluid-5xl": ["clamp(2.875rem, 2.45rem + 2.1vw, 3.75rem)", { lineHeight: "1.1" }],
        "fluid-6xl": ["clamp(3.5rem, 2.9rem + 3vw, 4.75rem)", { lineHeight: "1.05" }],
      },
      borderRadius: {
        // Tarcza radii — never bouncy. Brand spec §3.4.2.
        sm: "0.25rem", // 4px  — chips, tight badges
        DEFAULT: "0.5rem", // 8px  — inputs, ghost buttons
        md: "0.5rem", // 8px  — alias
        lg: "0.75rem", // 12px — cards, primary buttons
        xl: "1.25rem", // 20px — hero panels, modals
        "2xl": "1.75rem",
      },
      boxShadow: {
        // §3.4.3 — calm, layered, never dramatic.
        subtle: "0 1px 2px 0 hsl(var(--dlugomat-950) / 0.04)",
        card: "0 2px 6px -1px hsl(var(--dlugomat-950) / 0.06), 0 1px 2px hsl(var(--dlugomat-950) / 0.04)",
        pop: "0 10px 24px -8px hsl(var(--dlugomat-950) / 0.18), 0 4px 8px -4px hsl(var(--dlugomat-950) / 0.08)",
        focus: "0 0 0 3px hsl(var(--ring) / 0.45)",
        "shield-focus":
          "0 0 0 2px hsl(var(--background)), 0 0 0 5px hsl(var(--dlugomat-500) / 0.55)",
        pressed: "inset 0 1px 2px 0 hsl(var(--dlugomat-950) / 0.18)",
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
