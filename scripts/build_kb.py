#!/usr/bin/env python3
"""
DŁUGOMAT — Knowledge Base Builder
Splits the full specification into semantically meaningful chunks
indexed by section number, generates lightweight TF-IDF embeddings
(no external API required), and writes a JSON index for retrieval.

Why TF-IDF here (not OpenAI embeddings):
- The chunks are short, structured, and use a stable Polish-legal vocabulary.
- An offline TF-IDF + cosine retriever is fully deterministic, reproducible,
  zero-cost and fast. It is sufficient to route the right chunk to the right
  coding agent (frontend / backend / db / design / ai-engine / etc.).
- If higher-quality semantic search is needed later, the same chunk JSON
  can be re-embedded with any provider (the chunking is the hard part).

Usage:
  python3 scripts/build_kb.py
"""

from __future__ import annotations
import json
import math
import os
import re
import sys
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parent.parent
SPEC_FULL = ROOT / "docs" / "spec" / "SPEC_FULL.txt"
SPEC_BRAND = ROOT / "docs" / "spec" / "SPEC_BRAND.md"
OUT_CHUNK_DIR = ROOT / "knowledge-base" / "chunks"
OUT_INDEX_DIR = ROOT / "knowledge-base" / "index"
OUT_CHUNK_DIR.mkdir(parents=True, exist_ok=True)
OUT_INDEX_DIR.mkdir(parents=True, exist_ok=True)

# ----------------------------------------------------------------------
# 1) HEADING DETECTION
# ----------------------------------------------------------------------

# Section heading: starts with digit(s), optional letters and dot-separated
# numbers, then a space and a title. Examples:
#   "1. WIZJA PRODUKTU"
#   "2.1 Diagram architektury"
#   "5.A.3 Katalog pism"
#   "11.10 D10 — Centrum Dowodzenia"
HEADING_RE = re.compile(
    r"^(?P<num>\d+(?:\.\d+|\.[A-Z])(?:\.\d+)?(?:\.\d+)?|\d+\.)\s+(?P<title>\S.*\S)\s*$"
)

# Tag taxonomy → routes a chunk to the right coding agent.
TAG_RULES: List[Tuple[str, List[str]]] = [
    ("frontend",   ["FRONTEND", "ROUTING", "DESIGN SYSTEM", "WIZARD", "DASHBOARD",
                    "LANDING", "KOMPONENT", "RESPONSY", "ANIMACJ", "TYPOGRAF",
                    "KOLOR", "LAYOUT", "DARK MODE", "ACCESSIBILITY", "WCAG",
                    "TARCZA", "SHADCN", "TAILWIND"]),
    ("backend",    ["BACKEND", "API ROUTES", "MIDDLEWARE", "ROUTE HANDLER",
                    "LOGIKA BIZNESOWA", "ENDPOINT", "CYKL ŻYCIA"]),
    ("database",   ["BAZA DANYCH", "POSTGRES", "RLS", "SCHEMAT", "MIGRACJ",
                    "ERD", "SUPABASE", "STORAGE BUCKET", "TABEL"]),
    ("ai-engine",  ["AI ENGINE", "CLAUDE", "PROMPT", "RAG", "WALIDACJ",
                    "HAIKU", "SONNET", "OPUS"]),
    ("ocr",        ["OCR", "TESSERACT", "TEXTRACT", "ROZPOZNAW", "NAKAZPARSER"]),
    ("payments",   ["STRIPE", "PŁATNOŚC", "FAKTUR", "CENNIK", "PRICING"]),
    ("notifications", ["POWIADOMIEN", "DEADLINE", "SMS", "RESEND", "EMAIL",
                       "CRON"]),
    ("modules",    ["MODUŁ D", "D1 ", "D2 ", "D3 ", "D4 ", "D5 ", "D6 ",
                    "D7 ", "D8 ", "D9 ", "D10 ", "SPRZECIWOMAT", "KOMORNIK",
                    "BIK", "CESJA", "UGODOMAT", "UPADŁOŚĆ", "POTRĄCENIA"]),
    ("security",   ["BEZPIECZEŃ", "RODO", "GDPR", "SZYFROW", "PENETRATION",
                    "AUDYT"]),
    ("devops",     ["DEPLOYMENT", "CI/CD", "GITHUB ACTIONS", "DOCKER",
                    "MONITORING", "ANALYTIC"]),
    ("brand",      ["TOŻSAMOŚĆ MARKI", "ARCHETYP", "TON KOMUNIKACJI",
                    "PALETA", "ILUSTRACJ", "IKON"]),
    ("strategy",   ["WIZJA", "RYNKU", "TAM", "SAM", "SOM", "ROADMAP",
                    "FAZA", "ESTYMACJ"]),
    ("admin",      ["PANEL ADMIN", "ADMINISTRACYJN", "KPI"]),
    ("monorepo",   ["STRUKTURA MONOREPO", "KONWENCJ", "KATALOG"]),
]


