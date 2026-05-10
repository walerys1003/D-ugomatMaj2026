/**
 * Tier 6 zad. 277 — Font preload + size-adjust descriptors.
 *
 * Cel: zminimalizować CLS (Cumulative Layout Shift) i FOUT (Flash of
 * Unstyled Text) przez:
 *   - preload kluczowych fontów (regular + 600) z `as="font"` i `crossorigin`
 *   - `size-adjust` + `ascent-override` w @font-face dla matchowania metryk
 *     fallback'a (system-ui)
 *   - `font-display: swap` aby pierwsze paint korzystało z fallback'a
 *
 * Użycie w `app/layout.tsx`:
 *   <head>
 *     {FONT_PRELOAD_TAGS.map((t) => <link key={t.href} rel="preload" {...t} />)}
 *   </head>
 */

export interface FontPreloadTag {
  href: string;
  as: "font";
  type: string;
  crossOrigin: "anonymous";
}

/**
 * Kluczowe pliki fontów dla LCP (above-the-fold).
 * Pełen zestaw 9 wag ładujemy lazy przez CSS @font-face.
 */
export const FONT_PRELOAD_TAGS: FontPreloadTag[] = [
  {
    href: "/fonts/inter-var-latin.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  {
    href: "/fonts/inter-var-latin-ext.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
];

/**
 * Fallback font stack — używany przed załadowaniem Inter.
 * Te metryki (size-adjust, ascent-override) są obliczone przez Capsize
 * (https://seek-oss.github.io/capsize/) aby były pixel-perfect z Inter.
 */
export const FALLBACK_FONT_CSS = `
@font-face {
  font-family: "Inter Fallback";
  font-style: normal;
  font-weight: 400 700;
  src: local("Arial");
  size-adjust: 107.4%;
  ascent-override: 90%;
  descent-override: 22.43%;
  line-gap-override: 0%;
}
`.trim();

/**
 * @font-face dla Inter (latin + latin-ext, variable).
 * font-display: swap → pierwsze paint korzysta z fallback'a.
 * unicode-range → ograniczenie zakresu znaków (mniejszy fetch).
 */
export const INTER_FONT_CSS = `
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter-var-latin.woff2") format("woff2-variations"),
       url("/fonts/inter-var-latin.woff2") format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: "Inter";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("/fonts/inter-var-latin-ext.woff2") format("woff2-variations"),
       url("/fonts/inter-var-latin-ext.woff2") format("woff2");
  unicode-range: U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
`.trim();

export function getFontStack(): string {
  return `"Inter", "Inter Fallback", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
}
