# TIER-08 — Automation, workflows & integrations

**Primary agent:** AGENT-06 Billing & integrations
**Sandbox primary:** H
**Subsystems:** Automation (workflows), Integrations (3rd party)
**Intent:** Workflows engine UI, OAuth Google/MS/Notion/Slack 8 endpoints, Make.com poll endpoints, ePUAP signing flow, MojeID, marketplace publishing, webhook dispatch admin.

**Severity mix:** P0 10% · P1 40% · P2 45% · P3 5%

| ID | Sub | Severity | Effort | Agent | Sandbox | Description | Deps | Validation | Rollback |
|---|---|---|---:|---|---|---|---|---|---|
| **T008-001** | AUTO | P0 | 6h | A06 | F | Workflows engine UI step builder 1 | — | save & run a sample workflow | git revert |
| **T008-002** | AUTO | P0 | 5h | A06 | F | Trigger node implementation 1 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-003** | INT | P0 | 6h | A06 | F | OAuth provider deep config 1 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-004** | INT | P0 | 7h | A06 | F | ePUAP signing flow step 1 | — | e2e sign + receipt download | git revert |
| **T008-005** | INT | P0 | 6h | A06 | F | MojeID integration step 1 | — | identity verify works | git revert |
| **T008-006** | INT | P0 | 4h | A06 | F | Make.com poll endpoint 1 | — | Make scenario receives data | delete route |
| **T008-007** | INT | P0 | 5h | A06 | F | Marketplace publishing step 1 | — | marketplace listing visible | remove listing |
| **T008-008** | INT | P0 | 5h | A07 | G | Webhook dispatch admin UI batch 1 | — | manual retry succeeds | git revert |
| **T008-009** | INT | P0 | 6h | A06 | F | CRM (Hubspot/Pipedrive) connector 1 | — | sync test record | remove connector |
| **T008-010** | INT | P0 | 5h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 1 | — | invoice round-trip | git revert |
| **T008-011** | AUTO | P1 | 5h | A06 | F | Workflows engine UI step builder 2 | — | save & run a sample workflow | git revert |
| **T008-012** | AUTO | P1 | 4h | A06 | F | Trigger node implementation 2 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-013** | INT | P1 | 5h | A06 | F | OAuth provider deep config 2 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-014** | INT | P1 | 6h | A06 | F | ePUAP signing flow step 2 | — | e2e sign + receipt download | git revert |
| **T008-015** | INT | P1 | 5h | A06 | F | MojeID integration step 2 | — | identity verify works | git revert |
| **T008-016** | INT | P1 | 3h | A06 | F | Make.com poll endpoint 2 | — | Make scenario receives data | delete route |
| **T008-017** | INT | P1 | 4h | A06 | F | Marketplace publishing step 2 | — | marketplace listing visible | remove listing |
| **T008-018** | INT | P1 | 4h | A07 | G | Webhook dispatch admin UI batch 2 | — | manual retry succeeds | git revert |
| **T008-019** | INT | P1 | 5h | A06 | F | CRM (Hubspot/Pipedrive) connector 2 | — | sync test record | remove connector |
| **T008-020** | INT | P1 | 4h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 2 | — | invoice round-trip | git revert |
| **T008-021** | AUTO | P1 | 5h | A06 | F | Workflows engine UI step builder 3 | — | save & run a sample workflow | git revert |
| **T008-022** | AUTO | P1 | 4h | A06 | F | Trigger node implementation 3 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-023** | INT | P1 | 5h | A06 | F | OAuth provider deep config 3 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-024** | INT | P1 | 6h | A06 | F | ePUAP signing flow step 3 | — | e2e sign + receipt download | git revert |
| **T008-025** | INT | P1 | 5h | A06 | F | MojeID integration step 3 | — | identity verify works | git revert |
| **T008-026** | INT | P1 | 3h | A06 | F | Make.com poll endpoint 3 | — | Make scenario receives data | delete route |
| **T008-027** | INT | P1 | 4h | A06 | F | Marketplace publishing step 3 | — | marketplace listing visible | remove listing |
| **T008-028** | INT | P1 | 4h | A07 | G | Webhook dispatch admin UI batch 3 | — | manual retry succeeds | git revert |
| **T008-029** | INT | P1 | 5h | A06 | F | CRM (Hubspot/Pipedrive) connector 3 | — | sync test record | remove connector |
| **T008-030** | INT | P1 | 4h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 3 | — | invoice round-trip | git revert |
| **T008-031** | AUTO | P1 | 5h | A06 | F | Workflows engine UI step builder 4 | — | save & run a sample workflow | git revert |
| **T008-032** | AUTO | P1 | 4h | A06 | F | Trigger node implementation 4 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-033** | INT | P1 | 5h | A06 | F | OAuth provider deep config 4 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-034** | INT | P1 | 6h | A06 | F | ePUAP signing flow step 4 | — | e2e sign + receipt download | git revert |
| **T008-035** | INT | P1 | 5h | A06 | F | MojeID integration step 4 | — | identity verify works | git revert |
| **T008-036** | INT | P1 | 3h | A06 | F | Make.com poll endpoint 4 | — | Make scenario receives data | delete route |
| **T008-037** | INT | P1 | 4h | A06 | F | Marketplace publishing step 4 | — | marketplace listing visible | remove listing |
| **T008-038** | INT | P1 | 4h | A07 | G | Webhook dispatch admin UI batch 4 | — | manual retry succeeds | git revert |
| **T008-039** | INT | P1 | 5h | A06 | F | CRM (Hubspot/Pipedrive) connector 4 | — | sync test record | remove connector |
| **T008-040** | INT | P1 | 4h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 4 | — | invoice round-trip | git revert |
| **T008-041** | AUTO | P1 | 5h | A06 | F | Workflows engine UI step builder 5 | — | save & run a sample workflow | git revert |
| **T008-042** | AUTO | P1 | 4h | A06 | F | Trigger node implementation 5 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-043** | INT | P1 | 5h | A06 | F | OAuth provider deep config 5 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-044** | INT | P1 | 6h | A06 | F | ePUAP signing flow step 5 | — | e2e sign + receipt download | git revert |
| **T008-045** | INT | P1 | 5h | A06 | F | MojeID integration step 5 | — | identity verify works | git revert |
| **T008-046** | INT | P1 | 3h | A06 | F | Make.com poll endpoint 5 | — | Make scenario receives data | delete route |
| **T008-047** | INT | P1 | 4h | A06 | F | Marketplace publishing step 5 | — | marketplace listing visible | remove listing |
| **T008-048** | INT | P1 | 4h | A07 | G | Webhook dispatch admin UI batch 5 | — | manual retry succeeds | git revert |
| **T008-049** | INT | P1 | 5h | A06 | F | CRM (Hubspot/Pipedrive) connector 5 | — | sync test record | remove connector |
| **T008-050** | INT | P1 | 4h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 5 | — | invoice round-trip | git revert |
| **T008-051** | AUTO | P2 | 4h | A06 | F | Workflows engine UI step builder 6 | — | save & run a sample workflow | git revert |
| **T008-052** | AUTO | P2 | 3h | A06 | F | Trigger node implementation 6 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-053** | INT | P2 | 4h | A06 | F | OAuth provider deep config 6 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-054** | INT | P2 | 5h | A06 | F | ePUAP signing flow step 6 | — | e2e sign + receipt download | git revert |
| **T008-055** | INT | P2 | 4h | A06 | F | MojeID integration step 6 | — | identity verify works | git revert |
| **T008-056** | INT | P2 | 2h | A06 | F | Make.com poll endpoint 6 | — | Make scenario receives data | delete route |
| **T008-057** | INT | P2 | 3h | A06 | F | Marketplace publishing step 6 | — | marketplace listing visible | remove listing |
| **T008-058** | INT | P2 | 3h | A07 | G | Webhook dispatch admin UI batch 6 | — | manual retry succeeds | git revert |
| **T008-059** | INT | P2 | 4h | A06 | F | CRM (Hubspot/Pipedrive) connector 6 | — | sync test record | remove connector |
| **T008-060** | INT | P2 | 3h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 6 | — | invoice round-trip | git revert |
| **T008-061** | AUTO | P2 | 4h | A06 | F | Workflows engine UI step builder 7 | — | save & run a sample workflow | git revert |
| **T008-062** | AUTO | P2 | 3h | A06 | F | Trigger node implementation 7 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-063** | INT | P2 | 4h | A06 | F | OAuth provider deep config 7 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-064** | INT | P2 | 5h | A06 | F | ePUAP signing flow step 7 | — | e2e sign + receipt download | git revert |
| **T008-065** | INT | P2 | 4h | A06 | F | MojeID integration step 7 | — | identity verify works | git revert |
| **T008-066** | INT | P2 | 2h | A06 | F | Make.com poll endpoint 7 | — | Make scenario receives data | delete route |
| **T008-067** | INT | P2 | 3h | A06 | F | Marketplace publishing step 7 | — | marketplace listing visible | remove listing |
| **T008-068** | INT | P2 | 3h | A07 | G | Webhook dispatch admin UI batch 7 | — | manual retry succeeds | git revert |
| **T008-069** | INT | P2 | 4h | A06 | F | CRM (Hubspot/Pipedrive) connector 7 | — | sync test record | remove connector |
| **T008-070** | INT | P2 | 3h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 7 | — | invoice round-trip | git revert |
| **T008-071** | AUTO | P2 | 4h | A06 | F | Workflows engine UI step builder 8 | — | save & run a sample workflow | git revert |
| **T008-072** | AUTO | P2 | 3h | A06 | F | Trigger node implementation 8 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-073** | INT | P2 | 4h | A06 | F | OAuth provider deep config 8 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-074** | INT | P2 | 5h | A06 | F | ePUAP signing flow step 8 | — | e2e sign + receipt download | git revert |
| **T008-075** | INT | P2 | 4h | A06 | F | MojeID integration step 8 | — | identity verify works | git revert |
| **T008-076** | INT | P2 | 2h | A06 | F | Make.com poll endpoint 8 | — | Make scenario receives data | delete route |
| **T008-077** | INT | P2 | 3h | A06 | F | Marketplace publishing step 8 | — | marketplace listing visible | remove listing |
| **T008-078** | INT | P2 | 3h | A07 | G | Webhook dispatch admin UI batch 8 | — | manual retry succeeds | git revert |
| **T008-079** | INT | P2 | 4h | A06 | F | CRM (Hubspot/Pipedrive) connector 8 | — | sync test record | remove connector |
| **T008-080** | INT | P2 | 3h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 8 | — | invoice round-trip | git revert |
| **T008-081** | AUTO | P2 | 4h | A06 | F | Workflows engine UI step builder 9 | — | save & run a sample workflow | git revert |
| **T008-082** | AUTO | P2 | 3h | A06 | F | Trigger node implementation 9 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-083** | INT | P2 | 4h | A06 | F | OAuth provider deep config 9 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-084** | INT | P2 | 5h | A06 | F | ePUAP signing flow step 9 | — | e2e sign + receipt download | git revert |
| **T008-085** | INT | P2 | 4h | A06 | F | MojeID integration step 9 | — | identity verify works | git revert |
| **T008-086** | INT | P2 | 2h | A06 | F | Make.com poll endpoint 9 | — | Make scenario receives data | delete route |
| **T008-087** | INT | P2 | 3h | A06 | F | Marketplace publishing step 9 | — | marketplace listing visible | remove listing |
| **T008-088** | INT | P2 | 3h | A07 | G | Webhook dispatch admin UI batch 9 | — | manual retry succeeds | git revert |
| **T008-089** | INT | P2 | 4h | A06 | F | CRM (Hubspot/Pipedrive) connector 9 | — | sync test record | remove connector |
| **T008-090** | INT | P2 | 3h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 9 | — | invoice round-trip | git revert |
| **T008-091** | AUTO | P2 | 4h | A06 | F | Workflows engine UI step builder 10 | — | save & run a sample workflow | git revert |
| **T008-092** | AUTO | P2 | 3h | A06 | F | Trigger node implementation 10 (webhook/cron/event) | — | trigger fires correct payload | git revert |
| **T008-093** | INT | P2 | 4h | A06 | F | OAuth provider deep config 10 (Google/MS/Notion/Slack) | — | OAuth e2e + token refresh | remove provider |
| **T008-094** | INT | P2 | 5h | A06 | F | ePUAP signing flow step 10 | — | e2e sign + receipt download | git revert |
| **T008-095** | INT | P2 | 4h | A06 | F | MojeID integration step 10 | — | identity verify works | git revert |
| **T008-096** | INT | P3 | 2h | A06 | F | Make.com poll endpoint 10 | — | Make scenario receives data | delete route |
| **T008-097** | INT | P3 | 3h | A06 | F | Marketplace publishing step 10 | — | marketplace listing visible | remove listing |
| **T008-098** | INT | P3 | 3h | A07 | G | Webhook dispatch admin UI batch 10 | — | manual retry succeeds | git revert |
| **T008-099** | INT | P3 | 4h | A06 | F | CRM (Hubspot/Pipedrive) connector 10 | — | sync test record | remove connector |
| **T008-100** | INT | P3 | 3h | A06 | F | Accounting (Fakturownia + Wfirma) sync step 10 | — | invoice round-trip | git revert |

> **Total tasks:** 100 · **Estimated effort:** 410h