def classify_tags(num: str, title: str, body: str) -> List[str]:
    text = f"{num} {title}\n{body}".upper()
    tags = [tag for tag, kws in TAG_RULES if any(k in text for k in kws)]
    if not tags:
        tags = ["misc"]
    return tags


# ----------------------------------------------------------------------
# 2) CHUNKING
# ----------------------------------------------------------------------

def normalize(line: str) -> str:
    return line.replace("\r", "").rstrip()


def split_sections(path: Path, source_label: str) -> List[Dict]:
    """Walk the file and emit one chunk per heading section."""
    text = path.read_text(encoding="utf-8")
    lines = [normalize(l) for l in text.splitlines()]

    sections: List[Dict] = []
    current = None

    for ln, raw in enumerate(lines, start=1):
        m = HEADING_RE.match(raw)
        if m and len(raw) < 200:  # reject crazy-long "headings"
            if current is not None:
                sections.append(current)
            current = {
                "source": source_label,
                "section": m.group("num").rstrip("."),
                "title": m.group("title").strip(),
                "start_line": ln,
                "body_lines": [],
            }
        else:
            if current is None:
                # Pre-heading preamble bucketed into "preamble".
                current = {
                    "source": source_label,
                    "section": "0",
                    "title": "PREAMBLE",
                    "start_line": ln,
                    "body_lines": [],
                }
            current["body_lines"].append(raw)

    if current is not None:
        sections.append(current)

    # Convert body_lines → body string and drop empties.
    out: List[Dict] = []
    for s in sections:
        body = "\n".join(s["body_lines"]).strip()
        if not body and s["title"] in {"PREAMBLE", "SPIS TREŚCI"}:
            continue
        out.append({
            "source": s["source"],
            "section": s["section"],
            "title": s["title"],
            "start_line": s["start_line"],
            "body": body,
            "char_len": len(body),
        })
    return out


def split_oversized(chunks: List[Dict], max_chars: int = 4000) -> List[Dict]:
    """Subdivide chunks that are too large for a single LLM call."""
    out: List[Dict] = []
    for c in chunks:
        if c["char_len"] <= max_chars:
            out.append(c)
            continue
        body = c["body"]
        # Split on blank lines first.
        paras = re.split(r"\n\s*\n", body)
        buf, buf_len, part = [], 0, 1
        for p in paras:
            pl = len(p) + 2
            if buf and buf_len + pl > max_chars:
                out.append({**c,
                            "section": f"{c['section']}#p{part}",
                            "title": f"{c['title']} (part {part})",
                            "body": "\n\n".join(buf),
                            "char_len": buf_len})
                part += 1
                buf, buf_len = [], 0
            buf.append(p)
            buf_len += pl
        if buf:
            out.append({**c,
                        "section": f"{c['section']}#p{part}" if part > 1 else c["section"],
                        "title": f"{c['title']} (part {part})" if part > 1 else c["title"],
                        "body": "\n\n".join(buf),
                        "char_len": buf_len})
    return out


# ----------------------------------------------------------------------
# 3) TF-IDF EMBEDDINGS (offline, deterministic)
# ----------------------------------------------------------------------

PL_STOPWORDS = set("""
a aby albo ale ani aż bardzo bez bo by była było będzie będą być co coś
czy czyli dla do gdy gdyż gdzie go i ich ile im jak jakie jakiej jakim
jako je jednak jego jej jest jeszcze już ją która które którego której
który którym ma mają może można na nad nas nasz nasze nawet nią nie nim
no o od oraz pan pana pani po pod ponad ponieważ poprzez przez przy są
się ta tak takie taki także te tego tej ten też to tu tylko tym u w we
więc wraz wszystko wszystkich wtedy wy z za zaś że
""".split())

WORD_RE = re.compile(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]+")


