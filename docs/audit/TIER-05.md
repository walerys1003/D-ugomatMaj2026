# TIER-05 — AI orchestration & evaluation

**Primary agent:** AGENT-05 AI orchestration
**Sandbox primary:** E
**Subsystems:** AI Systems, AI Orchestration
**Intent:** 31 TS errors w lib/ai fix, golden dataset dla eval harness, prompt versioning UI complete, RAG hybrid pipeline jako default, win-probability/virtual-judge backed up by real data.

**Severity mix:** P0 18% · P1 42% · P2 35% · P3 5%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T005-001** | AI | P0 | 4h | A05 | E | Fix lib/ai TS error batch 1 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-002** | AI | P0 | 6h | A05 | E | Golden dataset for module D1 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-003** | AI | P0 | 5h | A05 | E | Prompt versioning UI promote action wiring 1 | — | Promote button creates new version row | git revert |
| **T005-004** | AI | P0 | 5h | A05 | E | RAG hybrid pipeline as default for module D1 | — | answer quality score improves | fall back to legacy retriever |
| **T005-005** | AI | P0 | 4h | A05 | E | Hallucination guard scoring threshold tune 1 | — | false-positive < 5% | restore threshold |
| **T005-006** | AI | P0 | 4h | A05 | E | Citation validator coverage for source type 1 | — | unit test pass | git revert |
| **T005-007** | AI | P0 | 7h | A05 | E | Win-probability model retrain on real case data 1 | — | AUC > 0.75 | rollback model weights |
| **T005-008** | AI | P0 | 5h | A05 | E | Virtual-judge persona 1 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-009** | AI | P0 | 4h | A05 | E | Token cost tracker per-user dashboard widget 1 | — | widget shows current month USD | remove widget |
| **T005-010** | AI | P0 | 4h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 1 | — | kill switch test passes | revert router |
| **T005-011** | AI | P0 | 4h | A05 | E | Fix lib/ai TS error batch 2 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-012** | AI | P0 | 6h | A05 | E | Golden dataset for module D2 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-013** | AI | P0 | 5h | A05 | E | Prompt versioning UI promote action wiring 2 | — | Promote button creates new version row | git revert |
| **T005-014** | AI | P0 | 5h | A05 | E | RAG hybrid pipeline as default for module D2 | — | answer quality score improves | fall back to legacy retriever |
| **T005-015** | AI | P0 | 4h | A05 | E | Hallucination guard scoring threshold tune 2 | — | false-positive < 5% | restore threshold |
| **T005-016** | AI | P0 | 4h | A05 | E | Citation validator coverage for source type 2 | — | unit test pass | git revert |
| **T005-017** | AI | P0 | 7h | A05 | E | Win-probability model retrain on real case data 2 | — | AUC > 0.75 | rollback model weights |
| **T005-018** | AI | P0 | 5h | A05 | E | Virtual-judge persona 2 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-019** | AI | P1 | 3h | A05 | E | Token cost tracker per-user dashboard widget 2 | — | widget shows current month USD | remove widget |
| **T005-020** | AI | P1 | 3h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 2 | — | kill switch test passes | revert router |
| **T005-021** | AI | P1 | 3h | A05 | E | Fix lib/ai TS error batch 3 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-022** | AI | P1 | 5h | A05 | E | Golden dataset for module D3 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-023** | AI | P1 | 4h | A05 | E | Prompt versioning UI promote action wiring 3 | — | Promote button creates new version row | git revert |
| **T005-024** | AI | P1 | 4h | A05 | E | RAG hybrid pipeline as default for module D3 | — | answer quality score improves | fall back to legacy retriever |
| **T005-025** | AI | P1 | 3h | A05 | E | Hallucination guard scoring threshold tune 3 | — | false-positive < 5% | restore threshold |
| **T005-026** | AI | P1 | 3h | A05 | E | Citation validator coverage for source type 3 | — | unit test pass | git revert |
| **T005-027** | AI | P1 | 6h | A05 | E | Win-probability model retrain on real case data 3 | — | AUC > 0.75 | rollback model weights |
| **T005-028** | AI | P1 | 4h | A05 | E | Virtual-judge persona 3 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-029** | AI | P1 | 3h | A05 | E | Token cost tracker per-user dashboard widget 3 | — | widget shows current month USD | remove widget |
| **T005-030** | AI | P1 | 3h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 3 | — | kill switch test passes | revert router |
| **T005-031** | AI | P1 | 3h | A05 | E | Fix lib/ai TS error batch 4 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-032** | AI | P1 | 5h | A05 | E | Golden dataset for module D4 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-033** | AI | P1 | 4h | A05 | E | Prompt versioning UI promote action wiring 4 | — | Promote button creates new version row | git revert |
| **T005-034** | AI | P1 | 4h | A05 | E | RAG hybrid pipeline as default for module D4 | — | answer quality score improves | fall back to legacy retriever |
| **T005-035** | AI | P1 | 3h | A05 | E | Hallucination guard scoring threshold tune 4 | — | false-positive < 5% | restore threshold |
| **T005-036** | AI | P1 | 3h | A05 | E | Citation validator coverage for source type 4 | — | unit test pass | git revert |
| **T005-037** | AI | P1 | 6h | A05 | E | Win-probability model retrain on real case data 4 | — | AUC > 0.75 | rollback model weights |
| **T005-038** | AI | P1 | 4h | A05 | E | Virtual-judge persona 4 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-039** | AI | P1 | 3h | A05 | E | Token cost tracker per-user dashboard widget 4 | — | widget shows current month USD | remove widget |
| **T005-040** | AI | P1 | 3h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 4 | — | kill switch test passes | revert router |
| **T005-041** | AI | P1 | 3h | A05 | E | Fix lib/ai TS error batch 5 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-042** | AI | P1 | 5h | A05 | E | Golden dataset for module D5 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-043** | AI | P1 | 4h | A05 | E | Prompt versioning UI promote action wiring 5 | — | Promote button creates new version row | git revert |
| **T005-044** | AI | P1 | 4h | A05 | E | RAG hybrid pipeline as default for module D5 | — | answer quality score improves | fall back to legacy retriever |
| **T005-045** | AI | P1 | 3h | A05 | E | Hallucination guard scoring threshold tune 5 | — | false-positive < 5% | restore threshold |
| **T005-046** | AI | P1 | 3h | A05 | E | Citation validator coverage for source type 5 | — | unit test pass | git revert |
| **T005-047** | AI | P1 | 6h | A05 | E | Win-probability model retrain on real case data 5 | — | AUC > 0.75 | rollback model weights |
| **T005-048** | AI | P1 | 4h | A05 | E | Virtual-judge persona 5 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-049** | AI | P1 | 3h | A05 | E | Token cost tracker per-user dashboard widget 5 | — | widget shows current month USD | remove widget |
| **T005-050** | AI | P1 | 3h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 5 | — | kill switch test passes | revert router |
| **T005-051** | AI | P1 | 3h | A05 | E | Fix lib/ai TS error batch 6 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-052** | AI | P1 | 5h | A05 | E | Golden dataset for module D6 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-053** | AI | P1 | 4h | A05 | E | Prompt versioning UI promote action wiring 6 | — | Promote button creates new version row | git revert |
| **T005-054** | AI | P1 | 4h | A05 | E | RAG hybrid pipeline as default for module D6 | — | answer quality score improves | fall back to legacy retriever |
| **T005-055** | AI | P1 | 3h | A05 | E | Hallucination guard scoring threshold tune 6 | — | false-positive < 5% | restore threshold |
| **T005-056** | AI | P1 | 3h | A05 | E | Citation validator coverage for source type 6 | — | unit test pass | git revert |
| **T005-057** | AI | P1 | 6h | A05 | E | Win-probability model retrain on real case data 6 | — | AUC > 0.75 | rollback model weights |
| **T005-058** | AI | P1 | 4h | A05 | E | Virtual-judge persona 6 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-059** | AI | P1 | 3h | A05 | E | Token cost tracker per-user dashboard widget 6 | — | widget shows current month USD | remove widget |
| **T005-060** | AI | P1 | 3h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 6 | — | kill switch test passes | revert router |
| **T005-061** | AI | P2 | 2h | A05 | E | Fix lib/ai TS error batch 7 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-062** | AI | P2 | 4h | A05 | E | Golden dataset for module D7 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-063** | AI | P2 | 3h | A05 | E | Prompt versioning UI promote action wiring 7 | — | Promote button creates new version row | git revert |
| **T005-064** | AI | P2 | 3h | A05 | E | RAG hybrid pipeline as default for module D7 | — | answer quality score improves | fall back to legacy retriever |
| **T005-065** | AI | P2 | 2h | A05 | E | Hallucination guard scoring threshold tune 7 | — | false-positive < 5% | restore threshold |
| **T005-066** | AI | P2 | 2h | A05 | E | Citation validator coverage for source type 7 | — | unit test pass | git revert |
| **T005-067** | AI | P2 | 5h | A05 | E | Win-probability model retrain on real case data 7 | — | AUC > 0.75 | rollback model weights |
| **T005-068** | AI | P2 | 3h | A05 | E | Virtual-judge persona 7 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-069** | AI | P2 | 2h | A05 | E | Token cost tracker per-user dashboard widget 7 | — | widget shows current month USD | remove widget |
| **T005-070** | AI | P2 | 2h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 7 | — | kill switch test passes | revert router |
| **T005-071** | AI | P2 | 2h | A05 | E | Fix lib/ai TS error batch 8 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-072** | AI | P2 | 4h | A05 | E | Golden dataset for module D8 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-073** | AI | P2 | 3h | A05 | E | Prompt versioning UI promote action wiring 8 | — | Promote button creates new version row | git revert |
| **T005-074** | AI | P2 | 3h | A05 | E | RAG hybrid pipeline as default for module D8 | — | answer quality score improves | fall back to legacy retriever |
| **T005-075** | AI | P2 | 2h | A05 | E | Hallucination guard scoring threshold tune 8 | — | false-positive < 5% | restore threshold |
| **T005-076** | AI | P2 | 2h | A05 | E | Citation validator coverage for source type 8 | — | unit test pass | git revert |
| **T005-077** | AI | P2 | 5h | A05 | E | Win-probability model retrain on real case data 8 | — | AUC > 0.75 | rollback model weights |
| **T005-078** | AI | P2 | 3h | A05 | E | Virtual-judge persona 8 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-079** | AI | P2 | 2h | A05 | E | Token cost tracker per-user dashboard widget 8 | — | widget shows current month USD | remove widget |
| **T005-080** | AI | P2 | 2h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 8 | — | kill switch test passes | revert router |
| **T005-081** | AI | P2 | 2h | A05 | E | Fix lib/ai TS error batch 9 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-082** | AI | P2 | 4h | A05 | E | Golden dataset for module D9 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-083** | AI | P2 | 3h | A05 | E | Prompt versioning UI promote action wiring 9 | — | Promote button creates new version row | git revert |
| **T005-084** | AI | P2 | 3h | A05 | E | RAG hybrid pipeline as default for module D9 | — | answer quality score improves | fall back to legacy retriever |
| **T005-085** | AI | P2 | 2h | A05 | E | Hallucination guard scoring threshold tune 9 | — | false-positive < 5% | restore threshold |
| **T005-086** | AI | P2 | 2h | A05 | E | Citation validator coverage for source type 9 | — | unit test pass | git revert |
| **T005-087** | AI | P2 | 5h | A05 | E | Win-probability model retrain on real case data 9 | — | AUC > 0.75 | rollback model weights |
| **T005-088** | AI | P2 | 3h | A05 | E | Virtual-judge persona 9 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-089** | AI | P2 | 2h | A05 | E | Token cost tracker per-user dashboard widget 9 | — | widget shows current month USD | remove widget |
| **T005-090** | AI | P2 | 2h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 9 | — | kill switch test passes | revert router |
| **T005-091** | AI | P2 | 2h | A05 | E | Fix lib/ai TS error batch 10 (5 errors) | — | tsc clean for lib/ai | git revert |
| **T005-092** | AI | P2 | 4h | A05 | E | Golden dataset for module D10 (5 examples) | — | eval-harness scores deterministic | delete dataset |
| **T005-093** | AI | P2 | 3h | A05 | E | Prompt versioning UI promote action wiring 10 | — | Promote button creates new version row | git revert |
| **T005-094** | AI | P2 | 3h | A05 | E | RAG hybrid pipeline as default for module D10 | — | answer quality score improves | fall back to legacy retriever |
| **T005-095** | AI | P2 | 2h | A05 | E | Hallucination guard scoring threshold tune 10 | — | false-positive < 5% | restore threshold |
| **T005-096** | AI | P3 | 2h | A05 | E | Citation validator coverage for source type 10 | — | unit test pass | git revert |
| **T005-097** | AI | P3 | 5h | A05 | E | Win-probability model retrain on real case data 10 | — | AUC > 0.75 | rollback model weights |
| **T005-098** | AI | P3 | 3h | A05 | E | Virtual-judge persona 10 prompt engineering | — | blind A/B against expert: ≥70% agreement | git revert |
| **T005-099** | AI | P3 | 2h | A05 | E | Token cost tracker per-user dashboard widget 10 | — | widget shows current month USD | remove widget |
| **T005-100** | AI | P3 | 2h | A05 | E | Model router fallback chain (Sonnet → Haiku → Opus) test 10 | — | kill switch test passes | revert router |

> **Total tasks:** 100 · **Estimated effort:** 358h
