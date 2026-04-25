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

## RRR-ENGINE-COMPLETE (Payload #10)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-020 | Final payload | Engine complete — production config, health check, ConfigModule wiring in place | Yes | Review before staging deploy |
| F-021 | .env.example contract | Payload #10 shipped a minimal `.env.example`; we appended the GateGuard AV and `SERVICE_BUREAU_ENABLED` vars rather than replacing existing security-critical entries (`JWT_SECRET`, `QUEUE_AUTH_SECRET`, `RRR_WEBHOOK_SECRET`, `MONGODB_URI`, etc.) | Yes | Confirm additive approach or provide authoritative replacement |
| F-022 | `@nestjs/config` dependency | Payload #10 used `ConfigModule.forRoot()` and `registerAs` without listing the package; installed `@nestjs/config@^4.0.0` to make the imports resolve | Installed exactly as implied | Confirm the pinned version is acceptable |
| F-023 | OpenAPI docs | README references `/api/docs` but no Swagger module is wired in this payload; payload did not include Swagger setup. Endpoint is not yet live. | No | Decide whether Swagger should be added in a follow-up |

## RRR-DEPLOYMENT-READY (Payload #11)

> Note: Payload #11 re-used the flag id `F-021` already assigned to the additive `.env.example` decision in Payload #10. The new "all components complete" flag is recorded here as `F-024` to avoid collision.

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-024 | Final payload | All components complete — `app.config.ts`, `DEPLOYMENT-CHECKLIST.md`, additive `.env.example` update, and checklist docs in place | Yes | Approve staging deploy |
| F-025 | .env contract drift | Payload #11 `.env.example` body specifies `DATABASE_URL=mongodb+srv://...` while the live file already uses `MONGODB_URI`. Added `DATABASE_URL` as an alias entry rather than renaming, to preserve the security-critical keys (`JWT_SECRET`, `QUEUE_AUTH_SECRET`, `RRR_WEBHOOK_SECRET`, `CORS_ORIGINS`, etc.) that Payload #11's minimal body would have removed. | Yes | Confirm alias approach or provide authoritative replacement |
| F-026 | `app.config.ts` vs `production.config.ts` | Payload #11 introduces `app.config` with `swaggerEnabled`, which duplicates the key already exported by `production.config.ts`. Both are loaded; whichever is read last wins per `ConfigService` semantics (`app` namespace is queried independently from `production`). | Yes | Decide whether to consolidate into a single namespace |
| F-027 | Coverage thresholds | `npm run test:coverage` is below the 59% global statement/line threshold (56.67% statements / 57.42% lines). This is pre-existing on the baseline (`f68f6ee`, before this payload, measured 56.76% / 57.49%) and is not introduced by Payload #11. `npm test` passes 259/259 and `npm run build` succeeds. | Yes | Backfill tests for low-coverage files (e.g. `wallet.service.ts`, module barrels) in a follow-up payload |
