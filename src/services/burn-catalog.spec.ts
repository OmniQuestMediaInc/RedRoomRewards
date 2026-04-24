import { Test } from '@nestjs/testing';
import { BurnCatalogService } from './burn-catalog.service';
import { RedRoomLedgerService } from './redroom-ledger.service';

describe('BurnCatalogService', () => {
  let service: BurnCatalogService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BurnCatalogService,
        {
          provide: RedRoomLedgerService,
          useValue: { awardPointsWithCompliance: jest.fn().mockResolvedValue(true) },
        },
      ],
    }).compile();
    service = module.get(BurnCatalogService);
  });

  it('exists', () => {
    expect(service).toBeDefined();
  });
});
