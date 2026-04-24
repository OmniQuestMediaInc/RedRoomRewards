import { Test, TestingModule } from '@nestjs/testing';
import { AwardingWalletService } from './awarding-wallet.service';
import { LedgerService } from '../ledger/ledger.service';

describe('AwardingWalletService', () => {
  let service: AwardingWalletService;
  let ledgerService: jest.Mocked<LedgerService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AwardingWalletService,
        {
          provide: LedgerService,
          useValue: {
            awardPromotionalPoints: jest.fn().mockResolvedValue(true),
          },
        },
      ],
    }).compile();

    service = module.get<AwardingWalletService>(AwardingWalletService);
    ledgerService = module.get(LedgerService);
  });

  it('should successfully process CSV upload and award promotional points', async () => {
    const rows = [{ creatorId: 'creator-1', points: 5000, reason: 'test award' }];
    const result = await service.uploadCSV(rows, 'merchant-1');

    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(0);
    expect(ledgerService.awardPromotionalPoints).toHaveBeenCalledWith(
      'creator-1',
      5000,
      'MERCHANT_AWARD_merchant-1',
      'test award',
      undefined,
    );
  });

  it('should handle partial failures gracefully', async () => {
    const rows = [
      { creatorId: 'creator-1', points: 5000, reason: 'good' },
      { creatorId: 'creator-2', points: 1000, reason: 'bad' },
    ];
    ledgerService.awardPromotionalPoints.mockRejectedValueOnce(new Error('fail'));

    const result = await service.uploadCSV(rows, 'merchant-1');

    expect(result.successCount).toBe(1);
    expect(result.failedCount).toBe(1);
    expect(result.errors.length).toBe(1);
  });
});
