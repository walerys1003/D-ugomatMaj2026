import type { MetadataRoute } from "next";
import { buildManifest } from "@/lib/pwa/manifest-config";

// Next.js 14 metadata route — auto-served at /manifest.webmanifest.
export default function manifest(): MetadataRoute.Manifest {
  const m = buildManifest();
  return m as unknown as MetadataRoute.Manifest;
}
