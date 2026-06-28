#!/usr/bin/env node
/**
 * Tier 31 — Bundle size checker.
 * Wczytuje .next/build-manifest.json + statystyki rozmiarów chunków i raportuje
 * największe pliki. Pomaga w identyfikacji code-splitting opportunities.
 *
 * Użycie: node scripts/check-bundle-sizes.mjs
 */
import fs from "node:fs";
import path from "node:path";

const NEXT_DIR = path.join(process.cwd(), ".next");
const STATIC_DIR = path.join(NEXT_DIR, "static", "chunks");

if (!fs.existsSync(STATIC_DIR)) {
  console.error(`✗ Brak ${STATIC_DIR}. Uruchom najpierw "npm run build".`);
  process.exit(1);
}

function walk(dir) {
  const result = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      result.push(...walk(full));
    } else if (entry.name.endsWith(".js")) {
      const size = fs.statSync(full).size;
      result.push({ path: full.replace(NEXT_DIR + "/", ""), size });
    }
  }
  return result;
}

const files = walk(STATIC_DIR).sort((a, b) => b.size - a.size);
const total = files.reduce((s, f) => s + f.size, 0);

function formatKb(b) {
  return `${(b / 1024).toFixed(1)} KB`;
}

console.log(`\n📊 Bundle stats (${files.length} chunks, total ${formatKb(total)}):\n`);

// Top 20 największych
console.log("Top 20 chunków:");
files.slice(0, 20).forEach((f, i) => {
  const bar = "█".repeat(Math.min(40, Math.floor(f.size / files[0].size * 40)));
  console.log(`  ${String(i + 1).padStart(2)}. ${formatKb(f.size).padStart(9)} ${bar} ${f.path}`);
});

// Identyfikacja kandydatów do code-splittingu (>200kb)
const heavy = files.filter((f) => f.size > 200 * 1024);
if (heavy.length > 0) {
  console.log(`\n⚠️  Kandydaci do code-splittingu (>200KB): ${heavy.length}`);
  heavy.forEach((f) => console.log(`   - ${f.path} (${formatKb(f.size)})`));
}

// Limity per kategoria
const limits = {
  framework: 200 * 1024,
  vendor: 300 * 1024,
  pages: 250 * 1024,
};

let violations = 0;
for (const f of files) {
  for (const [name, limit] of Object.entries(limits)) {
    if (f.path.includes(name) && f.size > limit) {
      console.log(`✗ ${f.path}: ${formatKb(f.size)} > limit ${formatKb(limit)}`);
      violations++;
    }
  }
}

if (violations > 0) {
  console.log(`\n✗ ${violations} naruszeń limitów. Rozważ code-splitting.`);
  process.exit(1);
}

console.log("\n✓ Wszystkie chunki w limitach.");
