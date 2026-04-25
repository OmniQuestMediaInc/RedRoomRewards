# CNZ-WORK-001-A001 — Q-000-PRE-READ-AUDIT

**Status on completion:** DONE (audit deliverable complete; PR pending merge)
**Agent:** claude-code **Agent-hint override:** charter `Agent: copilot`
overridden per charter §2 routing-suggestion clause. No copilot claim observed
within session; claude-code executed read-only audit. Override logged here per
§2 requirement. **Date:** 2026-04-22 **PR:** pending **Merge commit SHA:**
pending **Branch:** `claude/intake-work-charter-4k9zf`

---

## What was done

1. Enumerated recursive contents (depth ≥3) for all eleven target
   subdirectories: `services/`, `governance/`, `safety/`, `finance/`, `docs/`,
   `PROGRAM_CONTROL/`, `issues/`, `scripts/`, `infra/`, `tests/`, `ui/`.
2. Read and captured contents of the three required key files:
   `prisma/schema.prisma`, `.github/copilot-instructions.md`,
   `docs/DOMAIN_GLOSSARY.md`.
3. Read root `README.md` and root `OQMI_SYSTEM_STATE.md` (both slated for
   deletion by A003/A006) to capture their current content before removal.
4. Enumerated all remote branches (4 total), computed last-commit timestamps and
   divergence vs `origin/main`, and classified each for the A009 stale-branch
   report.
5. Grep swept the repo (and `.github/` specifically) for inbound references to
   each Wave A removal target (`CLAUDE.md`, `Sovereign_Kernel`,
   `OQMI_SYSTEM_STATE.md`) to identify live couplings that will break
   A003/A005/A006 if not addressed in the same PR.

---

## What was found / surfaced

### 1. Repo top-level inventory

Present at root:

- `.devcontainer/`, `.github/`, `.editorconfig`, `.eslintrc.js`, `.gitignore`,
  `.markdownlintignore`, `.prettierignore`, `.prettierrc`
- `LEGACY_CONFIGS/` — contains duplicate `.eslintrc.js`, `.gitignore`,
  `.prettierrc`, `package.json`, `tsconfig.json` (not referenced in charter;
  worth a cleanup amendment)
- `OQMI_SYSTEM_STATE.md` (root — A006 target; 5204 bytes; is the old v2.0 Coding
  Doctrine, NOT the state template)
- `PROGRAM_CONTROL/`, `REFERENCE_LIBRARY/`
- `README.md` (131 bytes — contains ONLY the Ghost Alpha provenance line that
  A004 preserves)
- `Sovereign_Kernel.md.pdf` (120,730 bytes — A005 target; still present)
- `archive/` (already exists; contains only `governance/CLAUDE.md`)
- `docker-compose.yml`, `jest.config.js`, `package.json`, `tsconfig.json`
- `docs/`, `finance/`, `governance/`, `infra/`, `prisma/`, `safety/`,
  `scripts/`, `services/`, `tests/`, `ui/`
- `yarn.lock` (present)
- **No `CLAUDE.md` at root** — A002 appears to have been partially executed; the
  file was MOVED to `archive/governance/CLAUDE.md` rather than deleted. Flag for
  A002 amendment.
- **No `package-lock.json`** — A007's stated condition (co-presence of
  `package-lock.json` + `yarn.lock`) does not obtain; A007 may already be DONE
  implicitly.
- **No `issues/` directory** — charter enumerates it but repo does not have it.
  Not a defect; just noted.

### 2. Subdirectory contents (summary)

- **`services/`** (11 modules): `assets/`, `bijou/`, `core-api/` (large;
  contains analytics, audit, auth, compliance, config, creator, dfsp, events,
  finance, games, geo, governance, growth, ingestion, marketing, membership,
  nats, payments, risk, safety, scheduling, studio, zone-access), `nats/`,
  `obs-bridge/`, `rewards-api/`, `risk-engine/`, `showzone/`, `vision-monitor/`,
  `zone-gpt/`. Multiple `.d.ts` / `.js` / `.js.map` build artifacts committed
  (cleanup candidate).
