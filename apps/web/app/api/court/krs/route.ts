/**
 * Tier 18 — KRS API.
 *
 * GET /api/court/krs?krs=0000123456       → odpis aktualny + profil
 * GET /api/court/krs?nip=1234567890       → wyszukanie po NIP
 * GET /api/court/krs?krs=...&check=upadlosc → szybka flaga upadłości
 */

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/db/supabase-server";
import {
  fetchByNumber,
  fetchByNip,
  extractCompanyProfile,
  upadloscCheck,
  fingerprintProfile,
} from "@/lib/court/krs";

export async function GET(req: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const krs = url.searchParams.get("krs");
  const nip = url.searchParams.get("nip");
  const check = url.searchParams.get("check");

  try {
    if (krs && check === "upadlosc") {
      const res = await upadloscCheck(krs);
      return NextResponse.json(res);
    }
    if (krs) {
      const raw = await fetchByNumber(krs);
      if (!raw) return NextResponse.json({ error: "not_found" }, { status: 404 });
      const profile = extractCompanyProfile(raw);
      const fingerprint = profile ? fingerprintProfile(profile) : null;
      return NextResponse.json({ profile, fingerprint });
    }
    if (nip) {
      const raw = await fetchByNip(nip);
      if (!raw) return NextResponse.json({ error: "not_found" }, { status: 404 });
      return NextResponse.json({ result: raw });
    }
    return NextResponse.json({ error: "missing_query" }, { status: 400 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
