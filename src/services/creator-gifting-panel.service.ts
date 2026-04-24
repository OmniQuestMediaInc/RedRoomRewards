import { Injectable } from '@nestjs/common';
import { CreatorGiftingPanelState } from '../interfaces/redroom-rewards';

@Injectable()
export class CreatorGiftingPanelService {
  async getPanelState(_creatorId: string): Promise<CreatorGiftingPanelState> {
    // Real balance from ledger in production
    return {
      promotionalBalance: 12450,
      recentPromotions: [
        { title: 'Lovense 222 vibe', pointsAwarded: 222, redeemedCount: 8 },
        { title: '15-min private', pointsAwarded: 1500, redeemedCount: 3 },
      ],
    };
  }
}
