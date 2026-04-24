import { Test } from '@nestjs/testing';
import { WhiteLabelService } from './white-label.service';

describe('WhiteLabelService', () => {
  let service: WhiteLabelService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({ providers: [WhiteLabelService] }).compile();
    service = module.get(WhiteLabelService);
  });

  it('should save and retrieve white-label config', async () => {
    const config = {
      merchantId: 'm1',
      brandName: 'Test Club',
      primaryColor: '#ff0000',
      serviceBureauMode: true,
    };
    await service.saveConfig(config);
    const retrieved = await service.getConfig('m1');
    expect(retrieved.brandName).toBe('Test Club');
  });
});
