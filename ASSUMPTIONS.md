- AwardingWalletService integrates with existing LedgerService (awardPromotionalPoints method added via small patch in this payload)
- GateGuard AV is stubbed for prototype phase (real integration in next payload)
- CSV parsing and validation assumed to be handled in controller or a future middleware layer
- All points awarded go into the Promotional Bonus bucket per Canonical Corpus
- Member signup now enforces mandatory GateGuard AV as brand standard
- All points awarded via RedRoomLedgerService (Promotional Bonus bucket)
- Merchant endpoints use existing auth context from req.user
- RedRoomLedgerService and TierEngineService introduced as prototype stubs; full
  LedgerService delegation + tenant-scoped tier thresholds follow in a later payload
