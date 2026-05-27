/**
 * Tier 13 — Workspaces nested under organizations. Used to scope cases by team.
 */
import { createServerSupabase } from "@/lib/db/supabase-server";
import { randomUUID } from "crypto";

export interface Workspace {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  created_by: string;
  created_at: string;
}

export async function createWorkspace(input: { org_id: string; name: string; created_by: string; description?: string }): Promise<Workspace> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const ws: Workspace = {
    id: randomUUID(),
    org_id: input.org_id,
    name: input.name,
    description: input.description,
    created_by: input.created_by,
    created_at: new Date().toISOString(),
  };
  await sb.from("workspaces").insert(ws);
  return ws;
}

export async function listOrgWorkspaces(orgId: string): Promise<Workspace[]> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  const { data } = await sb.from("workspaces").select("*").eq("org_id", orgId).order("created_at", { ascending: false });
  return (data as Workspace[]) ?? [];
}

export async function assignCaseToWorkspace(caseId: string, workspaceId: string): Promise<void> {
  // W10-3: loose cast — typed Database stale for recent schema columns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb: any = await createServerSupabase();
  await sb.from("cases").update({ workspace_id: workspaceId, updated_at: new Date().toISOString() }).eq("id", caseId);
}
