# OQMI SYSTEM STATE

**Document:** OQMI_SYSTEM_STATE.md
**Repo:** OmniQuestMediaInc/ChatNowZone--BUILD
**Version:** v1.0 (first population — supersedes the v2.0-doctrine root copy)
**Last Updated:** 2026-04-21
**Owner:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Governing Document:** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`

---

## 0. PURPOSE

This document is the living tech-debt and accomplishment tracker for ChatNowZone--BUILD. It answers, at any point in time, three questions:

1. **DONE** — What has been built and is in production or merged to `main`?
2. **WIP** — What is actively in progress, on which branch, by which agent?
3. **OUTSTANDING** — What remains to be built, in what priority order, with what blockers?

It is NOT a doctrine document. Doctrine lives in `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md` (generic, repo-portable) and in this repo's product Canonical Corpus (`ChatNow_Zone_Canonical_Corpus_v10_v2.pdf`, project knowledge).

This document supersedes the prior root-level `OQMI_SYSTEM_STATE.md` v2.0 (March 28, 2026), which carried doctrine inline. That doctrine has been moved to `OQMI_GOVERNANCE.md`. This file now tracks state only.

---

## 1. REPO ORIENTATION

| Field | Value |
|---|---|
| Repo name | ChatNowZone--BUILD |
| Repo URL | https://github.com/OmniQuestMediaInc/ChatNowZone--BUILD |
| Default branch | `main` |
| Package manager | Yarn (per OQMI_GOVERNANCE §5.3 default; `package-lock.json` co-presence is tech debt — see §6) |
| Primary languages | TypeScript 84.0%, PLpgSQL 15.8%, JavaScript 0.2% |
| Total commits on `main` | 436 (as of 2026-04-21) |
| Active build epic | CNZ-CORE-002 (per superseded doctrine — to be reconfirmed against new charter) |
| Hard launch deadline | 1 October 2026 |
| Visibility | PUBLIC (CEO to revert to PRIVATE per Thread 16 §7.4 / Thread 18 §7.10) |

**Top-level directory structure (verified 2026-04-21 via web fetch of repo root):**

```
.github/
PROGRAM_CONTROL/
  └─ DIRECTIVES/
      └─ QUEUE/
          ├─ OQMI_GOVERNANCE.md      ← governance Source of Truth (CEO 2026-04-21)
          ├─ OQMI_SYSTEM_STATE.md    ← this document's authoritative location
          └─ RRR-GOV-002             ← see §6 BLOCKER: misplaced file
docs/
finance/
governance/
infra/postgres/
issues/
prisma/
safety/
scripts/
services/
tests/seed_data/
ui/types/                            ← only frontend artifact present; no apps/ dir
.eslintrc.js
.gitignore
.prettierrc
CLAUDE.md                            ← FLAGGED FOR DELETION per CEO 2026-04-21
OQMI_SYSTEM_STATE.md                 ← OLD v2.0 doctrine; superseded by this file
README.md                            ← FLAGGED FOR DELETION per CEO 2026-04-21
Sovereign_Kernel.md.pdf              ← RETIRED per CEO 2026-04-21; archive pending
docker-compose.yml
package-lock.json                    ← co-present with yarn.lock — tech debt
package.json
tsconfig.json
yarn.lock
```

Subdirectory contents below the top level have NOT been enumerated. Pre-read audit (Q-000) required.

---

## 2. SERVICE INVENTORY

The previous OQMI doctrine §8 declared eight priority services. State below is unverified beyond presence/absence of the parent `services/` directory, which exists but whose contents have not been listed.

| Service / Module | Path | Status | Owner Agent | Notes |
|---|---|---|---|---|
| Three-Bucket Wallet | `services/wallet/` (assumed) | UNKNOWN | unassigned | Verify per deficit doc R-101 |
| Risk Engine | `services/risk/` (assumed) | UNKNOWN | unassigned | Verify per deficit doc R-002/R-102 |
| NATS Fabric | unknown path | UNKNOWN | unassigned | Verify per deficit doc R-103 |
| OBS Broadcast Kernel | `services/broadcast/` or `services/obs/` (assumed) | UNKNOWN | unassigned | Verify per deficit doc R-104 |
| HeartZone IoT Loop | `services/heartzone/` (assumed) | UNKNOWN | unassigned | Verify per deficit doc R-105; naming clarify R-CLARIFY-010 |
| Bijou.Zone Theatre | `services/bijou/` (assumed) | UNKNOWN | unassigned | Verify per deficit doc R-106; Park scope clarify R-CLARIFY-011 |
| Sovereign CaC (Compliance) | `governance/`, `services/compliance/` (assumed) | UNKNOWN | unassigned | Verify per deficit doc R-107/R-007 |
| UI / Black-Glass Interface | `ui/types/` (only confirmed) | STUB | unassigned | No `apps/` exists; clarify R-CLARIFY-012 |

Status enums: `DONE`, `WIP`, `OUTSTANDING`, `STUB`, `RETIRED`, `BLOCKED`, `UNKNOWN` (added pending Q-000 verification).

---

## 3. DONE — Shipped to `main`

Confirmed shipped artifacts. Reverse-chronological. Pruning policy: items older than 90 days may be archived to `OQMI_SYSTEM_STATE_ARCHIVE.md`.

| Date | Item | PR / Commit | Agent | Notes |
|---|---|---|---|---|
| 2026-04-21 | `OQMI_GOVERNANCE.md` v1.0 landed at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/` | TBD | claude-in-chat (Thread 18) → CEO carry | Top-of-hierarchy governance document |
| 2026-04-21 | `OQMI_SYSTEM_STATE.md` rescoped template landed at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/` | TBD | claude-in-chat (Thread 18) → CEO carry | This document supersedes; the template was placeholder-only on landing |
| 2026-04-21 | `RRR-GOV-002` charter file landed at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/` | TBD | unknown | See §6 BLOCKER — file appears to be RedRoomRewards-native, scope reconciliation required |
| 2026-04-21 (authored) | `docs/ASSESSMENTS/REPO_VS_PLAN_TECHNICAL_DEFICIT_v1.md` | not yet landed | claude-in-chat (Thread 18) | Authored Thread 18; landing path declared; landed status to be confirmed via Q-000 |
| pre-2026-04-21 | Repo scaffolding with 436 commits across 13 top-level paths | n/a | mixed | Per top-level scan; per-directory contents unverified |

