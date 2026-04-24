import { Test } from '@nestjs/testing';
import { BurnCatalogService } from './burn-catalog.service';
import { RedRoomLedgerService } from './redroom-ledger.service';

describe('BurnCatalogService', () => {
  let service: BurnCatalogService;
  let ledgerService: { awardPointsWithCompliance: jest.Mock };

  beforeEach(async () => {
    ledgerService = { awardPointsWithCompliance: jest.fn().mockResolvedValue(true) };
    const module = await Test.createTestingModule({
      providers: [
        BurnCatalogService,
        {
          provide: RedRoomLedgerService,
          useValue: ledgerService,
        },
      ],
    }).compile();
    service = module.get(BurnCatalogService);
  });

  it('exists', () => {
    expect(service).toBeDefined();
  });

  it('redeemPoints should delegate to ledger with negative points', async () => {
    const result = await service.redeemPoints({
      memberId: 'member-1',
      pointsSpent: 500,
      itemId: 'item-42',
      reason: 'PROMO',
    });
    expect(result).toBe(true);
    expect(ledgerService.awardPointsWithCompliance).toHaveBeenCalledWith(
      'member-1',
      -500,
      'BURN_item-42_PROMO',
    );
  });
});
