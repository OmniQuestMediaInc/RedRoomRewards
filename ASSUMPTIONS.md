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
