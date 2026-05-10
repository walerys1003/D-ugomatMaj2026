# 5.8 — SEO (strony marketingowe)

_source: SPEC_FULL · tags: database, ai-engine, payments · line 856 · 814 chars_

Każda strona marketingowa ma unikalne <title> i <meta name="description"> z frazą kluczową. Struktura nagłówków: jeden <h1> na stronę, hierarchia h2 > h3 > h4 bez przeskoków. Schema.org(http://schema.org/) JSON-LD: FAQPage na stronie FAQ, Product na cennikach, Article na blogu, Organization na stronie głównej, BreadcrumbList na każdej podstronie. Open Graph i Twitter Card meta tags z dedykowanymi grafikami OG (1200×630px) per strona. Canonical URLs. sitemap.xml generowany dynamicznie przez Next.js. robots.txt blokujący /panel/, /api/, indeksujący wszystkie strony marketingowe. Core Web Vitals targets: LCP < 2.5s (SSG/ISR), FID < 100ms (minimalne JS na marketing pages), CLS < 0.1 (explicit width/height na obrazach, font-display: swap). Blog: ISR z rewalidacją co 3600s, internal linking między artykułami.
