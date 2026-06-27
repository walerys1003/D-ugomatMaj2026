// Plugin install / uninstall / update lifecycle with per-org permission grants.
import { randomUUID } from "crypto";
import { validateManifest, PluginManifest, defaultSandboxProfile, permissionsRiskScore } from "./plugin-sdk";

export interface InstallParams {
  orgId: string;
  listingId: string;
  installedBy: string;
  manifest: PluginManifest;
  grantedPermissions: string[];
  config?: Record<string, unknown>;
}

export interface PluginInstallation {
  id: string;
  orgId: string;
  listingId: string;
  pluginId: string;
  version: string;
  status: "active" | "disabled" | "updating" | "failed";
  grantedPermissions: string[];
  config: Record<string, unknown>;
  riskScore: number;
  installedAt: string;
}

export async function installPlugin(supabase: any, params: InstallParams): Promise<PluginInstallation> {
  const v = validateManifest(params.manifest);
  if (!v.ok) throw new Error(`invalid manifest: ${v.errors.join(", ")}`);

  // Plugin must request a superset of granted permissions; granted ⊆ requested.
  const requested = new Set<string>(params.manifest.permissions);
  for (const g of params.grantedPermissions) {
    if (!requested.has(g)) throw new Error(`granted permission not in manifest: ${g}`);
  }

  const row = {
    id: randomUUID(),
    org_id: params.orgId,
    listing_id: params.listingId,
    plugin_id: params.manifest.id,
    version: params.manifest.version,
    status: "active" as const,
    granted_permissions: params.grantedPermissions,
    config: params.config ?? {},
    risk_score: permissionsRiskScore(params.manifest.permissions),
    installed_by: params.installedBy,
    sandbox_profile: defaultSandboxProfile(params.manifest.permissions),
  };

  const { data, error } = await supabase.from("plugin_installations").insert(row).select("*").single();
  if (error) throw error;

  // Bump install counter on listing (best-effort).
  await supabase.rpc("increment_listing_install_count", { p_listing_id: params.listingId }).catch(() => null);

  return mapInstallation(data);
}

export async function uninstallPlugin(supabase: any, installationId: string, orgId: string): Promise<void> {
  const { error } = await supabase
    .from("plugin_installations")
    .update({ status: "disabled", uninstalled_at: new Date().toISOString() })
    .eq("id", installationId)
    .eq("org_id", orgId);
  if (error) throw error;
}

export async function updatePlugin(
  supabase: any,
  installationId: string,
  orgId: string,
  newManifest: PluginManifest,
): Promise<PluginInstallation> {
  const v = validateManifest(newManifest);
  if (!v.ok) throw new Error(`invalid manifest: ${v.errors.join(", ")}`);

  const { data, error } = await supabase
    .from("plugin_installations")
    .update({
      version: newManifest.version,
      status: "active",
      risk_score: permissionsRiskScore(newManifest.permissions),
      sandbox_profile: defaultSandboxProfile(newManifest.permissions),
      updated_at: new Date().toISOString(),
    })
    .eq("id", installationId)
    .eq("org_id", orgId)
    .select("*")
    .single();
  if (error) throw error;
  return mapInstallation(data);
}

export async function listInstalledPlugins(supabase: any, orgId: string): Promise<PluginInstallation[]> {
  const { data, error } = await supabase
    .from("plugin_installations")
    .select("*")
    .eq("org_id", orgId)
    .order("installed_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapInstallation);
}

function mapInstallation(r: any): PluginInstallation {
  return {
    id: r.id,
    orgId: r.org_id,
    listingId: r.listing_id,
    pluginId: r.plugin_id,
    version: r.version,
    status: r.status,
    grantedPermissions: r.granted_permissions ?? [],
    config: r.config ?? {},
    riskScore: Number(r.risk_score ?? 0),
    installedAt: r.installed_at,
  };
}
