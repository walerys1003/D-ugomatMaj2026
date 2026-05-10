/**
 * RODO art. 20 — endpoint pobierania danych użytkownika jako plik JSON.
 *
 * GET /api/rodo/export
 *   - wymaga zalogowanej sesji (rate-limit + auth w guardAction)
 *   - zwraca application/json z Content-Disposition: attachment
 *   - filename: dlugomat_dane_RRRR-MM-DD.json
 *
 * Used by: /panel/ustawienia/rodo (button "Pobierz moje dane").
 */
import { NextResponse, type NextRequest } from "next/server";

import { exportUserDataAsJson } from "@/lib/rodo/data-export";
import {
  ActionRateLimitError,
  ActionUnauthenticatedError,
} from "@/lib/security/server-action-guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest): Promise<NextResponse> {
  try {
    const { json, filename } = await exportUserDataAsJson();
    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (e) {
    if (e instanceof ActionRateLimitError) {
      return NextResponse.json(
        { error: e.message },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(e.retryAfterMs / 1000)) },
        },
      );
    }
    if (e instanceof ActionUnauthenticatedError) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    const msg = e instanceof Error ? e.message : "internal_error";
    console.error("[rodo/export] error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