- **`governance/`**: single file `pre-ship-audit.service.ts`. Thin.
- **`safety/`**: single file `security-guardrails.service.ts`. Thin — RedBook
  (E001) will likely extend here.
- **`finance/`** (FIZ): 9 service files including `schema.ts`,
  `token-extension.service.ts`, `commission-splitting.service.ts`,
  `batch-payout.service.ts`, `containment-hold.service.ts`,
  `evidence-packet.service.ts`, `forensic-hasher.service.ts`,
  `audit-dashboard.service.ts`, `notification-gateway.service.ts`.
- **`docs/`**: `AUDIT_CERTIFICATION_V1.md`, `DIRECTIVE_TEMPLATE.md`,
  `DOMAIN_GLOSSARY.md`, `MEMBERSHIP_LIFECYCLE_POLICY.md`,
  `REQUIREMENTS_MASTER.md`, `ROADMAP_MANIFEST.md`,
  `RRR_CEO_DECISIONS_FINAL_2026-04-17.md` (**A010 target FOUND HERE**, not
  absent), `compliance/evidence_templates/NCII_TAKEDOWN_LOG.md`,
  `doctrine/COPILOT_GUARDRAILS.md`.
- **`PROGRAM_CONTROL/`**:
  - `DIRECTIVES/DONE/` — 25 completion records present (A011: directory exists,
    populated).
  - `DIRECTIVES/IN_PROGRESS/` — exists, empty except `.gitkeep` (not required by
    charter but present).
  - `DIRECTIVES/QUEUE/` — holds the three SoT files plus `RRR-GOV-002`.
  - `REPORT_BACK/` — exists, heavily populated (100+ report files) (A011:
    directory exists).
  - `REPO_MANIFEST.md` — present.
- **`issues/`** — absent.
- **`scripts/`**: `seed-scheduling.ts`, `verify-gov-gate.sh`,
  `verify-vault-delivery.ts`.
- **`infra/`**: `postgres/init-ledger.sql` only.
- **`tests/`**: `integration/` (8 specs) + `seed_data/` (10 CSV files — the
  Ghost Alpha corpus).
- **`ui/`**: `types/finance-contracts.ts` only. Frontend surface is essentially
  empty; consistent with R-CLARIFY-012 / R-108 being unresolved.

### 3. Key-file contents (highlights)

- **`prisma/schema.prisma`** (1,182 lines; 15 original tables + DFSP/PV-001
  additions + GZ scheduling + membership + bijou + ShowZonePass + Creator stub).
  **Schema-invariant (OQMI_GOVERNANCE §5.2) gap:** many earlier models lack one
  or both of `correlation_id` / `reason_code`.
  - Missing both: `LedgerEntry`, `Transaction`, `UserRiskProfile`,
    `StudioContract`, `ReferralLink`, `AttributionEvent`,
    `NotificationConsentStore`, `CallBooking`, `CallSession`, `VoucherVault`,
    and most DFSP/PV-001 models (`PurchaseWindowConfig`, `RiskAssessment`,
    `IntegrityHold`, `CheckoutConfirmation`, `OtpEvent`, `AccountHold`,
    `VoiceSample`, `QuoteSession`, `DiamondContract`, `TokenBalance`,
    `ExpeditedAccessEvent`, `MonitoringFlag`, `ModelFlag`, `TreasuryOverride`,
    `ExecutiveConsultation`, `CollectionsQueue`).
  - Has `reason_code` but missing `correlation_id`: `AuditEvent`, `LegalHold`.
  - Has `rule_applied_id` but no `reason_code` and no `correlation_id`:
    `TipMenuItem`, `GameSession`, `PrizeTable`, `ContentSuppressionQueue`.
  - Compliant (has both `correlation_id` + `reason_code`): all GZ scheduling
    models (`StaffMember`, `SchedulePeriod`, `ShiftTemplate`, `ShiftAssignment`,
    `ShiftGap`, `ShiftBid`, `ScheduleAuditLog`, `DepartmentCoverage`,
    `StatHoliday`); `WebhookIdempotencyLog`.
  - Feeds D001/D002/D008 gap-close scope and H001/H002 CI guards. **No appended
    `## HANDOFF` block in the schema file.**
