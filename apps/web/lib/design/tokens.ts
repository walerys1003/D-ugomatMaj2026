/**
 * Design tokens — typed mirror of CSS variables so non-CSS code (canvas
 * charts, react-pdf, framer-motion config) can reach the same values
 * without duplicating literals.
 *
 * Brand spec sections:
 *   §3.2 colour system       — Shield Navy / Hope Green / Temporal Signals
 *   §3.3 typography          — Inter / IBM Plex Serif / JetBrains Mono
 *   §3.4 spacing & shadows   — 4-pt grid, Tarcza radii, calm motion
 */

export const palette = {
  dlugomat: {
    50: "#F0F7FF",
    100: "#E0EFFF",
    200: "#B8DBFD",
    300: "#89B5EC",
    400: "#5A8FDB",
    500: "#2B69CA",
    600: "#2354A6",
    700: "#1B3F82",
    800: "#132D5E",
    850: "#0F2750",
    900: "#0B1D3A",
    950: "#060E1F",
  },
  accent: {
    50: "#F0FFF4",
    100: "#DCFCE7",
    200: "#A7F3C8",
    300: "#6EE7A0",
    400: "#34D07E",
    500: "#10B461",
    600: "#0D8A4A",
    700: "#087A3E",
  },
  warn: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    500: "#F59E0B",
    600: "#D97706",
  },
  danger: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
    700: "#B91C1C",
  },
  iron: {
    50: "#F8FAFC",
    100: "#EFF3F8",
    200: "#DDE3EC",
    300: "#BCC5D2",
    400: "#8E99AA",
    500: "#6B7383",
    600: "#4F5868",
    700: "#3A4150",
    800: "#262C3A",
    900: "#161B27",
    950: "#0A0E18",
  },
} as const;

export const radius = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1.25rem",
  "2xl": "1.75rem",
} as const;

export const motion = {
  duration: {
    snappy: 120,
    base: 200,
    smooth: 280,
    deliberate: 360,
  },
  ease: {
    out: [0.22, 0.61, 0.36, 1] as const,
    in: [0.55, 0.06, 0.68, 0.19] as const,
    inOut: [0.65, 0.05, 0.36, 1] as const,
  },
} as const;

export const fontFamily = {
  sans: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  serif: "'IBM Plex Serif', Georgia, 'Times New Roman', serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace",
} as const;

/**
 * Status → colour mapping used by the deadline countdown widget,
 * case strip, badges, etc. Always paired with numeric context per spec.
 */
export const statusColor = {
  overdue: palette.danger[700],
  critical: palette.danger[500],
  warning: palette.warn[500],
  normal: palette.dlugomat[500],
  success: palette.accent[500],
} as const;
