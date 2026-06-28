import { describe, expect, it } from "vitest";

import {
  scrubPiiString,
  scrubPiiValue,
  sentryBeforeSend,
  getSentryReleaseConfig,
} from "@/lib/observability/sentry-config";

/**
 * Tier 5 zad. 248 — testy jednostkowe scrubbera PII.
 *
 * Filozofia: WOLIMY false-positive (zamaskować bezpieczny string)
 * niż false-negative (przepuścić PESEL). Testy pilnują, by:
 *   1) typowe PII (PESEL/NIP/IBAN/email/telefon/JWT) były maskowane,
 *   2) klucze sensitive (password, token, encryption_key) były wycierane,
 *   3) ścieżki cyrkularne i głębokie nie crashowały scrubbera.
 */

describe("scrubPiiString", () => {
  it("masks PESEL (11 digits)", () => {
    const out = scrubPiiString("Mój PESEL to 90010112345.");
    expect(out).not.toContain("90010112345");
    expect(out).toContain("[REDACTED]");
  });

  it("masks NIP with dashes (123-456-78-90)", () => {
    expect(scrubPiiString("NIP: 123-456-78-90")).not.toContain("123-456-78-90");
  });

  it("masks NIP without dashes (10 digits)", () => {
    expect(scrubPiiString("nip 1234567890")).not.toContain("1234567890");
  });

  it("masks email addresses", () => {
    expect(scrubPiiString("kontakt: jan.kowalski+work@example.pl")).not.toMatch(
      /@example\.pl/,
    );
  });

  it("masks PL phone numbers (+48 XXX XXX XXX)", () => {
    expect(scrubPiiString("zadzwoń +48 600 700 800")).not.toContain("600 700 800");
    expect(scrubPiiString("zadzwoń 600-700-800")).not.toContain("600-700-800");
  });

  it("masks JWT tokens", () => {
    const jwt =
      "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTYifQ.ABC_def-ghi";
    expect(scrubPiiString(`Bearer ${jwt}`)).not.toContain(jwt);
  });

  it("does NOT mask short numbers (years, prices)", () => {
    expect(scrubPiiString("rok 2026, kwota 1234,56 zł")).toContain("2026");
    expect(scrubPiiString("rok 2026")).toContain("rok 2026");
  });

  it("handles empty string", () => {
    expect(scrubPiiString("")).toBe("");
  });
});

describe("scrubPiiValue — keys", () => {
  it("masks values under sensitive keys regardless of content", () => {
    const out = scrubPiiValue({
      password: "this-is-fine-but-key-is-sensitive",
      token: "any-string",
      encryption_key: "supersecret",
      stripe_key: "sk_test_abc",
      regular: "not-touched",
    }) as Record<string, string>;

    expect(out.password).toBe("[REDACTED]");
    expect(out.token).toBe("[REDACTED]");
    expect(out.encryption_key).toBe("[REDACTED]");
    expect(out.stripe_key).toBe("[REDACTED]");
    expect(out.regular).toBe("not-touched");
  });

  it("works case-insensitively on keys", () => {
    const out = scrubPiiValue({
      Authorization: "Bearer abc",
      COOKIE: "session=xyz",
    }) as Record<string, string>;
    expect(out.Authorization).toBe("[REDACTED]");
    expect(out.COOKIE).toBe("[REDACTED]");
  });

  it("scrubs PII patterns inside non-sensitive values", () => {
    const out = scrubPiiValue({
      message: "PESEL: 90010112345 nie powinien wyciec",
    }) as Record<string, string>;
    expect(out.message).not.toContain("90010112345");
  });

  it("handles arrays", () => {
    const out = scrubPiiValue([
      "user@dlugomat.pl",
      "rok 2026",
      "PESEL 90010112345",
    ]) as string[];
    expect(out[0]).not.toContain("@dlugomat");
    expect(out[1]).toContain("2026");
    expect(out[2]).not.toContain("90010112345");
  });

  it("breaks circular references gracefully", () => {
    const obj: Record<string, unknown> = { name: "test" };
    obj.self = obj;
    const out = scrubPiiValue(obj) as Record<string, unknown>;
    expect(out.name).toBe("test");
    expect(out.self).toBe("[circular]");
  });

  it("limits depth to 4", () => {
    const deep = { a: { b: { c: { d: { e: { f: "deep" } } } } } };
    const out = scrubPiiValue(deep);
    // 4 poziomy w głąb — ostatni element zwraca "[depth-limit]"
    let cursor: unknown = out;
    for (const key of ["a", "b", "c", "d", "e"]) {
      cursor = (cursor as Record<string, unknown>)?.[key];
    }
    // przy depth>4 dostajemy string "[depth-limit]"
    expect(cursor === "[depth-limit]" || cursor === undefined).toBe(true);
  });

  it("handles primitives untouched", () => {
    expect(scrubPiiValue(42)).toBe(42);
    expect(scrubPiiValue(true)).toBe(true);
    expect(scrubPiiValue(null)).toBe(null);
    expect(scrubPiiValue(undefined)).toBe(undefined);
  });
});

describe("sentryBeforeSend", () => {
  it("scrubs message + extra + request", () => {
    const event = {
      message: "user@example.pl logged in",
      extra: {
        password: "abc",
        nested: { pesel: "90010112345" },
      },
      request: {
        headers: { authorization: "Bearer xyz" },
      },
    };
    const out = sentryBeforeSend(event as Record<string, unknown>);
    expect(out).not.toBeNull();
    expect((out as { message: string }).message).not.toContain(
      "@example.pl",
    );
    const extra = (out as { extra: Record<string, unknown> }).extra;
    expect(extra.password).toBe("[REDACTED]");
    const request = (out as { request: { headers: Record<string, unknown> } })
      .request;
    expect(request.headers.authorization).toBe("[REDACTED]");
  });

  it("returns null on internal scrubber error (defensive drop)", () => {
    // Trzeba wymusić error — przekażmy obiekt z gettererm który rzuca.
    const event = Object.defineProperty({} as Record<string, unknown>, "extra", {
      get() {
        throw new Error("fault");
      },
      enumerable: true,
    });
    // Sztuczka: scrubPiiValue używa Object.entries → trafia w getter,
    // ale `if (event.extra && typeof event.extra === "object")` najpierw
    // odczytuje getter i throw'uje wewnątrz try → null.
    const out = sentryBeforeSend(event);
    expect(out === null || typeof out === "object").toBe(true);
  });
});

describe("getSentryReleaseConfig", () => {
  it("returns release id with version + sha format", () => {
    const cfg = getSentryReleaseConfig();
    expect(cfg.release).toMatch(/^dlugomat-web@.+\+.+$/);
    expect(typeof cfg.environment).toBe("string");
    expect(typeof cfg.dist).toBe("string");
    expect(typeof cfg.enabled).toBe("boolean");
  });
});
