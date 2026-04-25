import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MemberModule } from './member/member.module';
import { MerchantModule } from './merchant/merchant.module';
import { BurnModule } from './burn/burn.module';
import { ReportingModule } from './reporting/reporting.module';
import { WhiteLabelModule } from './white-label/white-label.module';
import { CreatorGiftingPanelModule } from './creator-gifting-panel/creator-gifting-panel.module';
import { RedRoomLedgerModule } from './redroom-ledger/redroom-ledger.module';
import { WalletModule } from './wallets/wallet.module';
import { HealthController } from './health/health.controller';
import productionConfig from './config/production.config';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [productionConfig, appConfig] }),
    MemberModule,
    MerchantModule,
    BurnModule,
    ReportingModule,
    WhiteLabelModule,
    CreatorGiftingPanelModule,
    RedRoomLedgerModule,
    WalletModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
