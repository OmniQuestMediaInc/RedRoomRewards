import { Injectable } from '@nestjs/common';
import { CreatorGiftingPanelState } from '../interfaces/redroom-rewards';

@Injectable()
export class CreatorGiftingPanelService {
  async getPanelState(_creatorId: string): Promise<CreatorGiftingPanelState> {
    // Real balance from ledger pending B-001 / B-002 wiring.
    return {
      promotionalBalance: 0,
      recentPromotions: [],
    };
  }
}
