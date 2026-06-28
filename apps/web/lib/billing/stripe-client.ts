/**
 * Współdzielony, typowany loader Stripe SDK.
 *
 * Audyt 2026-06-27 (iter. 39, #6): wcześniej każdy moduł billing robił
 * `new (Stripe as any)(secretKey, { apiVersion: "2024-06-20" })`, ponieważ
 * dynamiczny `import("stripe")` nie zachowuje typu konstruktora. Tutaj
 * importujemy konstruktor z poprawnym typem (`typeof StripeNS`), więc
 * konsumenci dostają w pełni typowaną instancję bez `as any`.
 */
import type StripeNS from "stripe";

export type StripeClient = StripeNS;

/**
 * Leniwie ładuje i tworzy klienta Stripe. Zwraca `null`, gdy SDK nie jest
 * zainstalowany — zachowuje dotychczasowe zachowanie `import().catch(null)`.
 */
export async function getStripeClient(secretKey: string): Promise<StripeClient | null> {
  const mod = await import("stripe").catch(() => null);
  if (!mod) return null;
  // Dynamiczny import nie zachowuje typu konstruktora — narzucamy typeof StripeNS
  // (konkretny typ konstruktora, NIE `any`).
  const StripeCtor = (mod.default ?? mod) as unknown as typeof StripeNS;
  // apiVersion zgodny z typem SDK (Stripe.LatestApiVersion = "2024-06-20").
  return new StripeCtor(secretKey, { apiVersion: "2024-06-20" });
}
