/**
 * Tier 4 — publiczne API kalkulatorów kwot wolnych (PLAN.md zad. 173/181/182).
 *
 * POST /api/calculators?type=wynagrodzenie|emerytura|rachunek
 *   body: zod-walidowany input zgodnie z {kind}InputSchema
 *
 * Endpoint jest publiczny (bez auth) ponieważ kalkulatory są również
 * udostępniane na landing pages. Zabezpieczenia:
 *   - rate-limit 60/min/IP (RATE_LIMIT_PROFILES.api)
 *   - Zod walidacja wejścia (clamp do bezpiecznych zakresów)
 *   - czysty handler obliczeniowy (bez I/O do DB)
 *
 * Uwaga: kalkulatory NIE są poradą prawną — front zawsze opatruje
 * wynik dyskleimerem (Tarcza ton: stanowczy ale ostrożny).
 */
import { NextResponse } from "next/server";
import {
  obliczKwoteWolnaEmerytura,
  obliczKwoteWolnaRachunek,
  obliczKwoteWolnaWynagrodzenie,
  emeryturaInputSchema,
  rachunekInputSchema,
  wynagrodzenieInputSchema,
} from "@/lib/calculators";
import {
  RATE_LIMIT_PROFILES,
  clientIdFromHeaders,
  rateLimit,
} from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CalcType = "wynagrodzenie" | "emerytura" | "rachunek";

const CALC_TYPES: readonly CalcType[] = [
  "wynagrodzenie",
  "emerytura",
  "rachunek",
] as const;

function parseDate(iso?: string): Date | undefined {
  if (!iso) return undefined;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export async function POST(request: Request) {
  const ip = clientIdFromHeaders(request.headers);
  const rl = rateLimit(`calc:${ip}`, RATE_LIMIT_PROFILES.api);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "rate_limited" },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil(rl.resetMs / 1000).toString() },
      },
    );
  }

  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  if (!type || !CALC_TYPES.includes(type as CalcType)) {
    return NextResponse.json(
      {
        error: "invalid_type",
        message: `Parametr ?type musi być jednym z: ${CALC_TYPES.join(", ")}`,
      },
      { status: 400 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  try {
    switch (type as CalcType) {
      case "wynagrodzenie": {
        const parsed = wynagrodzenieInputSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "invalid_input", issues: parsed.error.flatten() },
            { status: 422 },
          );
        }
        const result = obliczKwoteWolnaWynagrodzenie({
          nettoGrosze: parsed.data.nettoGrosze,
          kategoria: parsed.data.kategoria,
          etat: parsed.data.etat,
          at: parseDate(parsed.data.date),
        });
        return NextResponse.json({ ok: true, type, result });
      }
      case "emerytura": {
        const parsed = emeryturaInputSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "invalid_input", issues: parsed.error.flatten() },
            { status: 422 },
          );
        }
        const result = obliczKwoteWolnaEmerytura({
          bruttoGrosze: parsed.data.bruttoGrosze,
          kategoria: parsed.data.kategoria,
          at: parseDate(parsed.data.date),
        });
        return NextResponse.json({ ok: true, type, result });
      }
      case "rachunek": {
        const parsed = rachunekInputSchema.safeParse(body);
        if (!parsed.success) {
          return NextResponse.json(
            { error: "invalid_input", issues: parsed.error.flatten() },
            { status: 422 },
          );
        }
        const result = obliczKwoteWolnaRachunek({
          saldoGrosze: parsed.data.saldoGrosze,
          wplywyMiesieczneGrosze: parsed.data.wplywyMiesieczneGrosze,
          swiadczeniaWylaczoneGrosze: parsed.data.swiadczeniaWylaczoneGrosze,
          juzWykorzystanaGrosze: parsed.data.juzWykorzystanaGrosze,
          at: parseDate(parsed.data.date),
        });
        return NextResponse.json({ ok: true, type, result });
      }
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("[calculators] error:", err);
    }
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }

  // Should be unreachable.
  return NextResponse.json({ error: "unhandled" }, { status: 500 });
}
