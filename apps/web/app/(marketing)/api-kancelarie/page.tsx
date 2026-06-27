import type { Metadata } from "next";
import {
  Code2,
  Webhook,
  KeyRound,
  Layers,
  Gauge,
  ShieldCheck,
  FileText,
  GitBranch,
} from "lucide-react";
import {
  PageHero,
  PageSection,
  FeatureGrid,
  FeatureCard,
  CheckList,
  CtaBand,
} from "@/components/marketing/premium-page";

export const metadata: Metadata = {
  title: "API dla kancelarii — Długomat dla profesjonalistów",
  description:
    "REST API i integracje dla kancelarii i firm windykacyjnych: analiza dokumentów, " +
    "generowanie pism, webhooks, white-label. Skaluj obsługę spraw z Długomat.",
  alternates: { canonical: "/api-kancelarie" },
};

export default function ApiKancelariePage() {
  return (
    <>
      <PageHero
        eyebrow="Dla kancelarii i firm"
        title={
          <>
            Silnik prawny Długomat{" "}
            <span className="text-dlugomat-600">w Twojej infrastrukturze.</span>
          </>
        }
        lede="Wbuduj analizę dokumentów i generowanie pism procesowych we własne systemy. REST API, webhooks, white-label i rozliczenie za zużycie — zaprojektowane pod kancelarie i działy prawne."
        primary={{ href: "/kontakt/firmy", label: "Poproś o klucz API" }}
        secondary={{ href: "/dla-firm", label: "Oferta dla firm" }}
      />

      <PageSection eyebrow="Możliwości API" title="Czym integrujesz się z Długomat">
        <FeatureGrid cols={3}>
          <FeatureCard icon={FileText} title="Analiza dokumentów">
            Endpoint <code className="rounded bg-ink-100 px-1 text-[13px]">POST /v1/analyze</code> —
            wgraj PDF/obraz, odbierz strukturalną analizę sprawy.
          </FeatureCard>
          <FeatureCard icon={GitBranch} title="Generowanie pism">
            <code className="rounded bg-ink-100 px-1 text-[13px]">POST /v1/documents</code> — sprzeciw
            EPU, zarzuty, skargi z cytowaniem przepisów.
          </FeatureCard>
          <FeatureCard icon={Webhook} title="Webhooks">
            Asynchroniczne zadania — powiadomienia o zakończeniu analizy i statusie pism.
          </FeatureCard>
          <FeatureCard icon={KeyRound} title="Uwierzytelnianie">
            Klucze API z zakresami uprawnień, rotacja kluczy, audyt wywołań.
          </FeatureCard>
          <FeatureCard icon={Layers} title="White-label">
            Własny branding, domena i szablony pism. Twoi klienci nie widzą Długomat.
          </FeatureCard>
          <FeatureCard icon={Gauge} title="Rate limits i SLA">
            Przewidywalne limity, dedykowana przepustowość i umowne SLA dla planów B2B.
          </FeatureCard>
        </FeatureGrid>
      </PageSection>

      <PageSection eyebrow="Przykład" title="Wywołanie w kilka linii" tinted>
        <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border border-ink-200 bg-dlugomat-950 shadow-lg">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
            <Code2 className="size-4 text-dlugomat-300" aria-hidden />
            <span className="font-mono text-[12px] text-ink-300">analyze.sh</span>
          </div>
          <pre className="overflow-x-auto px-5 py-5 font-mono text-[13px] leading-relaxed text-ink-200">
            <code>{`curl -X POST https://api.dlugomat.pl/v1/analyze \\
  -H "Authorization: Bearer $DLUGOMAT_API_KEY" \\
  -H "Content-Type: multipart/form-data" \\
  -F "file=@nakaz.pdf" \\
  -F "module=auto"

# → 202 Accepted
# {
#   "job_id": "anl_8f2c...",
#   "status": "processing",
#   "webhook": "https://twoja-kancelaria.pl/hooks/dlugomat"
# }`}</code>
          </pre>
        </div>
      </PageSection>

      <PageSection eyebrow="Dla zespołów" title="Co dostaje kancelaria">
        <div className="mx-auto max-w-2xl">
          <CheckList
            items={[
              "Pełna dokumentacja REST API z sandboxem testowym",
              "White-label: branding, domena, własne szablony pism",
              "Panel zespołowy: role, uprawnienia, rozliczenie zużycia",
              "Webhooks i kolejka zadań do obsługi dużych wolumenów",
              "DPA (umowa powierzenia) i zgodność z RODO out-of-the-box",
              "Dedykowane wsparcie wdrożeniowe i SLA",
            ]}
          />
        </div>
      </PageSection>

      <CtaBand
        title="Zbudujmy to razem"
        lede="Opowiedz nam o swoim procesie — dobierzemy zakres API i plan rozliczeń pod Twój wolumen spraw."
        primary={{ href: "/kontakt/firmy", label: "Umów rozmowę techniczną" }}
        secondary={{ href: "/cennik", label: "Zobacz plany B2B" }}
      />
    </>
  );
}
