# RedRoom Rewards — Assumptions

## RRR-TIERS-GIFTING (Payload #2)

- Tier thresholds and vibes are hardcoded per CEO specification
- Creator gifting uses existing LedgerService (`createGiftingPromotion` stub assumed)
- GateGuard AV is enforced at redemption time (not creation)
- Payload #1 interfaces (`RedRoomTier`, `GateGuardAVResult`, `AwardingWalletUploadRow`, `AwardingWalletUploadResult`) were not previously committed on this branch (`claude/review-coding-protocols-jxp71-A7M0p`); they were seeded into `src/interfaces/redroom-rewards.ts` from the sibling branch `claude/review-coding-protocols-jxp71` so the new `TierProgress`/`CreatorGiftingPromotion` appends resolve. See F-006.

## RRR-WGS-LEDGER (Payload #3)

- WGS scoring is stubbed (full WO-006 model coming in next payload)
- All RedRoom Rewards points flow through RedRoomLedgerService (Promotional Bonus bucket)
- High-value awards (>1000 points) trigger WGS check

## RRR-API-MEMBER-MERCHANT (Payload #4)

- AwardingWalletService integrates with existing LedgerService (awardPromotionalPoints method added via small patch in Payload #1)
- CSV parsing and validation assumed to be handled in controller or a future middleware layer
- All points awarded go into the Promotional Bonus bucket per Canonical Corpus
- Member signup now enforces mandatory GateGuard AV as brand standard
- All points awarded via `RedRoomLedgerService` (Promotional Bonus bucket)
- Merchant endpoints use existing auth context from `req.user`
- `TierEngineService` is the Payload #2 implementation (no changes in this payload)
- `RedRoomLedgerService` is the Payload #3 implementation (no changes in this payload) — MemberService invokes `awardPointsWithCompliance(memberId, 1000, 'WELCOME_BONUS')`

## RRR-BURN-REPORTING (Payload #5)

- Burn catalog integrates with RedRoomPleasures as the first redemption partner
- Reporting service provides AirMiles-level liability statements
- All burns route through RedRoomLedgerService for compliance

## RRR-WHITELABEL-CREATOR-FINAL (Payload #6)

- White-label SAAS supports both hosted (service-bureau) and self-hosted modes
- Creator gifting panel returns current balance + recent promotions for ChatNow.Zone embed
- All new controllers follow existing auth pattern via req.user

## RRR-FINAL-WIRING (Payload #7)

- All modules are now properly wired in AppModule
- Full NestJS architecture is in place and matches the repo
- All services follow existing ledger and auth patterns
- `LedgerService` (in `src/ledger/ledger.service.ts`) is not decorated with `@Injectable()` and its constructor takes a `Partial<LedgerConfig>` config object. To allow NestJS DI to instantiate it without resolving a non-existent type token, each module that depends on it (Member/Merchant/Burn/RedRoomLedger) registers it via `{ provide: LedgerService, useFactory: () => new LedgerService() }`. See F-016.
- `WelfareGuardianScoreService` is added to `MemberModule` and `BurnModule` providers because it is a transitive dependency of `RedRoomLedgerService`. Payload #7 listed it only under `RedRoomLedgerModule`, but Nest resolves providers per-module.

## RRR-ENGINE-COMPLETE (Payload #10)

- All 10 payloads are now integrated and wired
- Production config (`src/config/production.config.ts`) is in place and loaded globally via `ConfigModule.forRoot({ load: [productionConfig] })`
- `.env.example` extended with `GATEGUARD_AV_API_KEY`, `GATEGUARD_AV_ENDPOINT`, and `SERVICE_BUREAU_ENABLED` (existing security-critical secrets preserved, not replaced)
- `HealthController` exposes `GET /api/v1/health` returning service status, timestamp, and uptime
- `@nestjs/config@^4.0.0` installed as a runtime dependency
- Engine is ready for staging deployment

## RRR-DEPLOYMENT-READY (Payload #11)

- Final payload completes all external user components
- Engine is fully wired and ready for staging deployment
- `src/config/app.config.ts` added and loaded alongside `productionConfig` in `AppModule`
- `DEPLOYMENT-CHECKLIST.md` captures pre-deploy verification, staging steps, and production go-live tasks
- `.env.example` was extended (not replaced) with the Payload #11 `DATABASE_URL` alias; existing security-critical entries (`JWT_SECRET`, `QUEUE_AUTH_SECRET`, `RRR_WEBHOOK_SECRET`, `MONGODB_URI`, `CORS_ORIGINS`, etc.) are preserved per F-021 precedent
- `/health` is already exposed outside the `api/v1` global prefix (see #283) and continues to return 200
- OpenAPI docs are already served at `/api/docs` (see #279)

## RRR-WAVE-B-CORE (Payload #12)

- B-001 (`creditPoints` wiring), B-002 (`deductPoints` wiring), and B-006 (MongoDB transaction safety) are now implemented end-to-end
- New `WalletController` at `src/controllers/wallet.controller.ts` exposes `POST /wallet/credit` and `POST /wallet/deduct` and forwards directly into `LedgerService.creditPoints` / `LedgerService.deductPoints`
- `WalletModule` (`src/wallets/wallet.module.ts`) is registered in `AppModule`; `LedgerService` is provided via `useFactory` per F-017 to avoid the `Partial<LedgerConfig>` DI token issue
- `LedgerService.creditPoints` and `LedgerService.deductPoints` accept an optional Mongoose `ClientSession` (the 6th arg) so callers can enlist these writes in an outer transaction. When no session is supplied, the service opens its own via the new private `withTransactionSafety` wrapper
- `LedgerService.createEntry` accepts an optional `ClientSession` second argument and threads it into `LedgerEntryModel.create([doc], { session })` when provided, so the immutable ledger write participates in the outer transaction
- `withTransactionSafety` only attempts a transaction when `mongoose.connection.readyState === 1` and falls back to non-transactional execution if the topology rejects transactions (standalone, retryable-writes errors). This keeps unit tests deterministic without a replica set; production must run a replica set for the real transactional path to fire (F-029)
- Existing balance-validation semantics on `creditPoints` / `deductPoints` (positive-amount check, insufficient-balance rejection, Promotional Bonus bucket via `PROMOTIONAL_AWARD` / `ADMIN_DEBIT` reason codes) are preserved — these were already in place from prior payloads
- `RedRoomLedgerService.awardPointsWithCompliance` is unchanged; it already uses `LedgerService.creditPoints` and now inherits transaction safety transparently (F-032)

## RRR-WAVE-B-CONTINUATION (Payload #13)

- B-003 (`WalletController` integration coverage), B-004 (`Tenant` model), B-005 (`Merchant` model), and the public B-006 transaction wrapper are now in place
- Public `LedgerService.withTransaction<T>(fn)` helper added (delegates to the existing private `withTransactionSafety`) so callers outside the ledger can enlist multi-model writes in a single Mongo session without reaching into private API. This is the canonical caller-facing entry point for the B-006 transaction safety guarantee
- B-003 integration spec lives at `src/api/__tests__/wallet.controller.integration.spec.ts` and uses `@nestjs/testing`'s `Test.createTestingModule` to wire the real `WalletController` to a mocked `LedgerService`. Imports were rewritten from the original payload paths (`../wallet.controller`, `../../services/ledger.service`) to the actual implementation locations on this branch (`src/controllers/wallet.controller.ts`, `src/ledger/ledger.service.ts`) — see F-024
- Tenant + Merchant models already existed at `src/db/models/tenant.model.ts` and `src/db/models/merchant.model.ts` from prior work, with richer schemas than the Payload #13 stub: `tenant_id`/`merchant_id` IDs, `phase` (CEO Decision B3), `merchant_tier` (CEO Decision B2 / B5 caps PLATINUM 50 / GOLD 35 / SILVER 20 / MEMBER 10 / GUEST 5), `default_currency`, status enum extended with `archived`, and compound indexes on `tenant_id + status` / `tenant_id + merchant_tier` / `phase + status`. The richer schemas are kept as-is — the Payload #13 stub would have regressed them — and B-004 / B-005 are considered satisfied by the existing definitions (F-024)
