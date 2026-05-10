// Tier 5.3 — opcjonalny bundle analyzer.
// Włączany przez `ANALYZE=true npm run build` (alias: `npm run analyze`).
// Dynamiczny import unika twardej zależności w runtime produkcyjnym.
let withBundleAnalyzer = (config) => config;
if (process.env.ANALYZE === "true") {
  try {
    const mod = await import("@next/bundle-analyzer");
    withBundleAnalyzer = mod.default({ enabled: true });
  } catch {
    console.warn(
      "[next.config] ANALYZE=true ale brak @next/bundle-analyzer — " +
        "uruchom `npm i -D @next/bundle-analyzer` aby włączyć raport.",
    );
  }
}

// Tier 5.5 — production security check.
// Wymusza obecność krytycznych sekretów w produkcji (NODE_ENV=production +
// VERCEL_ENV=production). Brak któregokolwiek = throw przy buildzie/uruchomieniu.
//
// Pominięte celowo w dev/preview/test, bo lokalnie programista nie zawsze ma
// wszystkie integracje pod ręką.
if (
  process.env.NODE_ENV === "production" &&
  process.env.VERCEL_ENV === "production" &&
  process.env.SKIP_PROD_ENV_CHECK !== "1"
) {
  const required = [
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "CRON_SECRET",
  ];
  const missing = required.filter((k) => !process.env[k] || process.env[k] === "");
  if (missing.length > 0) {
    throw new Error(
      `[next.config] Brakujące zmienne środowiskowe (production): ${missing.join(", ")}. ` +
        `Ustaw je w panelu Vercel/hostingu albo SKIP_PROD_ENV_CHECK=1 by ominąć (NIE w produkcji!).`,
    );
  }
  // Soft-warn dla integracji opcjonalnych — brak nie blokuje deploy'u, ale loguje.
  const optional = [
    ["RESEND_API_KEY", "Email (Resend) — powiadomienia o terminach nie będą wysyłane."],
    ["RESEND_FROM_EMAIL", "Email (Resend) — brak nadawcy, wysyłki nie zadziałają."],
    ["SMSAPI_OAUTH_TOKEN", "SMS (SMSAPI) — przypomnienia D3/D1/D0 SMS-em wyłączone."],
    ["APIPOD_API_KEY", "AI (APIPod) — fallback do ANTHROPIC_API_KEY albo static template."],
    ["ANTHROPIC_API_KEY", "AI (Anthropic direct) — fallback wyłączony."],
    ["FAKTUROWNIA_API_TOKEN", "Fakturownia — faktury nie będą wystawiane automatycznie."],
  ];
  for (const [key, hint] of optional) {
    if (!process.env[key]) {
      console.warn(`[next.config] (warn) brak ${key} — ${hint}`);
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // Tier 5.3 — bundle optimisations.
  // optimizePackageImports tree-shake'uje barrel exports (lucide ma 1k+ ikon,
  // framer-motion ~600KB). modularizeImports kieruje bezpośrednio do plików
  // źródłowych, eliminując barrel resolution na etapie webpack.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "date-fns",
      "react-hook-form",
      "@radix-ui/react-icons",
    ],
    // Tier 5.3 — OCR (tesseract.js, AWS Textract) traktowane jako external,
    // bo bundlowanie psuje rozmiar i resolve worker'ów w RSC.
    serverComponentsExternalPackages: [
      "tesseract.js",
      "@aws-sdk/client-textract",
    ],
    // Tier 5 zad. 248 — instrumentation.ts hook dla Sentry init.
    instrumentationHook: true,
  },

  // Tier 5.3 — image optimisation.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dni dla statycznych obrazów
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1440, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Tier 5.3 — production-only compiler optimizations.
  compiler: {
    // Usuwa console.log w produkcji (zachowuje warn/error).
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },

  // Tier 5.3 — minimalna ekspozycja informacji + lepsze caching headerów
  // dla statycznych assetów (ikon, fontów).
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        // Long-term cache dla zoptymalizowanych obrazów Next.js.
        source: "/_next/image(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Long-term cache dla statycznych assetów.
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        // robots.txt + sitemap.xml — krótszy cache, częste odświeżanie.
        source: "/(robots.txt|sitemap.xml)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=86400",
          },
        ],
      },
      // ===== Tier 5 zad. 219 — Edge caching dla marketing routes =====
      // Strategia: SWR (stale-while-revalidate) na CDN edge.
      // - max-age (browser): krótkie (5–10 min) — żeby user szybko widział zmiany po deployu
      // - s-maxage (edge): długie (1–24h) — bo CDN i tak odświeża po revalidate w Next.js
      // - stale-while-revalidate: serwuje stary content w tle, w trakcie pobiera nowy
      //
      // Strony zmieniają się rzadko (regulamin, RODO, DPA = co kilka miesięcy)
      // lub średnio (cennik, jak-to-dziala = co kilka tygodni).
      {
        // Landing — najważniejsza strona, balanced TTL.
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },
      {
        // Statyczne strony marketingowe — długi edge cache.
        source:
          "/(jak-to-dziala|cennik|o-nas|moduly|kontakt|baza-wiedzy|baza-wiedzy/.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=600, s-maxage=21600, stale-while-revalidate=604800",
          },
          { key: "Vary", value: "Accept-Encoding" },
        ],
      },
      {
        // Strony prawne — bardzo rzadko się zmieniają, ale przy zmianie
        // chcemy szybko odświeżyć (SWR 1h). max-age browser krótki, by
        // przy zmianie polityki user nie utknął ze starą wersją na 24h.
        source: "/(regulamin|rodo|dpa|polityka-prywatnosci)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=600, s-maxage=86400, stale-while-revalidate=3600",
          },
        ],
      },
      {
        // Skaner nakazu, kalkulatory — interaktywne lecz publiczne, średni cache.
        source: "/(skaner-nakazu|kalkulatory|kalkulatory/.*)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Changelog / status / program-partnerski — częstsze zmiany.
        source: "/(changelog|status|program-partnerski)",
        headers: [
          {
            key: "Cache-Control",
            value:
              "public, max-age=60, s-maxage=300, stale-while-revalidate=3600",
          },
        ],
      },
      {
        // /panel/* + /admin/* + /auth/* — NIGDY nie cache'ować na edge.
        // Per-user content + sesje.
        source: "/(panel|admin|auth)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
      {
        // /api/* — cache strategy decyduje sama route.
        // Ten match jest defaultowo private, by uniknąć leak'u danych.
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
