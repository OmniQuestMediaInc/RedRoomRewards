import { Module } from '@nestjs/common';
import { MerchantController } from '../controllers/merchant.controller';
import { AwardingWalletService } from '../services/awarding-wallet.service';
import { LedgerService } from '../ledger/ledger.service';

@Module({
  controllers: [MerchantController],
  providers: [
    AwardingWalletService,
    { provide: LedgerService, useFactory: () => new LedgerService() },
  ],
})
export class MerchantModule {}
