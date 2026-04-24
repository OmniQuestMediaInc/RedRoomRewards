import { Module } from '@nestjs/common';
import { RedRoomLedgerService } from '../services/redroom-ledger.service';
import { GateGuardAVService } from '../services/gateguard-av.service';
import { WelfareGuardianScoreService } from '../services/welfare-guardian-score.service';
import { LedgerService } from '../ledger/ledger.service';

@Module({
  providers: [
    RedRoomLedgerService,
    GateGuardAVService,
    WelfareGuardianScoreService,
    { provide: LedgerService, useFactory: () => new LedgerService() },
  ],
  exports: [RedRoomLedgerService],
})
export class RedRoomLedgerModule {}
