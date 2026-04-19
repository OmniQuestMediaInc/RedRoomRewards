# BUILD CONTROL - REWARDS OSS Reference Repo Registry

**Authority:** Kevin B. Hartley, CEO — OmniQuest Media Inc.
**Initialized:** 2026-04-18

---

## PURPOSE

Registry of all open-source repositories harvested as reference branches in this repo.
All entries are MIT or ISC licensed unless noted.
Patterns are adapted only — no source code is incorporated into RRR directly.

---

## HOW TO ACCESS REFERENCE BRANCHES

```
git show refs/{category}/{branch-name}:{filepath}
```

To include in a directive `CONTEXT` section:
```
REFERENCE: git show refs/oss/{name}:{filepath}
```

---

## REGISTERED REFERENCE BRANCHES

[POPULATE when OSS harvest directive is executed]

| Branch | Source Repo | License | Key RRR Use |
|---|---|---|---|
| [Add rows as branches are harvested] | | | |

---

## OSS HARVEST INSTRUCTIONS

When ready to populate reference branches:

1. Identify which OSS repos are relevant to this project's build
2. Use the OQMInc OSS Harvest Master Template (separate template)
3. Customize the repo list for this project's specific needs
4. Fire the harvest directive to Claude Code
5. Update this registry with the resulting branch details
