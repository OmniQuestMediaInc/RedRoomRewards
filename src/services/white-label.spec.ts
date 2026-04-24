import { Test } from '@nestjs/testing';
import { WhiteLabelService } from './white-label.service';

describe('WhiteLabelService (WO-013)', () => {
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

  it('returns a sensible default config for unknown merchant', async () => {
    const config = await service.getConfig('unknown-merchant');
    expect(config.merchantId).toBe('unknown-merchant');
    expect(config.brandName).toBe('Default Merchant');
    expect(config.serviceBureauMode).toBe(true);
  });

  it('rejects config with missing merchantId', async () => {
    await expect(
      service.saveConfig({
        merchantId: '',
        brandName: 'X',
        primaryColor: '#000',
        serviceBureauMode: true,
      }),
    ).rejects.toThrow('merchantId is required');
  });

  it('rejects config with missing brandName', async () => {
    await expect(
      service.saveConfig({
        merchantId: 'm1',
        brandName: '',
        primaryColor: '#000',
        serviceBureauMode: true,
      }),
    ).rejects.toThrow('brandName is required');
  });

  it('rejects config with invalid primaryColor', async () => {
    await expect(
      service.saveConfig({
        merchantId: 'm1',
        brandName: 'Club',
        primaryColor: 'red',
        serviceBureauMode: true,
      }),
    ).rejects.toThrow('primaryColor must be a valid hex colour');
  });

  it('accepts 3-digit hex colours', async () => {
    await expect(
      service.saveConfig({
        merchantId: 'm2',
        brandName: 'Club',
        primaryColor: '#f0c',
        serviceBureauMode: false,
      }),
    ).resolves.not.toThrow();
  });
});