- **`.github/copilot-instructions.md`** (267 lines) — declares (lines 7–8):
  `Source of Truth: Sovereign_Kernel.md.pdf (repo root)` and
  `Coding Doctrine: OQMI_SYSTEM_STATE.md (repo root) — OQMI CODING DOCTRINE v2.0`.
  Both pointers become stale the instant A005 and A006 land; this file **must be
  updated in the same PR** as A005/A006. The file also carries a THIRD
  commit-prefix inventory (§2E and §8) that differs from both
  `docs/DOMAIN_GLOSSARY.md` and root `OQMI_SYSTEM_STATE.md` — feeds directly
  into A012 reconciliation scope.
- **`docs/DOMAIN_GLOSSARY.md`** (223 lines) — present and well-formed; canonical
  naming authority. Carries a `COMMIT PREFIXES` table (14 entries) that is the
  most complete of the three, but still differs from copilot-instructions (no
  `SHOWZONE:` there) and from root OQMI_SYSTEM_STATE v2.0 (no
  `GGS`/`CYR`/`SHOWZONE` there). All three must be reconciled by A012.

### 4. Branch inventory (4 remote branches)

| Branch                                     | Last commit (UTC)   | Unique vs main                                           | Classification                                                                                                                                                                         |
| ------------------------------------------ | ------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main`                                     | 2026-04-21 18:19:58 | n/a                                                      | ACTIVE                                                                                                                                                                                 |
| `claude/intake-work-charter-4k9zf`         | 2026-04-21 18:19:58 | 0 (same HEAD)                                            | ACTIVE (this session's branch)                                                                                                                                                         |
| `copilot/rrr-gov-002-a005-your-assignment` | 2026-04-21 04:16:29 | **0** (merge-base == tip; fully behind main)             | STALE-CANDIDATE (zero unique content; orphaned scaffold)                                                                                                                               |
| `copilot/sync-yarn-lockfile`               | 2026-04-21 04:16:36 | 2 (`ac9f50f` yarn.lock +5 lines; `b3e7faa` bot manifest) | STALE-CANDIDATE (superseded — main already contains `303f646 CHORE: update yarn.lock to fix CI --frozen-lockfile failure` from a different copilot branch that was merged via PR #291) |

**None are stale by the 60-day rule** (all last-commit within 24h). Both copilot
branches are stale **by purpose** — they carry no content not already in or
superseded by main. Recommend closure decisions via A008/A009. Charter A008
specifically names `copilot/chore-update-program-control`; **that branch does
not exist on the remote** — already deleted or never existed. Flag for A008
amendment.

### 5. Live couplings discovered (CRITICAL — will break A-wave if not addressed in same PR)

| Removal target                      | Live coupling                                                                                                                                                       | Remediation                                                                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `OQMI_SYSTEM_STATE.md` (root, A006) | `.github/required-files.txt:5` lists this file as required; `validate-structure` CI job reads the list and will FAIL when the file is deleted                       | A006 PR must also edit `.github/required-files.txt` — either remove the line or point it at `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` |
| `OQMI_SYSTEM_STATE.md` (root, A006) | `.github/copilot-instructions.md:8` declares it as "Coding Doctrine v2.0"                                                                                           | A006 PR must update copilot-instructions to reference `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_GOVERNANCE.md` as doctrine                             |
| `Sovereign_Kernel.md.pdf` (A005)    | `.github/copilot-instructions.md:7` declares it as "Source of Truth"                                                                                                | A005 PR must replace this reference (likely with `OQMI_GOVERNANCE.md`)                                                                              |
| `README.md` (A003)                  | No live code/CI references found beyond the Ghost Alpha provenance line (already mirrored to A004)                                                                  | Safe to delete after A004 lands                                                                                                                     |
| `CLAUDE.md` (A002)                  | File **already absent** from repo root; a copy exists at `archive/governance/CLAUDE.md`. Ten repo-wide mentions are all inside docs / report-backs / charter itself | A002 is effectively already executed; task amend to "verify+close" recommended                                                                      |

### 6. Other flags

- **SoT document the charter calls "live" is actually the unpopulated
  template.** `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` still
  contains template placeholders (`[REPO NAME — fill in per repo]`,
  `[e.g., ChatNowZone--BUILD]`, example rows). A004, A006, and every §10
  in-same-PR update downstream assume a populated document. Recommend adding a
  Wave A task `A015: Populate OQMI_SYSTEM_STATE.md from template`.
- **Charter filename on disk is `CNZ_WORK-001`** (underscore, no `.md`
  extension). The file's own `**Path:**` header, the governance/state docs, and
  all external references use `CNZ-WORK-001.md`. Completion-record protocol
  (§11) references the dashed path. Recommend rename as an early A-wave
  amendment.
- **OQMI_GOVERNANCE.md self-references its own location as "this repo, root"**
  in multiple places. Already tracked by A013.
- **`PROGRAM_CONTROL/DIRECTIVES/IN_PROGRESS/`** exists (not required by charter
  but aligns with `.github/copilot-instructions.md §10` autonomous protocol). No
  action needed.
- **Prisma schema-invariant gaps**: see §3 above for the precise per-model
  breakdown. Feeds D001/D002/D008 and H001 scope; should be surfaced separately
  as a schema-close task.
- **Committed build artifacts** (`*.d.ts`, `*.js`, `*.js.map`) under
  `services/bijou/`, `services/showzone/`, `services/zone-gpt/`,
  `services/nats/`. Likely should not be tracked. Candidate for Wave A99
  cleanup.

---

## What's left

Nothing within A001 scope. Audit deliverable is complete. Follow-up tasks
surfaced above (not executed):

1. **Charter amendment recommended:
   `A015 — Populate OQMI_SYSTEM_STATE.md from template`** (new task). Unblocks
   correct §4/§5/§6 updates for every subsequent Wave A task.
2. **Charter amendment recommended: `A002 — verify+close`** rather than
   delete-and-grep (file already absent from root).
3. **Charter amendment recommended: `A007 — mark already-DONE`** (no
   `package-lock.json` present).
4. **Charter amendment recommended: `A008 — redirect`** (named branch does not
   exist; substitute the two remote branches that DO exist and need closure
   decisions: `copilot/rrr-gov-002-a005-your-assignment` and
   `copilot/sync-yarn-lockfile`).
5. **Charter amendment recommended: rename file on disk** from `CNZ_WORK-001` to
   `CNZ-WORK-001.md` to match the charter's own `**Path:**` header and the §11
   completion-record protocol.
6. **A005 / A006 directives should be expanded** to include the
   `.github/required-files.txt` and `.github/copilot-instructions.md` coupling
   updates, otherwise those PRs will break CI.

All six items require CEO decision; surfacing only.

---

## Files touched (this PR)

- `PROGRAM_CONTROL/REPORT_BACK/CNZ-WORK-001-A001-report.md` (new — this file)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ_WORK-001` (charter §6 A001 `Status:`
  line amended — see Appendix A.1)
