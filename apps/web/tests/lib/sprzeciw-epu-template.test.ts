import { describe, expect, it } from "vitest";

import { renderSprzeciwEpuMarkdown } from "@/lib/documents/templates/sprzeciw-epu";
import { markdownToHtml } from "@/lib/documents/markdown-to-html";
import type { SprzeciwEpuAnswers } from "@/lib/wizard/modules/sprzeciw-epu/schemas";

const baseAnswers: SprzeciwEpuAnswers = {
  sygnatura: "VI Nc-e 1234567/25",
  sad: "Sąd Rejonowy Lublin-Zachód w Lublinie",
  data_nakazu: "2025-12-15",
  data_doreczenia: "2025-12-22",
  powod_nazwa: "Fundusz Sekurytyzacyjny XYZ",
  powod_adres: "ul. Testowa 1, 00-001 Warszawa",
  pozwany_nazwa: "Jan Kowalski",
  pozwany_adres: "ul. Przykładowa 2, 00-002 Warszawa",
  pozwany_pesel: "00000000000",
  kwota_glowna: 5432.10,
  kwota_odsetki: 1234.56,
  kwota_koszty: 30,
  zarzuty: ["przedawnienie", "cesja_niewykazana"],
  okolicznosci: "Nigdy nie otrzymałem(-am) wezwania do zapłaty.",
  consent_truth: true,
};

describe("renderSprzeciwEpuMarkdown", () => {
  it("includes the case header (sygnatura, sąd, data)", () => {
    const { markdown } = renderSprzeciwEpuMarkdown(baseAnswers);
    expect(markdown).toContain("VI Nc-e 1234567/25");
    expect(markdown).toContain("Sąd Rejonowy Lublin-Zachód w Lublinie");
    expect(markdown).toContain("Sprzeciw od nakazu zapłaty");
  });

  it("renders both selected zarzuty with legal citations", () => {
    const { markdown } = renderSprzeciwEpuMarkdown(baseAnswers);
    expect(markdown).toMatch(/Zarzut przedawnienia/);
    expect(markdown).toMatch(/art\. 117 § 2¹/);
    expect(markdown).toMatch(/Zarzut nieudokumentowania cesji/);
    expect(markdown).toMatch(/art\. 509/);
  });

  it("renders the user's okoliczności when provided", () => {
    const { markdown } = renderSprzeciwEpuMarkdown(baseAnswers);
    expect(markdown).toContain("Nigdy nie otrzymałem(-am) wezwania do zapłaty.");
  });

  it("omits okoliczności section when empty", () => {
    const { markdown } = renderSprzeciwEpuMarkdown({
      ...baseAnswers,
      okolicznosci: "",
    });
    expect(markdown).not.toContain("Okoliczności podane");
  });

  it("renders the WPS (wartość przedmiotu sporu) total", () => {
    const { markdown } = renderSprzeciwEpuMarkdown(baseAnswers);
    // 5432.10 + 1234.56 + 30 = 6696.66
    expect(markdown).toMatch(/6\s?696,66/);
  });

  it("returns a deterministic prompt hash", () => {
    const a = renderSprzeciwEpuMarkdown(baseAnswers);
    const b = renderSprzeciwEpuMarkdown(baseAnswers);
    expect(a.promptHash).toBe(b.promptHash);
    expect(a.promptHash).toMatch(/sprzeciw_epu/);
  });

  it("converts to safe HTML without script tags even with hostile input", () => {
    const malicious: SprzeciwEpuAnswers = {
      ...baseAnswers,
      okolicznosci: "<script>alert(1)</script>",
      pozwany_nazwa: "<img src=x onerror=alert(1)>",
    };
    const { markdown } = renderSprzeciwEpuMarkdown(malicious);
    const html = markdownToHtml(markdown);
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("onerror=");
    expect(html).toContain("&lt;script&gt;");
  });
});
