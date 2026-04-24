import { Test } from '@nestjs/testing';
import { CreatorGiftingService } from './creator-gifting.service';
import { LedgerService } from '../ledger/ledger.service';
import { GateGuardAVService } from './gateguard-av.service';

describe('CreatorGiftingService', () => {
  let service: CreatorGiftingService;
  let ledgerService: jest.Mocked<LedgerService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CreatorGiftingService,
        {
          provide: LedgerService,
          useValue: { createGiftingPromotion: jest.fn().mockResolvedValue(true) },
        },
        {
          provide: GateGuardAVService,
          useValue: { verifyAccount: jest.fn() },
        },
      ],
    }).compile();
    service = module.get(CreatorGiftingService);
    ledgerService = module.get(LedgerService);
  });

  it('should create a gifting promotion', async () => {
    const promo = {
      creatorId: 'c1',
      title: 'Lovense 222',
      pointsAwarded: 222,
      condition: 'vibe 222',
    };
    const result = await service.createPromotion('c1', promo);
    expect(result).toBe(true);
    expect(ledgerService.createGiftingPromotion).toHaveBeenCalled();
  });
});
