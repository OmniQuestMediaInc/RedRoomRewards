import { Module } from '@nestjs/common';
import { MemberController } from '../controllers/member.controller';
import { MemberService } from '../services/member.service';
import { GateGuardAVService } from '../services/gateguard-av.service';
import { RedRoomLedgerService } from '../services/redroom-ledger.service';
import { TierEngineService } from '../services/tier-engine.service';
import { WelfareGuardianScoreService } from '../services/welfare-guardian-score.service';
import { LedgerService } from '../ledger/ledger.service';

@Module({
  controllers: [MemberController],
  providers: [
    MemberService,
    GateGuardAVService,
    RedRoomLedgerService,
    TierEngineService,
    WelfareGuardianScoreService,
    { provide: LedgerService, useFactory: () => new LedgerService() },
  ],
})
export class MemberModule {}
