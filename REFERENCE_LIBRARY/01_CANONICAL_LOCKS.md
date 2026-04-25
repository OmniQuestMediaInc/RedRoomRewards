# BUILD CONTROL - REWARDS Canonical Locks

**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc. **Initialized:**
2026-04-18 **Status:** ACTIVE — changes require explicit CEO authorization

---

## PURPOSE

Records all CEO-authorized decisions permanently locked for BUILD CONTROL -
REWARDS. Once added, a decision cannot be changed without explicit CEO
authorization documented here with a date and rationale.

---

## ENTRY FORMAT

```
LOCK-{NNN}: {Short Title}

Date locked: {DATE}
Decision:    {Full statement}
Rationale:   {Why locked}
Affects:     {Which directives or systems}
```

---

## UNIVERSAL OQMINC LOCKS (apply to all projects)

### LOCK-000: Security Non-Negotiables

**Date locked:** Standing **Decision:** No backdoors, master passwords, magic
strings, or undocumented overrides. Never log or expose secrets, tokens,
credentials, PII, or payment data. Idempotency required for all money-adjacent
operations. Every balance change must be traceable to an immutable transaction.
No silent deletes on ledger or audit tables — soft-state only. **Affects:** All
directives touching financial, auth, or ledger logic.

---

### LOCK-001: Banned Entity

**Date locked:** Standing **Decision:** Jaime Watt / Navigator Ltd. is NOT a
partner and may never be. Never reference, suggest, or include in any
regulatory, advisory, or engagement context. **Affects:** All regulatory,
advisory, and partnership contexts.

---

### LOCK-002: Package Manager

**Date locked:** Standing **Decision:** Yarn for all package installation unless
explicitly overridden for a specific project with CEO authorization.
**Affects:** All CI and build directives.

---

## RRR-SPECIFIC LOCKS

[POPULATE as CEO decisions are locked during the build]

### LOCK-100: [First project-specific lock]

**Date locked:** **Decision:** **Rationale:** **Affects:**
