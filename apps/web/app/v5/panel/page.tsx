/**
 * V5-INFRA · User Panel demo
 * --------------------------------------------------------------------------
 * Route: /v5/panel
 * Mounted as live demo of V5PanelShell + V5PanelDashboard.
 */
import type { Metadata } from "next";

import { V5PanelShell, V5PanelTopBar } from "@/components/v5/panel/shell";
import { V5PanelDashboard } from "@/components/v5/panel/dashboard";

export const metadata: Metadata = {
  title: "Pulpit · Mandatomat V5",
  description: "Procedural workspace — AI legal infrastructure dashboard.",
};

export default function V5PanelPage() {
  return (
    <div data-v5-panel className="min-h-screen bg-[hsl(var(--v5-infra-25))] overflow-x-hidden">
      <V5PanelShell activePath="/panel/dashboard">
        <V5PanelTopBar
          title="Pulpit"
          breadcrumbs={["Mandatomat", "Pulpit"]}
        />
        <V5PanelDashboard />
      </V5PanelShell>
    </div>
  );
}
