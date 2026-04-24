import { Injectable } from '@nestjs/common';
import { GateGuardAVService } from './gateguard-av.service';
import { RedRoomLedgerService } from './redroom-ledger.service';
import { TierEngineService } from './tier-engine.service';
import { MemberSignupRequest, MemberProfile } from '../interfaces/redroom-rewards';

@Injectable()
export class MemberService {
  constructor(
    private readonly avService: GateGuardAVService,
    private readonly ledgerService: RedRoomLedgerService,
    private readonly tierService: TierEngineService,
  ) {}

  async signup(request: MemberSignupRequest): Promise<MemberProfile> {
    // MANDATORY GateGuard AV
    const avResult = await this.avService.verifyAccount(request.email);
    if (!avResult.verified) {
      throw new Error('18+ verification required - account creation blocked');
    }

    const memberId = `rr-${Date.now()}`;

    // Initial promotional points welcome bonus
    await this.ledgerService.awardPointsWithCompliance(memberId, 1000, 'WELCOME_BONUS');

    const tier = this.tierService.calculateTier(1000);

    return {
      memberId,
      tier: tier.currentTier,
      totalPoints: 1000,
      promotionalBalance: 1000,
      verifiedAt: avResult.verifiedAt,
    };
  }
}
