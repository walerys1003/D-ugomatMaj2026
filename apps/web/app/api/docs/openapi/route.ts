import { NextResponse } from "next/server";
import { generateOpenApiSpec } from "@/lib/docs/openapi-generator";

export const runtime = "nodejs";

export async function GET() {
  const spec = generateOpenApiSpec();
  return NextResponse.json(spec);
}
