/**
 * Tier 13 — Data residency policy enforcement.
 */
export type ResidencyRegion = "eu-warsaw" | "eu-frankfurt" | "us-east";

export interface ResidencyPolicy {
  org_id: string;
  region: ResidencyRegion;
  storage_bucket: string;
  ai_processing_region: ResidencyRegion;
  cross_border_allowed: boolean;
}

const REGIONS: Record<ResidencyRegion, { country: string; jurisdiction: string; gdpr: boolean; storage_endpoint: string }> = {
  "eu-warsaw": { country: "PL", jurisdiction: "EU/EEA", gdpr: true, storage_endpoint: "https://storage-warsaw.dlugomat.pl" },
  "eu-frankfurt": { country: "DE", jurisdiction: "EU/EEA", gdpr: true, storage_endpoint: "https://storage-frankfurt.dlugomat.pl" },
  "us-east": { country: "US", jurisdiction: "USA", gdpr: false, storage_endpoint: "https://storage-us.dlugomat.pl" },
};

export function regionMetadata(region: ResidencyRegion) {
  return REGIONS[region];
}

export function requiresEuResidency(orgPlan: string): boolean {
  return orgPlan === "enterprise";
}

export function validateRegion(region: string): region is ResidencyRegion {
  return region in REGIONS;
}

export function ensureCrossBorderAllowed(policy: ResidencyPolicy, targetRegion: ResidencyRegion): void {
  if (policy.region !== targetRegion && !policy.cross_border_allowed) {
    throw new Error(`cross_border_blocked:${policy.region}->${targetRegion}`);
  }
}
