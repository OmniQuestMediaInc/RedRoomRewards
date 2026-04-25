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

## RRR-WAVE-B-CONTINUATION (Payload #14)

- B-007 `MerchantPairConfig` model was already present (committed prior to this payload) with a more comprehensive implementation using snake_case field names (`tenant_id`, `from_merchant_id`, `to_merchant_id`, `exchange_rate`, `effective_at`, `superseded_at`) and effective-dating via a unique partial index on the active row. The payload-proposed simpler camelCase schema was not applied.
- B-008 No-hardcoded-balance CI guard was already present as `scripts/ci/no-hardcoded-balance.js` (singular) with a more comprehensive implementation including self-test mode, allow-comment exemption, and schema-index exemption. The payload-proposed simpler version was not applied.
- B-009 Tenant-id scope CI guard was already present as `scripts/ci/tenant-id-scope-check.js` with `scripts/ci/tenant-id-allowlist.json`. The charter B-009 description ("CI guard") matches this implementation. The payload described B-009 as "Tenant-scope middleware" (a different concept); see F-033.
- `CrossMerchantExchangeService` added at `src/services/cross-merchant-exchange.service.ts` — resolves the active exchange rate from `MerchantPairConfig` using correct snake_case fields and `superseded_at: null` for active-row selection; falls back to `getDefaultExchangeRate()` (1.0) per CEO Decision B4. This is a Wave C item (chartered under Wave C provisional list) delivered early at CEO direction.
- `TenantScopeMiddleware` added at `src/middleware/tenant-scope.middleware.ts` — NestJS `NestMiddleware` that propagates `req.tenantId` into `req.queryOptions.tenant_id` for downstream service use. This is new infrastructure not explicitly chartered in Wave B; registered here per payload authority (see F-033).
