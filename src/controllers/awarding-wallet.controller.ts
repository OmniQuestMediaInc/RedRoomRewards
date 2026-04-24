import { Controller, Post, Body, Req } from '@nestjs/common';
import { AwardingWalletService } from '../services/awarding-wallet.service';
import { AwardingWalletUploadRow } from '../interfaces/redroom-rewards';

@Controller('awarding-wallet')
export class AwardingWalletController {
  constructor(private readonly awardingWalletService: AwardingWalletService) {}

  @Post('upload-csv')
  async uploadCSV(@Body() body: { rows: AwardingWalletUploadRow[] }, @Req() req: any) {
    const merchantId = req.user.merchantId; // from existing auth
    return this.awardingWalletService.uploadCSV(body.rows, merchantId);
  }
}
