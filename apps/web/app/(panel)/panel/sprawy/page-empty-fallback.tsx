/**
 * Tier 29 — Empty state fallback for cases list.
 * Server component — można importować zarówno z RSC jak i Client.
 */
import { EmptyCases } from "@/lib/ux/empty-state-presets";

export function CasesEmpty() {
  return <EmptyCases />;
}
