/**
 * Tier 6 zad. 257 — Circuit breaker dla zewnętrznych integracji.
 *
 * Klasyczny 3-stanowy pattern (Closed / Open / HalfOpen):
 *   - Closed   — normalne wywołania; liczymy błędy w oknie czasowym.
 *   - Open     — fail-fast (rzucamy CircuitOpenError), bez wywołania serwisu.
 *   - HalfOpen — po `recoveryAfterMs` wpuszczamy 1 wywołanie testowe.
 *
 * Implementacja in-memory (per-instance Vercel). Dla wielo-instancji można
 * podłączyć Redis backend; obecnie wystarczy lokalny stan (każda instancja
 * sama "uczy się" awarii zewn. usługi).
 */

import { logger } from "./logger";

export interface CircuitBreakerOptions {
  /** Failure threshold (count) inside windowMs to trip the circuit. */
  failureThreshold: number;
  /** Sliding window for counting failures. */
  windowMs: number;
  /** How long to stay Open before allowing a single test call. */
  recoveryAfterMs: number;
  /** Name used in logs/metrics. */
  name: string;
}

type State = "closed" | "open" | "half-open";

interface FailureEvent {
  at: number;
}

export class CircuitOpenError extends Error {
  readonly code = "CIRCUIT_OPEN";
  constructor(public readonly circuit: string) {
    super(`Circuit breaker '${circuit}' is open — fail-fast`);
    this.name = "CircuitOpenError";
  }
}

export class CircuitBreaker {
  private state: State = "closed";
  private failures: FailureEvent[] = [];
  private openedAt = 0;
  private inFlightHalfOpen = false;

  constructor(private readonly opts: CircuitBreakerOptions) {}

  /** Returns the current state (for /admin/sli dashboard). */
  getState(): { state: State; failureCount: number; openedAt: number; circuit: string } {
    this.prune();
    return {
      state: this.state,
      failureCount: this.failures.length,
      openedAt: this.openedAt,
      circuit: this.opts.name,
    };
  }

  async run<T>(fn: () => Promise<T>): Promise<T> {
    const now = Date.now();
    this.prune();

    if (this.state === "open") {
      if (now - this.openedAt >= this.opts.recoveryAfterMs) {
        this.state = "half-open";
        this.inFlightHalfOpen = false;
        logger.info("circuit.transition", { circuit: this.opts.name, to: "half-open" });
      } else {
        throw new CircuitOpenError(this.opts.name);
      }
    }

    if (this.state === "half-open") {
      if (this.inFlightHalfOpen) {
        // Already probing; reject other parallel calls.
        throw new CircuitOpenError(this.opts.name);
      }
      this.inFlightHalfOpen = true;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    } finally {
      if (this.state === "half-open") {
        this.inFlightHalfOpen = false;
      }
    }
  }

  private onSuccess(): void {
    if (this.state === "half-open") {
      this.state = "closed";
      this.failures = [];
      this.openedAt = 0;
      logger.info("circuit.transition", { circuit: this.opts.name, to: "closed" });
    }
  }

  private onFailure(): void {
    const now = Date.now();
    this.failures.push({ at: now });
    this.prune();
    if (this.state === "half-open") {
      this.trip(now);
      return;
    }
    if (this.failures.length >= this.opts.failureThreshold) {
      this.trip(now);
    }
  }

  private trip(now: number): void {
    if (this.state !== "open") {
      this.state = "open";
      this.openedAt = now;
      logger.warn("circuit.transition", {
        circuit: this.opts.name,
        to: "open",
        failures: this.failures.length,
      });
    }
  }

  private prune(): void {
    const cutoff = Date.now() - this.opts.windowMs;
    this.failures = this.failures.filter((f) => f.at >= cutoff);
  }
}

// Pre-configured circuit breakers for common integrations.
export const stripeCircuit = new CircuitBreaker({
  name: "stripe",
  failureThreshold: 5,
  windowMs: 30_000,
  recoveryAfterMs: 30_000,
});

export const anthropicCircuit = new CircuitBreaker({
  name: "anthropic",
  failureThreshold: 5,
  windowMs: 30_000,
  recoveryAfterMs: 30_000,
});

export const resendCircuit = new CircuitBreaker({
  name: "resend",
  failureThreshold: 5,
  windowMs: 60_000,
  recoveryAfterMs: 60_000,
});

export const smsapiCircuit = new CircuitBreaker({
  name: "smsapi",
  failureThreshold: 5,
  windowMs: 60_000,
  recoveryAfterMs: 60_000,
});

export const ALL_CIRCUITS: readonly CircuitBreaker[] = [
  stripeCircuit,
  anthropicCircuit,
  resendCircuit,
  smsapiCircuit,
];
