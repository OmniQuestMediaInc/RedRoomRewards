import { Module } from '@nestjs/common';
import { BurnController } from '../controllers/burn.controller';
import { BurnCatalogService } from '../services/burn-catalog.service';
import { RedRoomLedgerService } from '../services/redroom-ledger.service';
import { GateGuardAVService } from '../services/gateguard-av.service';
import { WelfareGuardianScoreService } from '../services/welfare-guardian-score.service';
import { LedgerService } from '../ledger/ledger.service';

@Module({
  controllers: [BurnController],
  providers: [
    BurnCatalogService,
    RedRoomLedgerService,
    GateGuardAVService,
    WelfareGuardianScoreService,
    { provide: LedgerService, useFactory: () => new LedgerService() },
  ],
})
export class BurnModule {}
