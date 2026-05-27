/**
 * Wave 9 / W9-2 — Supabase Edge Function: image-resize
 *
 * On-demand image resizer for user uploads (avatars, evidence
 * thumbnails, marketplace listing photos). Reads a source object from
 * Supabase Storage, resizes via WASM ImageMagick, writes back to a
 * variant bucket, and returns the public URL.
 *
 * Endpoint: POST /image-resize
 * Body:    { bucket: string, path: string, width: number, height?: number, fit?: "cover"|"contain", format?: "webp"|"jpeg"|"png" }
 * Auth:    Bearer <user JWT> — only owner of the file may resize.
 *
 * Variants are cached: if `<path>.w<W>.h<H>.<fmt>` already exists in
 * the variants bucket, returns its URL directly (idempotent).
 *
 * Use case: avoids running image processing on the Next.js Node.js
 * runtime (Sharp). Edge function = cold-start ~50ms, warm ~10ms,
 * no server resources consumed.
 */

// @ts-ignore — Deno runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";
// @ts-ignore — WASM ImageMagick (works in Deno Deploy)
import { ImageMagick, initializeImageMagick, MagickFormat } from "https://esm.sh/@imagemagick/magick-wasm@0.0.30";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const Deno: any;

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const VARIANTS_BUCKET = Deno.env.get("VARIANTS_BUCKET") ?? "image-variants";

const ALLOWED_WIDTHS = [64, 128, 256, 512, 1024, 2048];
const ALLOWED_FORMATS = new Set(["webp", "jpeg", "png"]);
const MAX_INPUT_BYTES = 25 * 1024 * 1024; // 25 MB

interface ResizeRequest {
  bucket: string;
  path: string;
  width: number;
  height?: number;
  fit?: "cover" | "contain";
  format?: "webp" | "jpeg" | "png";
}

let magickReady: Promise<void> | null = null;
function ensureMagick(): Promise<void> {
  if (!magickReady) {
    magickReady = initializeImageMagick();
  }
  return magickReady;
}

function variantPath(req: ResizeRequest): string {
  const w = req.width;
  const h = req.height ?? "auto";
  const fmt = req.format ?? "webp";
  return `${req.path}.w${w}.h${h}.${fmt}`;
}

function fmtFromString(s: string): MagickFormat {
  switch (s) {
    case "webp":
      return MagickFormat.WebP;
    case "jpeg":
      return MagickFormat.Jpeg;
    case "png":
      return MagickFormat.Png;
    default:
      return MagickFormat.WebP;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405,
      headers: { "content-type": "application/json" },
    });
  }

  // Authenticate via user JWT
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const jwt = auth.slice(7).trim();

  // Validate body
  let body: ResizeRequest;
  try {
    body = (await req.json()) as ResizeRequest;
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  if (!body.bucket || !body.path || !ALLOWED_WIDTHS.includes(body.width)) {
    return new Response(
      JSON.stringify({ error: "invalid_request", allowed_widths: ALLOWED_WIDTHS }),
      { status: 400, headers: { "content-type": "application/json" } },
    );
  }
  if (body.format && !ALLOWED_FORMATS.has(body.format)) {
    return new Response(JSON.stringify({ error: "invalid_format" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  // Verify user owns the source object (uses RLS via user JWT client)
  const userClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
    auth: { persistSession: false },
  });
  const { data: userData } = await userClient.auth.getUser(jwt);
  if (!userData?.user) {
    return new Response(JSON.stringify({ error: "invalid_session" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  // Service client for storage operations
  const svc = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

  // Check variants cache
  const vPath = variantPath(body);
  const { data: existingUrl } = svc.storage.from(VARIANTS_BUCKET).getPublicUrl(vPath);
  const headRes = await fetch(existingUrl.publicUrl, { method: "HEAD" });
  if (headRes.ok) {
    return new Response(
      JSON.stringify({ url: existingUrl.publicUrl, cached: true }),
      { headers: { "content-type": "application/json" } },
    );
  }

  // Download source
  const { data: dl, error: dlErr } = await svc.storage.from(body.bucket).download(body.path);
  if (dlErr || !dl) {
    return new Response(JSON.stringify({ error: "source_not_found", details: dlErr?.message }), {
      status: 404,
      headers: { "content-type": "application/json" },
    });
  }
  const srcBytes = new Uint8Array(await dl.arrayBuffer());
  if (srcBytes.byteLength > MAX_INPUT_BYTES) {
    return new Response(JSON.stringify({ error: "source_too_large", max: MAX_INPUT_BYTES }), {
      status: 413,
      headers: { "content-type": "application/json" },
    });
  }

  // Resize with WASM ImageMagick
  await ensureMagick();
  const outFormat = fmtFromString(body.format ?? "webp");
  const targetW = body.width;
  const targetH = body.height ?? body.width;

  const resized: Uint8Array = await new Promise((resolve, reject) => {
    try {
      ImageMagick.read(srcBytes, (img: any) => {
        if (body.fit === "cover") {
          img.resize(targetW, targetH);
          img.crop(targetW, targetH);
        } else {
          img.resize(targetW, targetH);
        }
        img.quality = 85;
        img.write(outFormat, (data: Uint8Array) => resolve(data));
      });
    } catch (e) {
      reject(e);
    }
  });

  // Upload variant
  const contentType =
    outFormat === MagickFormat.WebP
      ? "image/webp"
      : outFormat === MagickFormat.Jpeg
        ? "image/jpeg"
        : "image/png";
  const { error: upErr } = await svc.storage.from(VARIANTS_BUCKET).upload(vPath, resized, {
    contentType,
    cacheControl: "public, max-age=31536000, immutable",
    upsert: true,
  });
  if (upErr) {
    return new Response(JSON.stringify({ error: "upload_failed", details: upErr.message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  const { data: pub } = svc.storage.from(VARIANTS_BUCKET).getPublicUrl(vPath);
  return new Response(
    JSON.stringify({
      url: pub.publicUrl,
      cached: false,
      width: targetW,
      height: targetH,
      format: body.format ?? "webp",
      bytes: resized.byteLength,
    }),
    { headers: { "content-type": "application/json" } },
  );
});
