import { describe, expect, it, vi, beforeEach } from "vitest";

/**
 * Tier 5 zad. 203 — CSRF helper unit tests.
 *
 * Mockujemy `next/headers` żeby symulować cookies w teście.
 */

const cookieStore = new Map<string, string>();

vi.mock("next/headers", () => ({
  cookies: () => ({
    get: (name: string) => {
      const v = cookieStore.get(name);
      return v ? { name, value: v } : undefined;
    },
    set: (
      arg1:
        | string
        | { name: string; value: string; [k: string]: unknown },
      maybeValue?: string,
    ) => {
      if (typeof arg1 === "string") {
        cookieStore.set(arg1, maybeValue ?? "");
      } else {
        cookieStore.set(arg1.name, arg1.value);
      }
    },
  }),
}));

describe("CSRF helpers", () => {
  let csrf: typeof import("@/lib/security/csrf");

  beforeEach(async () => {
    cookieStore.clear();
    csrf = await import("@/lib/security/csrf");
  });

  it("ensureCsrfToken creates a >= 40 chars token and reuses it on second call", async () => {
    const t1 = await csrf.ensureCsrfToken();
    expect(t1.length).toBeGreaterThanOrEqual(40);
    const t2 = await csrf.ensureCsrfToken();
    expect(t2).toBe(t1);
  });

  it("assertCsrf passes when X-CSRF-Token header matches cookie", async () => {
    const t = await csrf.ensureCsrfToken();
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { [csrf.CSRF_HEADER]: t, "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await expect(csrf.assertCsrf(req)).resolves.toBeUndefined();
  });

  it("assertCsrf throws CsrfError on missing token", async () => {
    await csrf.ensureCsrfToken();
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    await expect(csrf.assertCsrf(req)).rejects.toThrow(/CSRF/i);
  });

  it("assertCsrf throws CsrfError on mismatched token", async () => {
    await csrf.ensureCsrfToken();
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: {
        [csrf.CSRF_HEADER]: "wrong-token-abc-123-very-long-string-padding",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    await expect(csrf.assertCsrf(req)).rejects.toThrow(/CSRF/i);
  });

  it("assertCsrf accepts token in JSON body field 'csrf'", async () => {
    const t = await csrf.ensureCsrfToken();
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csrf: t, hello: "world" }),
    });
    await expect(csrf.assertCsrf(req)).resolves.toBeUndefined();
  });

  it("assertCsrf skips for safe methods (GET/HEAD/OPTIONS)", async () => {
    const req = new Request("http://localhost/api/test", { method: "GET" });
    // Brak cookie i tak — ale GET = no-op.
    await expect(csrf.assertCsrf(req)).resolves.toBeUndefined();
  });

  it("assertCsrf throws missing_cookie when cookie absent", async () => {
    cookieStore.clear();
    const req = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { [csrf.CSRF_HEADER]: "anything-anything-anything-anything-1" },
    });
    let err: unknown = null;
    try {
      await csrf.assertCsrf(req);
    } catch (e) {
      err = e;
    }
    expect(err).toBeInstanceOf(csrf.CsrfError);
    expect((err as InstanceType<typeof csrf.CsrfError>).reason).toBe(
      "missing_cookie",
    );
  });

  it("csrfRejection returns 403 JSON response", async () => {
    const err = new csrf.CsrfError("token_mismatch");
    const res = csrf.csrfRejection(err);
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({ error: "csrf_rejected", reason: "token_mismatch" });
  });
});
