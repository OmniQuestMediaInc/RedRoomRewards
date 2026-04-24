import { Controller, Post, Body, Req } from '@nestjs/common';
import { AwardingWalletService } from '../services/awarding-wallet.service';
import { AwardingWalletUploadRow } from '../interfaces/redroom-rewards';

@Controller('merchants')
export class MerchantController {
  constructor(private readonly awardingWalletService: AwardingWalletService) {}

  @Post('awarding-wallet/upload-csv')
  async uploadAwardingWallet(
    @Body() body: { rows: AwardingWalletUploadRow[] },
    @Req() req: { user?: { merchantId?: string } },
  ) {
    const merchantId = req.user?.merchantId || 'system';
    return this.awardingWalletService.uploadCSV(body.rows, merchantId);
  }
}
