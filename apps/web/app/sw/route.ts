import { NextResponse } from "next/server";
import { SW_SOURCE } from "@/lib/pwa/service-worker-template";

// Serve the service worker at /sw — keeps it under our own scope so it can
// intercept all app routes. Scope header set explicitly.
export async function GET() {
  return new NextResponse(SW_SOURCE, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Service-Worker-Allowed": "/",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  });
}
