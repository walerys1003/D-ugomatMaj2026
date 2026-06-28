#!/usr/bin/env python3
"""
DŁUGOMAT — Knowledge Base Retriever (CLI)

The orchestrator/agents call this to fetch ONLY the chunks they need
for a given coding task — no need to inject the whole 60–80 page spec.

Usage:
  # Top-K semantic retrieval over TF-IDF:
  python3 scripts/kb_query.py "RLS policies for cases table" --k 5

  # Filter by tag (route to a single agent):
  python3 scripts/kb_query.py "design system colors" --tag brand --k 8

  # Direct section lookup:
  python3 scripts/kb_query.py --section 7.2

  # List all tags:
  python3 scripts/kb_query.py --list-tags
"""

from __future__ import annotations
import argparse
import json
import math
import sys
from collections import Counter
from pathlib import Path
from typing import Dict, List

ROOT = Path(__file__).resolve().parent.parent
INDEX_DIR = ROOT / "knowledge-base" / "index"

import re
WORD_RE = re.compile(r"[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż0-9]+")
PL_STOPWORDS = set("""
a aby albo ale ani aż bardzo bez bo by była było będzie będą być co coś
czy czyli dla do gdy gdyż gdzie go i ich ile im jak jakie jakiej jakim
jako je jednak jego jej jest jeszcze już ją która które którego której
który którym ma mają może można na nad nas nasz nasze nawet nią nie nim
no o od oraz pan pana pani po pod ponad ponieważ poprzez przez przy są
się ta tak takie taki także te tego tej ten też to tu tylko tym u w we
więc wraz wszystko wszystkich wtedy wy z za zaś że
""".split())


def tokenize(text: str) -> List[str]:
    return [t for t in WORD_RE.findall(text.lower())
            if t not in PL_STOPWORDS and len(t) > 2]


def load_index():
    idx = json.loads((INDEX_DIR / "chunks.json").read_text(encoding="utf-8"))
    tfidf = json.loads((INDEX_DIR / "tfidf.json").read_text(encoding="utf-8"))
    return idx, tfidf


def query_vector(q: str, idf: Dict[str, float]) -> Dict[str, float]:
    toks = tokenize(q)
    if not toks:
        return {}
    tf = Counter(toks)
    max_tf = max(tf.values())
    v = {t: (0.5 + 0.5 * c / max_tf) * idf.get(t, 0.0) for t, c in tf.items()}
    norm = math.sqrt(sum(x * x for x in v.values())) or 1.0
    return {t: x / norm for t, x in v.items()}


def cosine(a: Dict[str, float], b: Dict[str, float]) -> float:
    if not a or not b:
        return 0.0
    if len(a) > len(b):
        a, b = b, a
    return sum(v * b.get(k, 0.0) for k, v in a.items())


def search(query: str, k: int = 5, tag: str | None = None) -> List[Dict]:
    idx, tfidf = load_index()
    qv = query_vector(query, tfidf["idf"])
    scored = []
    for entry, vec in zip(idx, tfidf["vectors"]):
        if tag and tag not in entry["tags"]:
            continue
        s = cosine(qv, vec)
        if s > 0:
            scored.append((s, entry))
    scored.sort(key=lambda x: x[0], reverse=True)
    return [{"score": round(s, 4), **e} for s, e in scored[:k]]


def main() -> None:
    ap = argparse.ArgumentParser(description="Długomat KB retriever")
    ap.add_argument("query", nargs="?", default="")
    ap.add_argument("--k", type=int, default=5)
    ap.add_argument("--tag", default=None)
    ap.add_argument("--section", default=None,
                    help="Direct section lookup, e.g. 7.2 or 5.A.3")
    ap.add_argument("--list-tags", action="store_true")
    ap.add_argument("--show-body", action="store_true",
                    help="Print chunk body content as well as metadata")
    args = ap.parse_args()

    if args.list_tags:
        by_tag = json.loads((INDEX_DIR / "by_tag.json").read_text(encoding="utf-8"))
        for t, ids in sorted(by_tag.items()):
            print(f"{t:16s}  {len(ids)} chunks")
        return

    if args.section:
        idx = json.loads((INDEX_DIR / "chunks.json").read_text(encoding="utf-8"))
        hits = [e for e in idx if e["section"] == args.section
                or e["section"].startswith(args.section + "#")]
        if not hits:
            print(f"No section matching {args.section}", file=sys.stderr)
            sys.exit(1)
        for e in hits:
            print_entry(e, show_body=args.show_body)
        return

    if not args.query:
        ap.print_help()
        return

    results = search(args.query, k=args.k, tag=args.tag)
    if not results:
        print("(no results)")
        return
    for r in results:
        print_entry(r, show_body=args.show_body)


def print_entry(e: Dict, show_body: bool = False) -> None:
    score = e.get("score", "")
    score_s = f" score={score}" if score != "" else ""
    print(f"[{e['source']}] §{e['section']:8s}{score_s}  "
          f"tags={','.join(e['tags'])}  ({e['char_len']} chars)")
    print(f"   {e['title']}")
    print(f"   → {e['file']}")
    if show_body:
        body = (ROOT / e["file"]).read_text(encoding="utf-8")
        print("---")
        print(body)
        print("---")
    print()


if __name__ == "__main__":
    main()