def tokenize(text: str) -> List[str]:
    text = text.lower()
    toks = WORD_RE.findall(text)
    return [t for t in toks if t not in PL_STOPWORDS and len(t) > 2]


def build_tfidf(chunks: List[Dict]) -> Dict:
    docs = [tokenize(c["title"] + "\n" + c["body"]) for c in chunks]
    df: Counter = Counter()
    for d in docs:
        for term in set(d):
            df[term] += 1
    n = len(docs)
    idf = {t: math.log((n + 1) / (f + 1)) + 1.0 for t, f in df.items()}

    vectors = []
    for d in docs:
        tf = Counter(d)
        if not tf:
            vectors.append({})
            continue
        max_tf = max(tf.values())
        v = {t: (0.5 + 0.5 * c / max_tf) * idf.get(t, 0.0) for t, c in tf.items()}
        norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
        v = {t: x / norm for t, x in v.items()}
        vectors.append(v)

    return {"idf": idf, "vectors": vectors}


# ----------------------------------------------------------------------
# 4) MAIN
# ----------------------------------------------------------------------

def main() -> None:
    if not SPEC_FULL.exists() or not SPEC_BRAND.exists():
        print("ERROR: spec files missing", file=sys.stderr)
        sys.exit(1)

    print(f"[1/5] Splitting {SPEC_FULL.name} ...")
    full_chunks = split_sections(SPEC_FULL, source_label="SPEC_FULL")
    print(f"      → {len(full_chunks)} sections")

    print(f"[2/5] Splitting {SPEC_BRAND.name} ...")
    brand_chunks = split_sections(SPEC_BRAND, source_label="SPEC_BRAND")
    print(f"      → {len(brand_chunks)} sections")

    chunks = full_chunks + brand_chunks
    chunks = split_oversized(chunks, max_chars=4000)

    # Stable id, tags, persistence.
    print(f"[3/5] Tagging and persisting {len(chunks)} chunks ...")
    for i, c in enumerate(chunks):
        c["id"] = f"{c['source']}:{c['section']}".replace("/", "_")
        c["tags"] = classify_tags(c["section"], c["title"], c["body"])
        # one chunk file per section (great for debugging + agent use).
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", c["id"])
        (OUT_CHUNK_DIR / f"{i:04d}__{safe}.md").write_text(
            f"# {c['section']} — {c['title']}\n\n"
            f"_source: {c['source']} · tags: {', '.join(c['tags'])} · "
            f"line {c['start_line']} · {c['char_len']} chars_\n\n"
            f"{c['body']}\n",
            encoding="utf-8",
        )

    print("[4/5] Building TF-IDF embeddings ...")
    tfidf = build_tfidf(chunks)

    # Index: list of {id, section, title, tags, source, file, vector_idx}
    index = []
    for i, c in enumerate(chunks):
        safe = re.sub(r"[^A-Za-z0-9._-]", "_", c["id"])
        index.append({
            "i": i,
            "id": c["id"],
            "source": c["source"],
            "section": c["section"],
            "title": c["title"],
            "tags": c["tags"],
            "char_len": c["char_len"],
            "file": f"knowledge-base/chunks/{i:04d}__{safe}.md",
        })

    (OUT_INDEX_DIR / "chunks.json").write_text(
        json.dumps(index, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    (OUT_INDEX_DIR / "tfidf.json").write_text(
        json.dumps(tfidf, ensure_ascii=False), encoding="utf-8"
    )

    # Tag inverted index for fast agent routing.
    by_tag: Dict[str, List[str]] = defaultdict(list)
    for entry in index:
        for t in entry["tags"]:
            by_tag[t].append(entry["id"])
    (OUT_INDEX_DIR / "by_tag.json").write_text(
        json.dumps(by_tag, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    # Section inverted index ("5.A.3" → file path).
    by_section = {entry["id"]: entry["file"] for entry in index}
    (OUT_INDEX_DIR / "by_section.json").write_text(
        json.dumps(by_section, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(f"[5/5] Done. Stats:")
    print(f"      chunks:        {len(index)}")
    print(f"      tags:          {len(by_tag)}")
    print(f"      total chars:   {sum(c['char_len'] for c in chunks):,}")
    print(f"      avg chunk len: {sum(c['char_len'] for c in chunks)//len(chunks)} chars")
    print(f"      output:        knowledge-base/{{chunks,index}}/")


if __name__ == "__main__":
    main()
