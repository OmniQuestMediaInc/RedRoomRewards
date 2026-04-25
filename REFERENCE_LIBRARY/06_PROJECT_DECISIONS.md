# BUILD CONTROL - REWARDS Architecture Decisions Log

**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc. **Initialized:**
2026-04-18

---

## PURPOSE

Append-only log of significant architecture, technology, and product decisions
made during the BUILD CONTROL - REWARDS build. Every entry is permanent.
Superseded decisions are marked SUPERSEDED with a reference to the new decision
— they are never deleted.

---

## ENTRY FORMAT

```
DEC-{NNN}: {Short Title}

Date:                   {DATE}
Thread:                 {N}
Decision:               {Full decision statement}
Rationale:              {Why this decision was made}
Alternatives considered:{What else was evaluated}
Affects:                {Systems, directives, or domains}
Status:                 ACTIVE | SUPERSEDED by DEC-{NNN}
```

---

## DECISIONS LOG

### DEC-001: Reference Library Workflow Adopted

**Date:** 2026-04-18 **Thread:** RRR-001 **Decision:** All BUILD CONTROL -
REWARDS threads use the REFERENCE_LIBRARY workflow. The Thread Bootstrap
(`00_THREAD_BOOTSTRAP.md`) is read at every thread open. Handoff documents carry
state only. Reference branches (`refs/*`) store OSS and internal reference
material permanently in the repo, never merging to main. CI workflow blocks all
`refs/*` to main merges automatically. **Rationale:** Eliminates reference
material loss across thread boundaries. Creates a single source of truth
accessible to all agents (Claude Code, Copilot, Claude Chat) via native git
commands. Version-controlled. Persists indefinitely without any external service
dependency. **Alternatives considered:** Google Drive only (no git versioning,
requires active MCP connector each session); handoff-embedded references (bloats
handoff documents, gets compressed or lost over many threads). **Affects:** All
future threads and all agents working on this repo. **Status:** ACTIVE
