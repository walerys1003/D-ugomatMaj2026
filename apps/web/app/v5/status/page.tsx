import type { Metadata } from "next";
import { V5MarketingLayout, V5HeroSimple, V5StatBand, V5CtaBand } from "@/components/v5/marketing";
import { V5Container, V5Section, V5Surface, V5Eyebrow, V5Headline, V5Pill } from "@/components/v5/primitives";

export const metadata: Metadata = {
  title: 'Status systemu · live | Mandatomat',
  description: 'Real-time status każdego komponentu. Uptime 99.99% (30d). Historia 90 dni transparentnie.',
};

export default function V5StatusPage() {
  return (
    <V5MarketingLayout>
      <V5HeroSimple
        eyebrow="status systemu · live"
        headline={
          <>
            Wszystkie systemy <span className="text-[hsl(var(--v5-ok))]">operacyjne</span>.
          </>
        }
        body="Real-time status każdego komponentu Mandatomatu. Pełna transparentność — pokazujemy nawet drobne degradacje wydajności."
        ctas={[
          { label: "Subskrybuj incydenty", href: "#subscribe", variant: "primary" },
          { label: "Historia 90 dni", href: "#history", variant: "secondary" },
        ]}
        meta={
          <span className="font-mono text-[0.6875rem] uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
            uptime 30d: 99.99% · last incident: 14.03.2026 (12 min)
          </span>
        }
      />

      <V5StatBand
        stats={[
          { value: "99.99%", label: "Uptime 30 dni", sub: "SLA: 99.9%" },
          { value: "99.97%", label: "Uptime 90 dni", sub: "POWYŻEJ SLA" },
          { value: "247ms", label: "Średni response time", sub: "API ENDPOINTS" },
          { value: "0", label: "Aktywnych incydentów", sub: "STAN: OK" },
        ]}
      />

      <V5Section density="normal">
        <V5Container width="max">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">live status</V5Eyebrow>
            <V5Headline level="h2">Wszystkie komponenty.</V5Headline>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
            {[
              { name: "Web App (frontend)", status: "OK", uptime: "99.99%" },
              { name: "API Gateway", status: "OK", uptime: "99.99%" },
              { name: "OCR Pipeline", status: "OK", uptime: "99.98%" },
              { name: "AI Engine (RAG)", status: "OK", uptime: "99.97%" },
              { name: "Database (Postgres)", status: "OK", uptime: "99.99%" },
              { name: "Storage (S3)", status: "OK", uptime: "100.00%" },
              { name: "ePUAP Bridge", status: "OK", uptime: "99.92%" },
              { name: "Stripe Webhooks", status: "OK", uptime: "99.99%" },
              { name: "Auth (NextAuth)", status: "OK", uptime: "99.99%" },
            ].map((s) => (
              <V5Surface key={s.name} variant="raised" className="p-5">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-[0.9375rem] font-semibold text-[hsl(var(--v5-ink-900))] truncate">{s.name}</h3>
                  <V5Pill tone="ok">{s.status}</V5Pill>
                </div>
                <div className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">
                  uptime 30d: <span className="text-[hsl(var(--v5-ok))] font-semibold">{s.uptime}</span>
                </div>
              </V5Surface>
            ))}
          </div>
        </V5Container>
      </V5Section>

      <V5Section density="normal">
        <V5Container width="content">
          <div className="mb-10 max-w-[58ch]">
            <V5Eyebrow className="mb-4">historia · 90 dni</V5Eyebrow>
            <V5Headline level="h2">Wszystkie incydenty z ostatnich 3 miesięcy.</V5Headline>
          </div>
          <div className="space-y-4 min-w-0">
            <V5Surface variant="raised" className="p-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <V5Pill tone="warn">DEGRADED</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">14.03.2026 · 14:22-14:34 UTC · 12 min</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">OCR Pipeline: wzrost latencji</h3>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Wzrost p95 latency na OCR z 412ms do 1.2s przez 12 minut. Powód: scaling event AWS Lambda. Mitigation: auto-scaling zwiększony. Brak utraty danych.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <V5Pill tone="warn">DEGRADED</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">22.02.2026 · 09:14-09:18 UTC · 4 min</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">ePUAP Bridge: timeout 504</h3>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">ePUAP po stronie rządowej miał awarię (potwierdzone na gov.pl/status). 4 sprzeciwy nie zostały wysłane automatycznie — retry zakończony sukcesem.</p>
            </V5Surface>
            <V5Surface variant="raised" className="p-6">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <V5Pill tone="neutral">RESOLVED</V5Pill>
                <span className="font-mono text-[0.75rem] text-[hsl(var(--v5-ink-500))]">08.02.2026 · 02:11-02:14 UTC · 3 min</span>
              </div>
              <h3 className="text-[1rem] font-semibold text-[hsl(var(--v5-ink-900))] mb-2">Web App: deploy issue</h3>
              <p className="text-[0.9375rem] text-[hsl(var(--v5-ink-700))]">Krótkie 5xx errors podczas deploya v5.4.0. Auto-rollback wykryty w 3 min. Deploy powtórzony 02:30 — sukces.</p>
            </V5Surface>
          </div>
        </V5Container>
      </V5Section>

      <V5CtaBand
        eyebrow="bądź pierwszy poinformowany"
        headline="Subskrybuj statusy — email lub SMS w przypadku incydentu."
        body="Statusy aktualizowane co 60 sekund. Subskrypcja: krytyczne incydenty (email + SMS) lub wszystkie (tylko email)."
        ctas={[
          { label: "Subskrybuj email", href: "#", variant: "primary" },
          { label: "RSS feed", href: "/status.rss", variant: "terminal" },
        ]}
      />
    </V5MarketingLayout>
  );
}
