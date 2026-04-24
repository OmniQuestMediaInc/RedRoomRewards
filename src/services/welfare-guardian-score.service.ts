import { Injectable } from '@nestjs/common';
import { WgsScoreRequest, WgsScoreResponse } from '../interfaces/redroom-rewards';

@Injectable()
export class WelfareGuardianScoreService {
  async scoreTransaction(req: WgsScoreRequest): Promise<WgsScoreResponse> {
    console.log(
      `[WGS] Scoring RedRoom Rewards transaction ${req.transactionId} for ${req.guestId}`,
    );

    // Prototype stub — real hybrid rule + ML model from WO-006 in production
    return {
      fraudRisk: 15,
      welfareRisk: 22,
      welfareTier: 'LOW',
      action: 'PASS',
    };
  }
}
