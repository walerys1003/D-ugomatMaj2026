/**
 * Tier 12 — Lightweight CRM sync (HubSpot, Pipedrive) for case-leads pipeline.
 */
export type CrmProvider = "hubspot" | "pipedrive";

export interface CrmContact {
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  company?: string;
  lifecycle_stage?: "lead" | "customer" | "evangelist";
}

export async function upsertHubspotContact(c: CrmContact): Promise<{ id: string }> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) throw new Error("hubspot_not_configured");
  const r = await fetch("https://api.hubapi.com/crm/v3/objects/contacts", {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify({
      properties: {
        email: c.email,
        firstname: c.first_name,
        lastname: c.last_name,
        phone: c.phone,
        company: c.company,
        lifecyclestage: c.lifecycle_stage ?? "lead",
      },
    }),
  });
  if (r.status === 409) {
    // contact exists — search & patch
    const s = await fetch("https://api.hubapi.com/crm/v3/objects/contacts/search", {
      method: "POST",
      headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
      body: JSON.stringify({ filterGroups: [{ filters: [{ propertyName: "email", operator: "EQ", value: c.email }] }] }),
    });
    const sj: any = await s.json();
    return { id: sj.results?.[0]?.id ?? "" };
  }
  if (!r.ok) throw new Error(`hubspot_${r.status}`);
  const j: any = await r.json();
  return { id: j.id };
}

export async function upsertPipedrivePerson(c: CrmContact): Promise<{ id: number }> {
  const token = process.env.PIPEDRIVE_TOKEN;
  if (!token) throw new Error("pipedrive_not_configured");
  const r = await fetch(`https://api.pipedrive.com/v1/persons?api_token=${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      name: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim() || c.email,
      email: [{ value: c.email, primary: true }],
      phone: c.phone ? [{ value: c.phone, primary: true }] : [],
      org_name: c.company,
    }),
  });
  if (!r.ok) throw new Error(`pipedrive_${r.status}`);
  const j: any = await r.json();
  return { id: j.data?.id ?? 0 };
}

export async function syncContact(provider: CrmProvider, contact: CrmContact): Promise<{ external_id: string }> {
  if (provider === "hubspot") {
    const { id } = await upsertHubspotContact(contact);
    return { external_id: id };
  }
  const { id } = await upsertPipedrivePerson(contact);
  return { external_id: String(id) };
}
