/**
 * V5-INFRA · loading state (Wave 5 · AGENT B5)
 * ----------------------------------------------------------------
 * Globalny loading state dla /v5/** routes.
 * Server component — pokazuje skeleton zachowujący layout shift.
 */
import {
  V5Container,
  V5Section,
  V5Surface,
} from "@/components/v5/primitives";
import { V5Footer, V5Header } from "@/components/v5/landing/header";

export default function V5Loading() {
  return (
    <div className="bg-[hsl(var(--v5-infra-25))] overflow-x-hidden min-h-screen">
      <V5Header />
      <main className="min-w-0">
        <V5Section density="normal">
          <V5Container width="max">
            {/* hero skeleton */}
            <div className="mb-12 max-w-[58ch] space-y-4">
              <div className="h-3 w-24 rounded-full bg-[hsl(var(--v5-infra-200))] animate-pulse" />
              <div className="h-12 w-full rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
              <div className="h-12 w-4/5 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
              <div className="h-5 w-3/4 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
              <div className="h-5 w-1/2 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
              <div className="flex gap-3 mt-6">
                <div className="h-12 w-40 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                <div className="h-12 w-32 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
              </div>
            </div>

            {/* stats band skeleton */}
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-16 min-w-0">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-10 w-32 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                  <div className="h-4 w-24 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                  <div className="h-3 w-20 rounded-full bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                </div>
              ))}
            </div>

            {/* feature grid skeleton */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <V5Surface key={i} variant="raised" className="p-7 h-48">
                  <div className="space-y-3">
                    <div className="h-11 w-11 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                    <div className="h-5 w-2/3 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                    <div className="h-3 w-full rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                    <div className="h-3 w-5/6 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                    <div className="h-3 w-3/4 rounded-md bg-[hsl(var(--v5-infra-200))] animate-pulse" />
                  </div>
                </V5Surface>
              ))}
            </div>

            {/* loading indicator */}
            <div className="mt-12 flex items-center justify-center gap-3 text-[0.875rem] font-mono uppercase tracking-[var(--v5-tracking-uppercase)] text-[hsl(var(--v5-ink-500))]">
              <span className="h-2 w-2 rounded-full bg-[hsl(var(--v5-violet-500))] animate-pulse" />
              ładowanie · stream
            </div>
          </V5Container>
        </V5Section>
      </main>
      <V5Footer />
    </div>
  );
}
