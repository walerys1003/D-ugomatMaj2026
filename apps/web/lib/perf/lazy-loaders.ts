/**
 * Tier 31 — Lazy-loaded heavy modules.
 * Centralizuje dynamic imports dla bibliotek, które nie muszą być w main bundle.
 *
 * Użycie:
 *   const { generatePdf } = await loadPdfGenerator();
 *   const data = await generatePdf(opts);
 */
import "server-only";

/**
 * Tesseract.js — OCR (3MB+ z modelami). Ładowane tylko gdy user faktycznie
 * uruchamia skaner nakazu.
 */
export async function loadTesseract() {
  const mod = await import("tesseract.js");
  return mod.default ?? mod;
}

/**
 * AWS Textract SDK — używane fallback do Tesseract dla skanów niskiej jakości.
 */
export async function loadTextract() {
  const mod = await import("@aws-sdk/client-textract");
  return mod;
}

/**
 * Framer Motion — duże (200KB+). Ładuj tylko na stronach z animacjami.
 */
export async function loadFramerMotion() {
  const mod = await import("framer-motion");
  return mod;
}

/**
 * Stripe SDK — server-side. Singleton.
 */
let stripeInstance: any = null;
export async function loadStripe() {
  if (stripeInstance) return stripeInstance;
  const Stripe = (await import("stripe")).default;
  stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
    apiVersion: "2024-11-20.acacia" as any,
  });
  return stripeInstance;
}
