# RedRoom Rewards — Flags

## RRR-TIERS-GIFTING (Payload #2)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-004 | Tier thresholds | Hardcoded values from CEO spec | Yes | Confirm or adjust |
| F-005 | Gifting ledger method | `createGiftingPromotion` stub used | Yes | Implement in next payload if missing |
| F-006 | Branch divergence | Payload #1 files (`src/interfaces/redroom-rewards.ts`, `src/services/awarding-wallet.*`, `src/services/gateguard-av.service.ts`) were committed to sibling branch `claude/review-coding-protocols-jxp71`, not the designated branch `claude/review-coding-protocols-jxp71-A7M0p`. Only the interfaces file was seeded here to keep the new appends compilable. Awarding-wallet / GateGuard stubs remain absent, which affects `CreatorGiftingService`'s import of `GateGuardAVService`. | Yes | Confirm whether Payload #1 should be re-applied on this branch or the two branches merged |
| F-C01 | NestJS stack absence | `@nestjs/common` and `@nestjs/testing` are not in `package.json`. All 4 new service/controller/spec files import from NestJS packages and will fail to compile. Same premise error the sibling branch logged for Payload #1. | Installed exactly as labeled | Install NestJS deps, or refactor files to match this repo's plain-class pattern |

## RRR-WGS-LEDGER (Payload #3)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-009 | WGS thresholds | 1000-point trigger for scoring | Yes | Confirm or adjust |

## RRR-API-MEMBER-MERCHANT (Payload #4)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-008 | Member signup | Mandatory AV enforced; 1,000-point welcome bonus | Yes | Confirm welcome bonus amount |

## RRR-WHITELABEL-CREATOR-FINAL (Payload #6)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-013 | White-label | Service-bureau mode default | Yes | Confirm pricing model |
| F-014 | Creator panel | Balance from ledger stub | Yes | Confirm real integration |
