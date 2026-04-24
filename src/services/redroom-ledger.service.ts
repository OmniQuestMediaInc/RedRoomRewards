import { Injectable } from '@nestjs/common';
import { GateGuardAVService } from './gateguard-av.service';
import { WelfareGuardianScoreService } from './welfare-guardian-score.service';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class RedRoomLedgerService {
  constructor(
    private readonly ledger: LedgerService,
    private readonly av: GateGuardAVService,
    private readonly wgs: WelfareGuardianScoreService,
  ) {}

  async awardPointsWithCompliance(
    guestId: string,
    points: number,
    reason: string,
  ): Promise<boolean> {
    // MANDATORY 18+ AV
    const avResult = await this.av.verifyAccount(guestId);
    if (!avResult.verified) {
      throw new Error('18+ verification required - blocked');
    }

    // WGS scoring for any award > 1000 points
    if (points > 1000) {
      const wgsResult = await this.wgs.scoreTransaction({
        transactionId: `rr-${Date.now()}`,
        guestId,
        amountCzt: points,
        context: { reason, source: 'RedRoomRewards' },
      });

      if (wgsResult.action === 'HARD_DECLINE') {
        throw new Error('Transaction blocked by Welfare Guardian Score');
      }
    }

    // Award to Promotional Bonus bucket (Canonical Corpus)
    return this.ledger.creditPoints(guestId, points, 'REDROOM_REWARDS', reason);
  }
}
