import { Test } from '@nestjs/testing';
import { RedRoomLedgerService } from './redroom-ledger.service';
import { GateGuardAVService } from './gateguard-av.service';
import { WelfareGuardianScoreService } from './welfare-guardian-score.service';
import { LedgerService } from '../ledger/ledger.service';

describe('RedRoomLedgerService', () => {
  let service: RedRoomLedgerService;
  let avService: jest.Mocked<GateGuardAVService>;
  let wgsService: jest.Mocked<WelfareGuardianScoreService>;
  let ledgerService: jest.Mocked<LedgerService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RedRoomLedgerService,
        {
          provide: GateGuardAVService,
          useValue: {
            verifyAccount: jest.fn().mockResolvedValue({ verified: true }),
          },
        },
        {
          provide: WelfareGuardianScoreService,
          useValue: {
            scoreTransaction: jest.fn().mockResolvedValue({ action: 'PASS' }),
          },
        },
        {
          provide: LedgerService,
          useValue: {
            awardPromotionalPoints: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get(RedRoomLedgerService);
    avService = module.get(GateGuardAVService);
    wgsService = module.get(WelfareGuardianScoreService);
    ledgerService = module.get(LedgerService);
  });

  it('enforces mandatory AV and WGS before awarding RedRoom points', async () => {
    const result = await service.awardPointsWithCompliance('guest-1', 5000, 'test-award');
    expect(result).toBe(true);
    expect(avService.verifyAccount).toHaveBeenCalledWith('guest-1');
    expect(wgsService.scoreTransaction).toHaveBeenCalled();
    expect(ledgerService.awardPromotionalPoints).toHaveBeenCalledWith(
      'guest-1',
      5000,
      'REDROOM_REWARDS',
      'test-award',
    );
  });

  it('skips WGS scoring for awards at or below the 1000-point trigger', async () => {
    const result = await service.awardPointsWithCompliance('guest-2', 1000, 'small-award');
    expect(result).toBe(true);
    expect(wgsService.scoreTransaction).not.toHaveBeenCalled();
  });

  it('blocks the award when AV verification fails', async () => {
    avService.verifyAccount.mockResolvedValueOnce({
      verified: false,
      verifiedAt: new Date(),
      method: 'GATEGUARD',
      confidenceScore: 0,
    });

    await expect(
      service.awardPointsWithCompliance('guest-3', 5000, 'blocked-award'),
    ).rejects.toThrow('18+ verification required - blocked');
    expect(ledgerService.awardPromotionalPoints).not.toHaveBeenCalled();
  });

  it('blocks the award when WGS returns HARD_DECLINE', async () => {
    wgsService.scoreTransaction.mockResolvedValueOnce({
      fraudRisk: 95,
      welfareRisk: 90,
      welfareTier: 'CRITICAL',
      action: 'HARD_DECLINE',
    });

    await expect(service.awardPointsWithCompliance('guest-4', 5000, 'risky-award')).rejects.toThrow(
      'Transaction blocked by Welfare Guardian Score',
    );
    expect(ledgerService.awardPromotionalPoints).not.toHaveBeenCalled();
  });
});
