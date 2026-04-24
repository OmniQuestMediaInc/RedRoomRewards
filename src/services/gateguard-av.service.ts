import { Injectable } from '@nestjs/common';
import { GateGuardAVResult } from '../interfaces/redroom-rewards';

@Injectable()
export class GateGuardAVService {
  async verifyAccount(guestId: string, billingAddress?: any): Promise<GateGuardAVResult> {
    // STUB: Real GateGuard Sentinel™ AV call in production
    console.log(`[GateGuardAV] Verifying ${guestId} — MANDATORY 18+ CHECK`);
    return {
      verified: true,
      verifiedAt: new Date(),
      method: 'GATEGUARD',
      confidenceScore: 98,
    };
  }
}
