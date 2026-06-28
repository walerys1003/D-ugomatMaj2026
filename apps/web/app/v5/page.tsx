/**
 * V5-INFRA · Landing page
 * --------------------------------------------------------------------------
 * Route: /v5
 * Full V5-INFRA landing — replaces V4 marketing landing once gated by the
 * `v5=on` cookie or by explicit `/v5` URL.
 *
 * Composition: V5Header → V5HeroCockpit → V5ProofStrip → V5MetricsBand →
 * V5ReasoningSection → V5ModulesGrid → V5EnterpriseTrust → V5EnterpriseCta →
 * V5Footer.
 */
import type { Metadata } from "next";

import { V5Header, V5Footer } from "@/components/v5/landing/header";
import { V5HeroCockpit } from "@/components/v5/landing/hero-cockpit";
import {
  V5ProofStrip,
  V5MetricsBand,
  V5ReasoningSection,
  V5ModulesGrid,
  V5EnterpriseTrust,
  V5EnterpriseCta,
} from "@/components/v5/landing/sections";

export const metadata: Metadata = {
  title: "Mandatomat · Procedural Intelligence Operating System",
  description:
    "AI-native legal infrastructure. Sprzeciw EPU, BIK, komornik, cesje — " +
    "audit-grade reasoning, signed evidence chain, EPUAP/PAdES signature.",
};

export default function V5LandingPage() {
  return (
    <div data-v5-landing className="bg-[hsl(var(--v5-infra-25))] overflow-x-hidden">
      <V5Header />
      <V5HeroCockpit />
      <V5ProofStrip />
      <V5MetricsBand />
      <V5ReasoningSection />
      <V5ModulesGrid />
      <V5EnterpriseTrust />
      <V5EnterpriseCta />
      <V5Footer />
    </div>
  );
}
