// Lightweight threat scoring — flags suspicious requests based on heuristics:
// rapid IP rotation, impossible travel, password spraying, credential stuffing,
// scripted UAs, etc. Emits a 0..100 risk score per event.

export interface ThreatSignal {
  type:
    | "geo_velocity"
    | "rapid_ip_rotation"
    | "scripted_ua"
    | "password_spray"
    | "credential_stuffing"
    | "tor_exit"
    | "datacenter_asn"
    | "new_country"
    | "new_device";
  weight: number;
}

export interface ThreatContext {
  ip: string;
  userAgent: string;
  country?: string;
  asnType?: "residential" | "datacenter" | "mobile" | "unknown";
  recentIps?: string[]; // last 5 IPs for the same user
  recentCountries?: string[];
  failedAttemptsLast15m?: number;
  lastLoginAt?: string;
  lastLoginCountry?: string;
  lastLoginLat?: number;
  lastLoginLon?: number;
  currentLat?: number;
  currentLon?: number;
}

const SCRIPTED_UA_PATTERNS = [/curl/i, /python/i, /requests/i, /scrapy/i, /bot\b/i, /headlesschrome/i, /^$/];

export function scoreThreat(ctx: ThreatContext): { score: number; signals: ThreatSignal[] } {
  const signals: ThreatSignal[] = [];

  if (SCRIPTED_UA_PATTERNS.some((p) => p.test(ctx.userAgent || ""))) {
    signals.push({ type: "scripted_ua", weight: 25 });
  }
  if (ctx.asnType === "datacenter") signals.push({ type: "datacenter_asn", weight: 15 });
  if ((ctx.failedAttemptsLast15m ?? 0) >= 5) {
    signals.push({ type: "password_spray", weight: 30 });
  }
  if ((ctx.failedAttemptsLast15m ?? 0) >= 10) {
    signals.push({ type: "credential_stuffing", weight: 40 });
  }
  if (ctx.recentCountries && ctx.country && !ctx.recentCountries.includes(ctx.country)) {
    signals.push({ type: "new_country", weight: 20 });
  }
  if (ctx.recentIps && ctx.recentIps.length >= 4 && new Set(ctx.recentIps).size === ctx.recentIps.length) {
    signals.push({ type: "rapid_ip_rotation", weight: 15 });
  }

  // Impossible travel — distance / time > 900 km/h.
  if (
    ctx.lastLoginAt &&
    ctx.lastLoginLat != null &&
    ctx.lastLoginLon != null &&
    ctx.currentLat != null &&
    ctx.currentLon != null
  ) {
    const ageHr = (Date.now() - new Date(ctx.lastLoginAt).getTime()) / 3_600_000;
    if (ageHr > 0 && ageHr < 24) {
      const km = haversine(ctx.lastLoginLat, ctx.lastLoginLon, ctx.currentLat, ctx.currentLon);
      if (km / ageHr > 900) signals.push({ type: "geo_velocity", weight: 50 });
    }
  }

  const score = Math.min(100, signals.reduce((s, x) => s + x.weight, 0));
  return { score, signals };
}

export function decisionFor(score: number): "allow" | "challenge" | "deny" {
  if (score >= 70) return "deny";
  if (score >= 40) return "challenge";
  return "allow";
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
