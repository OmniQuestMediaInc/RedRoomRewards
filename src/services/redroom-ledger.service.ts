import { Injectable } from '@nestjs/common';

/**
 * RedRoomLedgerService
 *
 * Canonical-Corpus wrapper around the core LedgerService that applies
 * Red Room Rewards compliance checks (Promotional Bonus bucket,
 * expiry, GateGuard linkage) to every point award.
 *
 * Prototype stub — full wiring to LedgerService.awardPromotionalPoints
 * follows in a later payload.
 */
@Injectable()
export class RedRoomLedgerService {
  async awardPointsWithCompliance(
    memberId: string,
    points: number,
    source: string,
  ): Promise<boolean> {
    // STUB: real implementation will delegate to LedgerService and enforce
    // promotional-bucket rules + compliance/audit metadata.
    console.log(
      `[RedRoomLedger] Awarded ${points} promotional points to ${memberId} (source=${source})`,
    );
    return true;
  }
}
