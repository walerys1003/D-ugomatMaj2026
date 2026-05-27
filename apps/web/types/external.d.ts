/**
 * Type stubs for optional external dependencies.
 *
 * These packages are loaded lazily via dynamic `await import("…")` in
 * server-side code paths (billing/Stripe, invoice PDF generation, web-push).
 * They are NOT listed in `package.json` because:
 *
 *  - In production they are installed in the deployment environment
 *    (Vercel / dedicated worker) and resolved at runtime.
 *  - In the local TS build we don't need their full d.ts surface — every
 *    call site uses `as any` or feature-flags the lazy import.
 *
 * Declaring them as ambient `any` modules silences TS2307 without
 * polluting the type surface and without forcing a heavyweight
 * `npm install` in CI for paths that are dynamically gated.
 */

declare module "stripe";
declare module "pdf-lib";
declare module "web-push";
