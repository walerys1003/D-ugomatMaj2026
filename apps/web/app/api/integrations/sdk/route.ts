/**
 * Tier 24 — SDK + OpenAPI generator endpoint.
 *  GET /api/integrations/sdk?lang=openapi  → OpenAPI 3.1 JSON
 *  GET /api/integrations/sdk?lang=ts       → TypeScript SDK source
 *  GET /api/integrations/sdk?lang=py       → Python SDK source
 */
import { NextRequest, NextResponse } from "next/server";
import {
  buildOpenApiDocument,
  generateTypeScriptSdk,
  generatePythonSdk,
} from "@/lib/integrations/sdk";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const lang = (req.nextUrl.searchParams.get("lang") ?? "openapi").toLowerCase();
  const baseUrl = req.nextUrl.searchParams.get("baseUrl") ?? undefined;

  if (lang === "openapi" || lang === "json") {
    return NextResponse.json(buildOpenApiDocument(baseUrl));
  }
  if (lang === "ts" || lang === "typescript") {
    return new NextResponse(generateTypeScriptSdk(), {
      headers: {
        "content-type": "application/typescript; charset=utf-8",
        "content-disposition": 'attachment; filename="dlugomat-client.ts"',
      },
    });
  }
  if (lang === "py" || lang === "python") {
    return new NextResponse(generatePythonSdk(), {
      headers: {
        "content-type": "text/x-python; charset=utf-8",
        "content-disposition": 'attachment; filename="dlugomat_client.py"',
      },
    });
  }
  return NextResponse.json(
    { error: "unsupported_lang", allowed: ["openapi", "ts", "py"] },
    { status: 400 },
  );
}
