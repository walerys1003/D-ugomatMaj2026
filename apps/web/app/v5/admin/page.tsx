/**
 * V5-INFRA · Admin Ops Center demo
 * --------------------------------------------------------------------------
 * Route: /v5/admin
 * Mounted as live demo of V5AdminShell + V5OpsCenter.
 */
import type { Metadata } from "next";

import { V5AdminShell, V5OpsCenter } from "@/components/v5/admin/ops-center";

export const metadata: Metadata = {
  title: "Operations · Mandatomat V5 Admin",
  description: "Audit-native ops center · realtime KPIs · AI activity · audit log.",
};

export default function V5AdminPage() {
  return (
    <div
      data-v5-admin
      className="min-h-screen bg-[hsl(var(--v5-system-800))] overflow-x-hidden"
    >
      <V5AdminShell active="/admin/dashboard">
        <V5OpsCenter />
      </V5AdminShell>
    </div>
  );
}
