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

## RRR-BURN-REPORTING (Payload #5)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-011 | Burn catalog | First partner is RedRoomPleasures | Yes | Confirm catalog source |
| F-012 | Reporting | Liability numbers stubbed | Yes | Confirm real ledger query |

## RRR-WHITELABEL-CREATOR-FINAL (Payload #6)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-013 | White-label | Service-bureau mode default | Yes | Confirm pricing model |
| F-014 | Creator panel | Balance from ledger stub | Yes | Confirm real integration |

## RRR-FINAL-WIRING (Payload #7)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-016 | Final wiring | All modules registered | Yes | Review before production deploy |
| F-017 | LedgerService DI | `LedgerService` lacks `@Injectable()` and takes a `Partial<LedgerConfig>` config arg. Each module that depends on it registers it with `useFactory: () => new LedgerService()` so Nest doesn't try to resolve `Partial<LedgerConfig>` as a token. | Yes | Decide whether to add `@Injectable()` and a CONFIG token, or keep the factory pattern |
| F-018 | Transitive providers | `WelfareGuardianScoreService` was added as a provider to `MemberModule` and `BurnModule` (in addition to `RedRoomLedgerModule`) because Nest does not auto-share providers across feature modules unless they are exported. | Yes | Confirm or refactor into a shared `RedRoomLedgerModule` import |

## RRR-PRODUCTION-READY (Payload #9)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-019 | Final payload | All external components complete | Yes | Review before staging |
| F-020 | OpenAPI | Swagger enabled at `/api/docs`; `@nestjs/swagger` added to `dependencies` | Yes | Confirm auth setup / lock-down in prod |
| F-021 | CORS | `enableCors({ origin: true })` reflects any origin — payload comment says "tighten in prod" | Yes | Restrict to park-owned origins before public launch |
| F-022 | Baseline repair | Fixed pre-existing TS `noUnusedLocals` errors in `src/metrics/logger.ts` and `src/metrics/logger.spec.ts` that were blocking `npm run build` and `npm test` before Payload #9 ever touched the tree. Logger spec was half-migrated to the `setTestEnv` helper; completed the migration rather than rolling it back. | Yes | Confirm the spec still exercises the intended NODE_ENV matrix |
