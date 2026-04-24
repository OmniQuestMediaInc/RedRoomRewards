import { Injectable } from '@nestjs/common';
import { RedRoomLedgerService } from './redroom-ledger.service';
import { BurnRedemption } from '../interfaces/redroom-rewards';

@Injectable()
export class BurnCatalogService {
  constructor(private readonly ledger: RedRoomLedgerService) {}

  async redeemPoints(redemption: BurnRedemption): Promise<boolean> {
    // Burn from Promotional Bonus bucket
    return this.ledger.awardPointsWithCompliance(
      redemption.memberId,
      -redemption.pointsSpent, // negative = burn
      `BURN_${redemption.itemId}_${redemption.reason}`,
    );
  }
}
