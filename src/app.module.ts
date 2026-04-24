import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { MerchantModule } from './merchant/merchant.module';
import { BurnModule } from './burn/burn.module';
import { ReportingModule } from './reporting/reporting.module';
import { WhiteLabelModule } from './white-label/white-label.module';
import { CreatorGiftingPanelModule } from './creator-gifting-panel/creator-gifting-panel.module';
import { RedRoomLedgerModule } from './redroom-ledger/redroom-ledger.module';

@Module({
  imports: [
    MemberModule,
    MerchantModule,
    BurnModule,
    ReportingModule,
    WhiteLabelModule,
    CreatorGiftingPanelModule,
    RedRoomLedgerModule,
  ],
})
export class AppModule {}
