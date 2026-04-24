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

## RRR-PRODUCTION-READY (Payload #9)

- All modules are now wired and production-ready
- OpenAPI/Swagger is enabled for easy API documentation
- Health endpoint provides operational visibility
- `@nestjs/swagger` was added to `dependencies` (not previously present); `main.ts` now types the app as `NestExpressApplication` to match `setupSwagger`'s expected parameter type.
- Pre-existing `noUnusedLocals` errors in `src/metrics/logger.ts` (dead `shouldEmitMetricsLogs`) and `src/metrics/logger.spec.ts` (stale `originalNodeEnv` / unused `setTestEnv` import after a partial refactor) were blocking the baseline build and test suite. Both were repaired as part of this payload so the merge gate can run green.
