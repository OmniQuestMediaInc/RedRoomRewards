import { Injectable } from '@nestjs/common';
import { CreatorGiftingPromotion } from '../interfaces/redroom-rewards';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class CreatorGiftingService {
  constructor(private readonly ledgerService: LedgerService) {}

  async createPromotion(creatorId: string, promotion: CreatorGiftingPromotion): Promise<boolean> {
    // Creator must have promotional points balance (checked in ledger)
    // Recipients must pass mandatory GateGuard AV (enforced at redemption)
    const success = await this.ledgerService.createGiftingPromotion(
      creatorId,
      promotion.pointsAwarded,
      promotion.title,
      promotion.condition,
      promotion.maxRecipients,
      promotion.expiryDays,
    );

    return success;
  }
}
