import { Injectable } from '@nestjs/common';
import { AwardingWalletService } from './awarding-wallet.service';
import { AwardingWalletUploadRow, AwardingWalletUploadResult } from '../interfaces/redroom-rewards';

@Injectable()
export class MerchantService {
  constructor(private readonly awardingWalletService: AwardingWalletService) {}

  // Full merchant dashboard methods will be expanded in next payloads
  async uploadAwardingWallet(
    rows: AwardingWalletUploadRow[],
    merchantId: string,
  ): Promise<AwardingWalletUploadResult> {
    return this.awardingWalletService.uploadCSV(rows, merchantId);
  }
}
