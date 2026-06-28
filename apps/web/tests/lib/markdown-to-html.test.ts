import { describe, expect, it } from "vitest";

import { markdownToHtml, wrapDocumentHtml } from "@/lib/documents/markdown-to-html";

describe("markdownToHtml", () => {
  it("renders headings", () => {
    expect(markdownToHtml("# Tytuł")).toBe("<h1>Tytuł</h1>");
    expect(markdownToHtml("## Sekcja")).toBe("<h2>Sekcja</h2>");
  });

  it("renders bold inline", () => {
    expect(markdownToHtml("To jest **ważne**.")).toBe(
      "<p>To jest <strong>ważne</strong>.</p>",
    );
  });

  it("renders numbered lists", () => {
    const html = markdownToHtml(["1. pierwsza", "2. druga", "3. trzecia"].join("\n"));
    expect(html).toBe("<ol>\n<li>pierwsza</li>\n<li>druga</li>\n<li>trzecia</li>\n</ol>");
  });

  it("renders horizontal rule", () => {
    expect(markdownToHtml("---")).toBe("<hr />");
  });

  it("escapes HTML in plain text", () => {
    const html = markdownToHtml("Wpisz <tag> w treści");
    expect(html).toContain("&lt;tag&gt;");
    expect(html).not.toContain("<tag>");
  });

  it("escapes script tags inside paragraphs", () => {
    const html = markdownToHtml("Treść <script>alert(1)</script> dalej");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("collects multi-line paragraphs into one <p>", () => {
    const html = markdownToHtml("linia jeden\nlinia dwa");
    expect(html).toBe("<p>linia jeden linia dwa</p>");
  });

  it("wraps document HTML with print styles", () => {
    const wrapped = wrapDocumentHtml("<p>Hi</p>", { title: "Test" });
    expect(wrapped).toContain("<!DOCTYPE html>");
    expect(wrapped).toContain("<title>Test</title>");
    expect(wrapped).toContain("@page { size: A4");
    expect(wrapped).toContain("<p>Hi</p>");
  });
});
