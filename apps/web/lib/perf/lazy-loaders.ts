/**
 * Tier 31 — Lazy-loaded heavy modules.
 * Centralizuje dynamic imports dla bibliotek, które nie muszą być w main bundle.
 *
 * Użycie:
 *   const { generatePdf } = await loadPdfGenerator();
 *   const data = await generatePdf(opts);
 */
import "server-only";
import { getStripeClient, type StripeClient } from "@/lib/billing/stripe-client";

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
 * Audyt 2026-06-27 (iter. 39): używamy wspólnego, typowanego loadera zamiast
 * `apiVersion: "..." as any`. apiVersion zgodny z typem SDK (2024-06-20).
 */
let stripeInstance: StripeClient | null = null;
export async function loadStripe(): Promise<StripeClient | null> {
  if (stripeInstance) return stripeInstance;
  stripeInstance = await getStripeClient(process.env.STRIPE_SECRET_KEY ?? "");
  return stripeInstance;
}