All earlier DONE items predate Thread 18 and have not been audited into this document. Q-000 pre-read audit and `git log` review will populate prior history.

---

## 4. WIP — In Progress

| Branch | Item | Started | Agent | Blocker | Next Action |
|---|---|---|---|---|---|
| `claude/adapt-governance-pattern-J9D4I` | RRR-GOV-002 charter ratification (per the file's own header) | unknown | claude-code | See §6 — file scope appears to be RedRoomRewards, not CNZ | CEO scope decision before any further charter task execution |
| `copilot/chore-update-program-control` (presumed still open) | Unknown — flagged stale in Thread 16 §3.2 | pre-2026-04-21 | copilot | Unread | Read diff; recommend merge or close (cleanup item 4.6) |

No other WIP confirmed at time of population. Branch list (26+ stale candidates per Thread 16) not yet enumerated.

---

## 5. OUTSTANDING — Backlog

Top of list = next action. CEO sets order; agents do not reorder without instruction.

| Priority | Item | Source | Scope | Blocker | Notes |
|---|---|---|---|---|---|
| 1 | `Q-000-PRE-READ-AUDIT` — bundle: list all subdirectories of `services/`, `governance/`, `safety/`, `finance/`, `docs/`, `PROGRAM_CONTROL/`, `issues/`, `scripts/`, `infra/`, `tests/`, `ui/`; read `prisma/schema.prisma`, `.github/copilot-instructions.md`, `docs/DOMAIN_GLOSSARY.md`; report 26 stale branch candidates | Deficit doc §1.3 | M | None | First action; unblocks every VERIFY row |
| 2 | Resolve RRR-GOV-002 scope question (Reading A: adopt as CNZ charter; Reading B: pull from CNZ, port pattern to CNZ-GOV-001) | CEO direction 2026-04-21 + scan finding | S | CEO decision | Blocks all RRR-GOV-002-A0NN tasks from executing in CNZ context |
| 3 | Delete `CLAUDE.md` from repo root | CEO directive 2026-04-21 | S | None | Roll into cleanup PR or standalone CHORE: |
| 4 | Delete `README.md` from repo root | CEO directive 2026-04-21 | S | Confirm Ghost Alpha seed-data line lands in replacement provenance location | Ghost Alpha line is currently sole reference to that fact |
| 5 | Archive or delete `Sovereign_Kernel.md.pdf` from repo root | CEO 2026-04-21 (RETIRED) | S | None | Cleanup item 4.3 |
| 6 | Delete superseded `OQMI_SYSTEM_STATE.md` v2.0 from repo root (this document at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` supersedes) | Implied by CEO 2026-04-21 source-of-truth declaration | S | This document landing first | Single-file delete |
| 7 | `THREAD19-COPILOT-CLEANUP-001` — execute Thread 17 §4 audit items 4.1, 4.2, 4.4–4.10 (4.3 retired); resolve `OQMI_SYSTEM_STATE.md` filename collision; confirm `OQMI_GOVERNANCE.md` and `RRR-GOV-002` paths | Deficit doc Part 6, Thread 18 handoff §1.7 | M | None — proceeds under OQMI_GOVERNANCE §1 | Includes branch audit on 26 stale candidates |
| 8 | Resolve `package-lock.json` + `yarn.lock` co-presence (delete `package-lock.json` per OQMI_GOVERNANCE §5.3 Yarn default) | OQMI_GOVERNANCE §5.3 | S | Verify nothing in CI references package-lock.json | Tech debt; auto-merge eligible |
| 9 | All twelve R-CLARIFY rows surfaced as a single CEO question set | Deficit doc Part 4 | S (decision); blocks downstream | CEO answers | Touch points: R-001 through R-013, R-105, R-106, R-108 |
| 10 | All eight R-P0 plan-internal contradictions (documentation amendments to v2.8 plan, NOT code) | Deficit doc Part 0 | S–M each | Most none; R-P0-005 needs JuryPulse decision | Address before next investor pass |
| 11 | All R-1xx VERIFY rows (R-101, R-103, R-104, R-105, R-106, R-107, R-108) | Deficit doc Part 3 | M each | Q-000 (item #1) | Verify-then-extend the eight priority services |
| 12 | All R-0xx BUILD-NEW rows with no clarify dependency (start: R-001 RedBook EXTEND on safety/, R-014 NOWPayouts) | Deficit doc Part 1 | L each | Q-000, R-006 (for R-014) | P0 launch-blocking subset |
| 13 | All clarify-blocked BUILD-NEW rows (execute as parent R-CLARIFY-* resolves) | Deficit doc Parts 1+2 | varies | Per-row clarify | R-003, R-004, R-005, R-008, R-009, R-012, R-013, R-015 |
| 14 | XL decomposition: R-011 Cyrano (4 layers), R-108 Black-Glass Interface | Deficit doc §5.3 | XL → multiple M/L | Per-row clarifies (R-CLARIFY-007, R-CLARIFY-012) | Decompose before queueing |
| 15 | Read Canonical Corpus v10 Chapters 8 §3 onward + Chapters 9–10 + appendices | Deficit doc not exhaustive against full Corpus | M | None | Read on-demand; appendices Master Glossary + RBAC Permission Ladder may pre-resolve clarifies |
| 16 | Locate or confirm absent `RRR_CEO_DECISIONS_FINAL_2026-04-17.md` | Cleanup item 4.9; Thread 16 carryover | S | None | Six-thread blind spot |

Source enums: `Deficit doc row [ID]` | `Canonical Corpus §[N]` | `Business plan §[N]` | `CEO directive YYYY-MM-DD` | `Tech debt` | `Bug`

Scope enums: `S` (<1 day), `M` (1–3 days), `L` (3–10 days), `XL` (>10 days, decompose)

---

## 6. BLOCKERS & FLAGS

| Date Flagged | Item | Type | Owner | What's Needed |
|---|---|---|---|---|
| 2026-04-21 | **RRR-GOV-002 scope ambiguity.** File at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002` declares itself "Governance Delta + Active Work Charter" for **RedRoomRewards** (per its own §1, §3.4 merchant-naming canon, §5.1 task IDs prefixed `RRR-`, model list referencing `Wallet`, `ModelWallet`, `EscrowItem`, `LedgerEntry`, `Idempotency`, `PointLot`, plus PR numbers #218 and #226 that don't appear in this repo's history). CEO declared it Source of Truth for ChatNow.Zone code and architecture going forward 2026-04-21. Two readings (a) adopt RRR-GOV-002 wholesale for CNZ and reconcile language as we go, OR (b) the file was misplaced; CNZ needs its own `CNZ-GOV-001` and RRR-GOV-002 belongs in the RedRoomRewards repo. | CEO clarification | claude-in-chat | Single CEO decision |
| 2026-04-21 | **`OQMI_SYSTEM_STATE.md` filename collision.** Two files share this name: the OLD doctrine v2.0 at repo root (March 28, 2026, work-order language), and the NEW rescoped template at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/`. CEO declared the QUEUE-path version Source of Truth 2026-04-21. Root version needs deletion to remove ambiguity. | Cleanup decision | copilot | Confirm no inbound references, then delete root version |
| 2026-04-21 | **`OQMI_GOVERNANCE.md` referenced as `(repo, root)` in template §0 and §11, but actual file path is `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`** | Documentation | claude-in-chat | Either move OQMI_GOVERNANCE.md to root, or amend the template's path references to match actual location |
| 2026-04-21 | **Repo currently PUBLIC.** Per Thread 16 §7.4 and Thread 18 §7.10, should revert to PRIVATE | CEO action | Kevin | One-click in repo Settings |
| 2026-04-21 | **`package-lock.json` and `yarn.lock` both present.** OQMI_GOVERNANCE §5.3 default is Yarn; mixed lockfiles violate "do not mix package managers in a single repo" | Tech debt | copilot | Delete `package-lock.json`; confirm CI doesn't reference it |
| 2026-04-21 | **Twelve R-CLARIFY rows open** (R-CLARIFY-001 through R-CLARIFY-012). Block dependent code rows. | CEO clarification | Kevin | Single consolidated answer set |
| 2026-04-21 | **`copilot/chore-update-program-control` branch unread.** Thread 16 §3.2 carryover | Tooling | copilot | Read diff; recommend merge or close |
| pre-2026-04-21 | **Twenty CRM integration scope ambiguity.** R-CLARIFY-002 / R-004 — MyCrew.Zone custom service vs Twenty CRM integration | CEO clarification | Kevin | Decision blocks any MyCrew.Zone work |
| pre-2026-04-21 | **HeartZone naming ambiguity.** R-CLARIFY-010 — repo doctrine says "HeartZone IoT Loop"; plan §B.7.1 says "HeartPleasureExperiences™" | CEO clarification | Kevin | Decision blocks any HeartZone extension work |
| pre-2026-04-21 | **Frontend repo location unknown.** R-CLARIFY-012 — only `ui/types/` exists; no `apps/` directory in repo. Black-Glass Interface has no implementation home | CEO clarification | Kevin | Decision blocks UI work scaling |
| pre-2026-04-21 | **Native vs OBS detection mechanism integrity.** R-006 / R-104 — CEO has flagged as the highest execution risk in the FairPay tiered payout structure | Architecture decision | claude-code | Build with auditable detection trail when R-006 executes |

Type enums: `CEO clarification`, `External dependency`, `Tooling`, `Credential`, `Architecture decision`, `Documentation`, `Cleanup decision`, `Tech debt`, `Other`

---

## 7. RETIRED ITEMS

Things that were in this repo, have been removed (or are in process of being removed), and should not be reintroduced.

| Date Retired | Item | Reason |
|---|---|---|
| 2026-04-21 | `Sovereign_Kernel.md.pdf` (root) | Retired per CEO. Archive or delete pending. Do not treat as authoritative. Do not reference. |
| 2026-04-21 | `CLAUDE.md` (root) | Redundant under OQMI_GOVERNANCE.md §10 hierarchy per CEO. Pending deletion. |
| 2026-04-21 | `README.md` (root, current minimal version) | Pending deletion per CEO. Ghost Alpha seed-data provenance to land in replacement location. |
| 2026-04-21 | `OQMI_SYSTEM_STATE.md` v2.0 (root, March 28 2026 doctrine version) | Superseded by this document at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md`. Pending root-file deletion. |
| 2026-04-21 (per Thread 17) | KIMI peer agent | Agent retired from workflow per CEO 2026-04-21 |
| pre-2026-04-21 | Work Order (WO-XXXX) protocol | Friction without auditability gain; replaced by scoped commit discipline (per superseded doctrine §2) |
| per RRR-GOV-002 §3.4 | Slot machine mechanics + seed data | Retired (D1) per RRR-GOV-002. Existing seed data purged. Any task proposing slot mechanics is invalid. (Note: scope of this retirement vs CNZ pending §6 RRR-GOV-002 scope decision.) |

---

## 8. PROVENANCE NOTES

Things an incoming agent needs to know that don't fit elsewhere.

* **Three Source-of-Truth files, all in `PROGRAM_CONTROL/DIRECTIVES/QUEUE/`:** `OQMI_GOVERNANCE.md` (governance), `RRR-GOV-002` (charter — scope under §6 review), `OQMI_SYSTEM_STATE.md` (this document, state tracker). CEO declared 2026-04-21.
* **Root-level `OQMI_SYSTEM_STATE.md` is the OLD doctrine version.** It says "OQMI CODING DOCTRINE v2.0" at the top and dates to March 28, 2026. It is superseded by this document and pending root-file deletion. Do NOT treat as authoritative.
* **Root-level `CLAUDE.md` still references retired Source-of-Truth files** (Sovereign_Kernel.md.pdf, OQMI_SYSTEM_STATE.md as "OQMI CODING DOCTRINE v2.0"). Pending deletion per CEO 2026-04-21.
* **`OQMI_GOVERNANCE.md` self-references its own location as "this repo, root" in its Document header and §11 cross-references**, but the file actually lives at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/`. Either move the file or amend the path references.
* **Commit prefix enum (per RRR-GOV-002 §3.5):** `FIZ | DB | API | SVC | INFRA | UI | GOV | TEST | CHORE`. NOT the older OQMI v2.0 enum (`FIZ | NATS | OBS | HZ | BIJOU | CRM | INFRA | UI | GOV | CHORE`). The two enums differ — needs reconciliation under §6 RRR-GOV-002 scope decision before any commits land using ambiguous prefixes.
* **HZ commit prefix ambiguity (R-CLARIFY-006):** old prefix referred to HeartZone IoT Loop; Human Contact Zone (plan Stack asset 9) may need a separate prefix.
* **Repo is currently PUBLIC.** Sensitive content review recommended before extended public exposure; revert to PRIVATE per Thread 16 §7.4.
* **`ui/types/` is the only frontend artifact.** No `apps/` directory exists. R-CLARIFY-012 unresolved — frontend repo location unknown.
* **`PROGRAM_CONTROL/DIRECTIVES/QUEUE/` exists but `PROGRAM_CONTROL/DIRECTIVES/DONE/` and `PROGRAM_CONTROL/REPORT_BACK/` (referenced in RRR-GOV-002 §0 and §2.2) have not been verified to exist.** Q-000 should confirm.
* **Top-level `issues/` directory is unusual** for a repo that uses GitHub Issues (which currently shows 0). Contents unverified. Q-000 should investigate.
* **`tests/` contains only `seed_data/` subdirectory at top level** — no `tests/unit/`, `tests/integration/`, etc. visible. Whether tests live elsewhere (per-service `__tests__/`) or are missing entirely is a Q-000 question.
* **Thread 18 → Thread 19 handoff doc** at `PROGRAM_CONTROL/HANDOFFS/THREAD-18-HANDOFF.md` — landing status unconfirmed; CEO carrying.

---

## 9. THIS DOCUMENT'S OWN STATE

| Field | Value |
|---|---|
| Last full review | 2026-04-21 (initial population) |
| Reviewed by | claude-in-chat (Thread 19, scan-derived) |
| Stale-flag threshold | 30 days since last update triggers automatic flag |

If this document has not been updated in 30 days but the repo has commits in that window, the document is out of date and the next agent to touch the repo should reconcile it before doing other work.

---

## 10. UPDATE PROTOCOL

Any agent that completes, starts, blocks, retires, or reprioritizes work in this repo MUST update this document in the same PR as the work itself. Updating this file is not Human-Review Category — it auto-merges with the work it documents.

Format discipline:

* Add new rows; do not delete historical ones except via §3 archive policy or §7 retirement
* Use ISO dates (YYYY-MM-DD)
* Use the status enums declared in §2 and source enums declared in §5
* One item per row; if an item has multiple sub-items, decompose into multiple rows or link out to an issue tracker

Failure to update this document on relevant PRs is an OQMI_GOVERNANCE §4.4 violation.

---

## 11. END OF DOCUMENT

This document tracks the state of ChatNowZone--BUILD. It does not declare doctrine. For doctrine, see `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md`. For product-specific operational and compliance charter, see `PROGRAM_CONTROL/DIRECTIVES/QUEUE/RRR-GOV-002` (scope under §6 review pending CEO decision).

For product feature spec and commercial layer, see ChatNow.Zone Business Plan v2.8 (project knowledge). For operational/compliance spine, see ChatNow.Zone Canonical Corpus v10 (project knowledge).

For the gap analysis driving §5 OUTSTANDING, see `docs/ASSESSMENTS/REPO_VS_PLAN_TECHNICAL_DEFICIT_v1.md` (Thread 18, 36 rows).

**Authority:** Kevin B. Hartley, CEO — Om