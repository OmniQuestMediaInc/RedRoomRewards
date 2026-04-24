import { Injectable } from '@nestjs/common';
import { AwardingWalletUploadRow, AwardingWalletUploadResult } from '../interfaces/redroom-rewards';
import { LedgerService } from '../ledger/ledger.service'; // existing repo service

@Injectable()
export class AwardingWalletService {
  constructor(private readonly ledgerService: LedgerService) {}

  async uploadCSV(rows: AwardingWalletUploadRow[], merchantId: string): Promise<AwardingWalletUploadResult> {
    const result: AwardingWalletUploadResult = { successCount: 0, failedCount: 0, errors: [] };

    for (let i = 0; i < rows.length; i++) {
      try {
        // Enforce Promotional Bonus bucket (Canonical Corpus)
        await this.ledgerService.awardPromotionalPoints(
          rows[i].creatorId,
          rows[i].points,
          `MERCHANT_AWARD_${merchantId}`,
          rows[i].reason,
          rows[i].expiryDays
        );
        result.successCount++;
      } catch (e) {
        result.failedCount++;
        result.errors.push({ row: i + 1, error: e.message });
      }
    }
    return result;
  }
}