- `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` (§4 WIP row added for
  A001 — see Appendix A.2)

## Tests added / modified

None. A001 is read-only audit; no test surface.

## OQMI_SYSTEM_STATE.md updates landed in same PR

- §3 DONE: no (A001 not merged yet; will add on merge)
- §5 OUTSTANDING: no (charter §6 is the OUTSTANDING list for CNZ-WORK-001 tasks;
  see charter)
- §6 BLOCKERS: no
- §4 WIP: **yes** — new row added for A001 IN-REVIEW on this branch (see
  Appendix A.2)

---

## Appendix A — Companion file edits applied in this PR

The following two edits are applied to the other files touched by this PR.
Recorded verbatim so the edits are auditable from the REPORT_BACK itself.

### A.1 — `PROGRAM_CONTROL/DIRECTIVES/QUEUE/CNZ_WORK-001` (charter)

In the `CNZ-WORK-001-A001` task block (§6, Wave A), the `Status:` line is
amended.

**Before:**

```
CNZ-WORK-001-A001: Q-000-PRE-READ-AUDIT
Wave: A
Priority: P0
Scope: M
Agent: copilot
Depends-on: none
CEO_GATE: NO
FIZ: NO
Source: Deficit doc §1.3
Status: QUEUED
Directive: Enumerate full subdirectory contents (recursive, depth >=3) for: services/, governance/, safety/, finance/, docs/, PROGRAM_CONTROL/, issues/, scripts/, infra/, tests/, ui/. Read and report contents of: prisma/schema.prisma, .github/copilot-instructions.md, docs/DOMAIN_GLOSSARY.md (if present). List all branches and flag stale candidates (no commits in 60+ days). File output as REPORT_BACK. This is the foundational audit that unblocks every VERIFY row in the deficit doc.
```

