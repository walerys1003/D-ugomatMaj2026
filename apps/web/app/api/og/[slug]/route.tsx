/**
 * Wave 9 / W9-3b — Dynamic Open Graph image generator.
 *
 * Endpoint: GET /api/og/<slug>?title=...&subtitle=...&kind=...
 *
 * Returns a 1200x630 PNG suitable for og:image / twitter:image meta tags.
 * Renders fully on the edge runtime via @vercel/og's ImageResponse —
 * no Node APIs needed, ~50ms cold start.
 *
 * Usage from page metadata:
 *
 *   export const metadata: Metadata = {
 *     openGraph: {
 *       images: [{
 *         url: `/api/og/${slug}?title=${encodeURIComponent(title)}`,
 *         width: 1200, height: 630,
 *       }],
 *     },
 *   };
 *
 * Query params:
 *   - title    (string, max 100 chars) — main heading
 *   - subtitle (string, max 200 chars) — secondary line
 *   - kind     ("article" | "module" | "case" | "marketing") — color theme
 *
 * Brand: Długomat / Mandatomat — Polish legal-tech SaaS.
 */
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const KIND_THEMES: Record<string, { bg: string; accent: string; label: string }> = {
  article:   { bg: "#0B1220", accent: "#7DD3FC", label: "Baza wiedzy" },
  module:    { bg: "#111827", accent: "#A78BFA", label: "Moduł" },
  case:      { bg: "#0F172A", accent: "#34D399", label: "Case study" },
  marketing: { bg: "#1E293B", accent: "#FCD34D", label: "Długomat" },
};

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const url = new URL(req.url);
  const title = (url.searchParams.get("title") ?? params.slug.replace(/-/g, " ")).slice(0, 100);
  const subtitle = (url.searchParams.get("subtitle") ?? "").slice(0, 200);
  const kind = url.searchParams.get("kind") ?? "marketing";
  const theme = KIND_THEMES[kind] ?? KIND_THEMES.marketing;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: `linear-gradient(135deg, ${theme.bg} 0%, #000 100%)`,
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Top label + brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: 28,
              fontWeight: 600,
              color: theme.accent,
              textTransform: "uppercase",
              letterSpacing: 4,
            }}
          >
            {theme.label}
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "white",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: theme.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: theme.bg,
                fontWeight: 900,
                fontSize: 24,
              }}
            >
              D
            </div>
            <span>Długomat</span>
          </div>
        </div>

        {/* Main title */}
        <div
          style={{
            fontSize: title.length > 60 ? 64 : 76,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "white",
            marginTop: "20px",
            marginBottom: subtitle ? "30px" : "0",
            letterSpacing: -1,
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.35,
              color: "rgba(255,255,255,0.75)",
              maxWidth: "90%",
              fontWeight: 400,
            }}
          >
            {subtitle}
          </div>
        )}

        {/* Bottom strip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "absolute",
            bottom: "60px",
            left: "80px",
            right: "80px",
          }}
        >
          <div
            style={{
              fontSize: 22,
              color: "rgba(255,255,255,0.6)",
            }}
          >
            dlugomat.app
          </div>
          <div
            style={{
              fontSize: 22,
              color: theme.accent,
              fontWeight: 600,
            }}
          >
            AI-powered legal-tech
          </div>
        </div>

        {/* Accent corner glow */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "100%",
            background: `radial-gradient(circle, ${theme.accent}33 0%, transparent 70%)`,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // 1-year immutable cache — pages should pass deterministic params.
      headers: {
        "cache-control": "public, max-age=31536000, immutable",
      },
    },
  );
}
