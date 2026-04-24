import { Test } from '@nestjs/testing';
import { TierEngineService } from './tier-engine.service';

describe('TierEngineService', () => {
  let service: TierEngineService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TierEngineService],
    }).compile();
    service = module.get(TierEngineService);
  });

  it('should calculate correct tier and vibe', () => {
    const result = service.calculateTier(30000);
    expect(result.currentTier).toBe('RED_OBSESSION');
    expect(result.vibeDescription).toBe('Deep craving, committed');
  });
});
