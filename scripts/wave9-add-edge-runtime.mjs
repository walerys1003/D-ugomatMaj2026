#!/usr/bin/env node
/**
 * Wave 9 / W9-1 — Add `export const runtime = "edge"` to static-only
 * marketing pages. Inserts BETWEEN the import block and the first
 * non-import statement, handling multi-line imports correctly.
 *
 * Skips pages that:
 *   - already declare a runtime
 *   - use server-only APIs (Supabase server client, cookies(), headers())
 *   - have a "use server" directive
 */
import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = path.resolve(process.cwd(), "apps/web");
const TARGET_DIRS = [
  "app/(marketing)/baza-wiedzy",
  "app/(marketing)/bezpieczenstwo",
  "app/(marketing)/changelog",
  "app/(marketing)/case-studies",
  "app/(marketing)/dla-firm",
  "app/(marketing)/api-publiczne",
  "app/(marketing)/cee",
];
const MAX = 30;
const FORBIDDEN_PATTERNS = [
  /createServerSupabase/,
  /createSupabaseServerClient/,
  /"use server"/,
  /^\s*cookies\s*\(\s*\)/m,
  /^\s*headers\s*\(\s*\)/m,
  /getServerSession/,
];
const EDGE_BLOCK = `
// W9-1: edge runtime for static content delivery (faster TTFB, no Node APIs needed)
export const runtime = "edge";
`;

async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await walk(p)));
    } else if (e.name === "page.tsx") {
      out.push(p);
    }
  }
  return out;
}

/**
 * Find the index of the first line AFTER all top-level `import ... from "..."`
 * statements. Handles multi-line imports by tracking when each import
 * statement reaches its terminating `from "..."` line.
 */
function findInsertIndex(lines) {
  let i = 0;
  // Skip leading blank lines, "use client" directives, and shebangs.
  while (i < lines.length && /^\s*(\/\/|\/\*|\*|$|"use client"|"use strict")/.test(lines[i])) {
    i++;
  }
  let lastImportEnd = -1;
  while (i < lines.length) {
    const ln = lines[i];
    const trimmed = ln.trim();
    // Start of an import statement
    if (/^import(\s|\{|\*|type)/.test(trimmed)) {
      // Same-line completion?
      if (/from\s+["'][^"']+["']\s*;?\s*$/.test(trimmed) || /^import\s+["'][^"']+["']\s*;?\s*$/.test(trimmed)) {
        lastImportEnd = i;
        i++;
        continue;
      }
      // Multi-line import — scan until `from "..."` line
      let j = i + 1;
      while (j < lines.length) {
        if (/from\s+["'][^"']+["']/.test(lines[j])) {
          lastImportEnd = j;
          j++;
          break;
        }
        j++;
      }
      i = j;
      continue;
    }
    // Blank line between imports — keep scanning
    if (trimmed === "" || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      i++;
      continue;
    }
    // First non-import, non-comment, non-blank line — stop here
    break;
  }
  return lastImportEnd >= 0 ? lastImportEnd + 1 : 0;
}

async function main() {
  let modified = 0;
  const skipped = [];
  for (const dir of TARGET_DIRS) {
    const abs = path.join(ROOT, dir);
    const files = await walk(abs);
    for (const f of files) {
      if (modified >= MAX) break;
      const content = await fs.readFile(f, "utf-8");
      if (/^export const runtime\b/m.test(content)) {
        skipped.push(`${f} (already has runtime)`);
        continue;
      }
      if (FORBIDDEN_PATTERNS.some((re) => re.test(content))) {
        skipped.push(`${f} (forbidden pattern)`);
        continue;
      }
      const lines = content.split("\n");
      const idx = findInsertIndex(lines);
      lines.splice(idx, 0, EDGE_BLOCK.trimEnd());
      await fs.writeFile(f, lines.join("\n"), "utf-8");
      modified++;
      console.log(`✓ ${path.relative(ROOT, f)}`);
    }
    if (modified >= MAX) break;
  }
  console.log(`\nModified: ${modified} files. Skipped: ${skipped.length}.`);
  if (skipped.length > 0 && process.env.VERBOSE) {
    for (const s of skipped) console.log(`  - ${s}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
