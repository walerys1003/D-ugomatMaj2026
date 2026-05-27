/**
 * Tests dla feature flag radcy — Plan v1 Priority 3.
 *
 * Mockowane process.env (vi.stubEnv) zamiast importu modułu — flaga jest
 * snapshot'em w module load time, więc każdy test musi mieć świeży import.
 */
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("RADCA_ENABLED — feature flag bool", () => {
  it("jest false gdy env nieustawiony", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "");
    const { RADCA_ENABLED } = await import("@/lib/features/radca-flag");
    expect(RADCA_ENABLED).toBe(false);
  });

  it("jest false gdy env=false", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "false");
    const { RADCA_ENABLED } = await import("@/lib/features/radca-flag");
    expect(RADCA_ENABLED).toBe(false);
  });

  it("jest true tylko gdy env strict equals 'true'", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    const { RADCA_ENABLED } = await import("@/lib/features/radca-flag");
    expect(RADCA_ENABLED).toBe(true);
  });

  it("jest false dla wartości typu '1' / 'yes' / 'TRUE'", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "1");
    const m1 = await import("@/lib/features/radca-flag");
    expect(m1.RADCA_ENABLED).toBe(false);
    vi.resetModules();

    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "TRUE");
    const m2 = await import("@/lib/features/radca-flag");
    expect(m2.RADCA_ENABLED).toBe(false);
  });
});

describe("getRadcaInfo() — zwraca dane radcy lub null", () => {
  it("zwraca null gdy flag wyłączona", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "false");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Anna Kowalska");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "WA-1234");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");
    expect(getRadcaInfo()).toBeNull();
  });

  it("zwraca null gdy flag włączona ale brak NAME (safety fallback)", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "WA-1234");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");
    expect(getRadcaInfo()).toBeNull();
  });

  it("zwraca null gdy flag włączona ale brak KIRP (safety fallback)", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Anna Kowalska");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");
    expect(getRadcaInfo()).toBeNull();
  });

  it("zwraca dane radcy gdy flag + wszystkie pola obecne", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Anna Kowalska");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "WA-1234");
    vi.stubEnv("NEXT_PUBLIC_RADCA_SCOPE", "Prawo konsumenckie i ochrona dłużników.");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");

    const r = getRadcaInfo();
    expect(r).not.toBeNull();
    expect(r?.name).toBe("Anna Kowalska");
    expect(r?.kirp).toBe("WA-1234");
    expect(r?.scope).toBe("Prawo konsumenckie i ochrona dłużników.");
    expect(r?.initials).toBe("AK"); // wyliczone automatycznie
    expect(r?.oirp).toMatch(/Okręgowa Izba/);
  });

  it("używa default scope gdy SCOPE env nieustawiony", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Jan Nowak");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "WA-5678");
    vi.stubEnv("NEXT_PUBLIC_RADCA_SCOPE", "");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");

    const r = getRadcaInfo();
    expect(r?.scope).toMatch(/Konsultacja prawna/i);
  });

  it("pozwala nadpisać inicjały via NEXT_PUBLIC_RADCA_INITIALS", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Magdalena Wiśniewska");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "WA-9999");
    vi.stubEnv("NEXT_PUBLIC_RADCA_INITIALS", "mw");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");

    const r = getRadcaInfo();
    expect(r?.initials).toBe("MW"); // upper case
  });

  it("wylicza inicjały z jednego słowa gdy nazwa nietypowa", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Kovalsky");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "WA-1111");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");

    const r = getRadcaInfo();
    expect(r?.initials).toBe("KO");
  });

  it("używa custom OIRP gdy podany", async () => {
    vi.stubEnv("NEXT_PUBLIC_RADCA_ENABLED", "true");
    vi.stubEnv("NEXT_PUBLIC_RADCA_NAME", "Anna Kowalska");
    vi.stubEnv("NEXT_PUBLIC_RADCA_KIRP", "KR-2222");
    vi.stubEnv("NEXT_PUBLIC_RADCA_OIRP", "Okręgowa Izba Radców Prawnych w Krakowie");
    const { getRadcaInfo } = await import("@/lib/features/radca-flag");

    const r = getRadcaInfo();
    expect(r?.oirp).toContain("Krakowie");
  });
});
