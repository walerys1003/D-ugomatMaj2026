import { describe, it, expect } from "vitest";
import { cn, formatPLN, formatDatePL, daysUntil, urgencyFromDays } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-red-500", false && "text-blue-500", "font-bold")).toBe(
      "text-red-500 font-bold"
    );
  });
});

describe("formatPLN", () => {
  it("formats with PLN currency by default", () => {
    const out = formatPLN(1234.5);
    expect(out).toContain("1");
    expect(out).toContain("234");
    expect(out).toContain("50");
    expect(out.toLowerCase()).toMatch(/zł|pln/);
  });

  it("can format without currency suffix", () => {
    const out = formatPLN(1000, { withCurrency: false });
    expect(out).not.toMatch(/zł|pln/i);
  });
});

describe("formatDatePL", () => {
  it("formats an ISO date in dd.mm.yyyy", () => {
    expect(formatDatePL("2026-05-10T12:00:00Z")).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });
});

describe("daysUntil + urgencyFromDays", () => {
  it("computes positive days for future dates and maps urgency", () => {
    const now = new Date("2026-05-10T00:00:00Z");
    const in10 = new Date("2026-05-20T00:00:00Z");
    expect(daysUntil(in10, now)).toBe(10);
    expect(urgencyFromDays(10)).toBe("normal");
    expect(urgencyFromDays(5)).toBe("warning");
    expect(urgencyFromDays(2)).toBe("critical");
    expect(urgencyFromDays(-1)).toBe("overdue");
  });
});
