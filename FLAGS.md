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

## RRR-WAVE-B-CORE (Payload #12)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-028 | Wave B Core scope | B-001 (credit wiring), B-002 (deduct wiring), B-006 (transaction safety) implemented on top of existing `LedgerService.creditPoints` / `deductPoints` (which already had positive-amount validation, insufficient-balance rejection, and Promotional Bonus bucket routing from prior payloads). The payload literally proposed to replace those methods with thinner versions using `bucket: 'PROMOTIONAL_BONUS'` and a non-existent `recordIdempotency`/`mongooseConnection` on the service; we kept the existing semantics and added an optional `session` parameter plus a `withTransactionSafety` wrapper instead. | Yes | Confirm preservation of existing balance-validation semantics |
| F-029 | Transaction wrapper fallback | `withTransactionSafety` only attempts `mongoose.startSession()` when `mongoose.connection.readyState === 1` (connected) and falls back to non-transactional execution when (a) Mongoose is not connected (unit tests, dev without DB) or (b) the topology rejects transactions ("standalone", "Transaction numbers are only allowed on a replica set member or mongos"). Production deploys MUST run a replica set so the transactional path actually fires. | Yes | Confirm production runs replica set; add CI check if desired |
| F-030 | WalletController auth | `WalletController` exposes `POST /wallet/credit` and `POST /wallet/deduct` with no auth guard — matches the pattern of `BurnController`, `MerchantController`, etc. on this branch (no global guard wired yet). | Yes | Decide whether to add an admin/internal-API guard before exposing publicly |
| F-031 | WalletModule placement | `WalletModule` placed at `src/wallets/wallet.module.ts` next to the existing escrow `wallet.service.ts`. Uses the `useFactory` pattern for `LedgerService` per F-017. | Yes | Confirm placement |
| F-032 | RedRoomLedgerService unchanged | The payload's proposed update to `awardPointsWithCompliance` is functionally identical to the existing implementation (same AV → WGS → `creditPoints` flow); we left it as-is rather than re-shipping the same code minus the `source: 'RedRoomRewards'` metadata key it would have dropped. | Yes | Confirm no-op decision |

## RRR-WAVE-B-CONTINUATION (Payload #14)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-033 | Payload #14 scope delta | Payload #14 proposed new implementations of `merchant-pair-config.model.ts` (B-007), `no-hardcoded-balances.js` (B-008), and a `TenantScopeMiddleware` labelled B-009. All three underlying Wave B tasks (B-007, B-008, B-009) were already completed in prior commits with more comprehensive implementations. The payload's simpler versions were not applied. Instead: (1) `CrossMerchantExchangeService` was created (Wave C item, delivered early at CEO direction), adapted to use existing snake_case model fields; (2) `TenantScopeMiddleware` was created as new infrastructure — it is not the same as the chartered B-009 CI guard. | Yes | Confirm Wave C early-delivery of CrossMerchantExchangeService; confirm TenantScopeMiddleware as new Wave C infrastructure |
| F-034 | TenantScopeMiddleware DI wiring | `TenantScopeMiddleware` is created but not yet registered in `AppModule.configure()` — NestJS middleware registration requires knowing which routes to scope. Wire into `AppModule` when the auth layer that populates `req.tenantId` is in place (Wave C auth task). | Yes | Register middleware in AppModule once auth guard sets req.tenantId |
| F-035 | CrossMerchantExchangeService module | `CrossMerchantExchangeService` is exported from `src/services/index.ts` but not yet registered in a NestJS module provider array. Add to the appropriate module (e.g. a future `ExchangeModule` or `MerchantModule`) when the service is consumed by a controller. | Yes | Register in NestJS module when first consumed |

## Wave B Continuation — Payload #15 (B-010, B-011, B-012)

| ID | Category | Description | Default Used | CEO Action |
|----|----------|-------------|--------------|------------|
| F-036 | Wave B | B-010 IdempotencyService — existing production implementation preserved (MongoDB-backed, 8 operation constants, full test suite). Payload stub not applied. | Yes | Review |
| F-037 | Wave B | B-011 ReconciliationService — `reconcileUser`/`reconcileModel` use full-history `generateReconciliationReport`; emits RECON_MISMATCH log but never auto-corrects. Not yet wired to a scheduled job or admin endpoint (chartered in B-011 full scope). | Yes | Wire to `npm run reconcile` script and admin endpoint behind feature flag per charter |
| F-038 | Wave B | B-012 LedgerService invariant tests — existing comprehensive spec at `src/ledger/ledger.service.invariants.spec.ts` (4 invariants, 11 assertions) satisfies charter. Payload's simpler NestJS-DI-based duplicate not installed. | Yes | Review |