**After:**

```
CNZ-WORK-001-A001: Q-000-PRE-READ-AUDIT
Wave: A
Priority: P0
Scope: M
Agent: copilot
Depends-on: none
CEO_GATE: NO
FIZ: NO
Source: Deficit doc §1.3
Status: IN-REVIEW — claude-code (Agent hint "copilot" overridden per §2; see REPORT_BACK CNZ-WORK-001-A001-report.md)
Directive: Enumerate full subdirectory contents (recursive, depth >=3) for: services/, governance/, safety/, finance/, docs/, PROGRAM_CONTROL/, issues/, scripts/, infra/, tests/, ui/. Read and report contents of: prisma/schema.prisma, .github/copilot-instructions.md, docs/DOMAIN_GLOSSARY.md (if present). List all branches and flag stale candidates (no commits in 60+ days). File output as REPORT_BACK. This is the foundational audit that unblocks every VERIFY row in the deficit doc.
```

Only the `Status:` line changes. Every other line in the A001 block is
unchanged. No other task's `Status:` line is touched.

On merge, per charter §11, this line will be amended again to:

```
Status: DONE — #<PR> — CNZ-WORK-001-A001-DONE.md
```

### A.2 — `PROGRAM_CONTROL/DIRECTIVES/QUEUE/OQMI_SYSTEM_STATE.md` (state doc)

In §4 WIP, the placeholder example row is replaced with a live row for A001.

**Before:**

```
| Branch | Item | Started | Agent | Blocker | Next Action |
|---|---|---|---|---|---|
| `feature/[name]` | [What is being built] | YYYY-MM-DD | [agent] | [none / description] | [next concrete step] |
```

**After:**

```
| Branch | Item | Started | Agent | Blocker | Next Action |
|---|---|---|---|---|---|
| `claude/intake-work-charter-4k9zf` | CNZ-WORK-001-A001 Q-000-PRE-READ-AUDIT | 2026-04-22 | claude-code | none | PR review + merge; then move to §3 DONE |
```

**Note on the broader state of this document:** the rest of
`OQMI_SYSTEM_STATE.md` remains as the v1.0 template (unpopulated placeholders in
§1, §2, §3, §5, §6, §7, §8, §9). Populating the full template is out of scope
for A001 and is surfaced above as recommended new task **A015 — Populate
OQMI_SYSTEM_STATE.md from template**. Only §4 is touched in this PR.
