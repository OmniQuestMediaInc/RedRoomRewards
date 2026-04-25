/**
 * CrossMerchantExchangeService — unit tests
 *
 * Verifies exchange-rate lookup against the MerchantPairConfig model,
 * including the CEO Decision B4 (1:1) fallback.
 */

import { CrossMerchantExchangeService } from './cross-merchant-exchange.service';
import { MerchantPairConfigModel } from '../db/models/merchant-pair-config.model';

jest.mock('../db/models/merchant-pair-config.model', () => ({
  ...jest.requireActual('../db/models/merchant-pair-config.model'),
  MerchantPairConfigModel: { findOne: jest.fn() },
}));

const TENANT = 't-001';
const FROM = 'mer-rrp-001';
const TO = 'mer-cyrano-001';

describe('CrossMerchantExchangeService', () => {
  let service: CrossMerchantExchangeService;
  let findOneMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CrossMerchantExchangeService();
    findOneMock = MerchantPairConfigModel.findOne as jest.Mock;
    findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
  });

  describe('getExchangeRate', () => {
    it('returns the configured exchange_rate when an active row exists', async () => {
      findOneMock.mockReturnValue({
        lean: jest.fn().mockResolvedValue({ exchange_rate: 1.25 }),
      });

      const rate = await service.getExchangeRate(TENANT, FROM, TO);

      expect(rate).toBe(1.25);
      expect(findOneMock).toHaveBeenCalledWith(
        expect.objectContaining({
          tenant_id: TENANT,
          from_merchant_id: FROM,
          to_merchant_id: TO,
          superseded_at: null,
        }),
      );
    });

    it('returns 1.0 (CEO Decision B4 default) when no active row is found', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const rate = await service.getExchangeRate(TENANT, FROM, TO);

      expect(rate).toBe(1.0);
    });

    it('queries with effective_at <= now filter', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
      const before = new Date();

      await service.getExchangeRate(TENANT, FROM, TO);

      const after = new Date();
      const queryArg = findOneMock.mock.calls[0][0];
      const queriedDate: Date = queryArg.effective_at.$lte;
      expect(queriedDate.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(queriedDate.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('passes superseded_at: null to target only active rows', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      await service.getExchangeRate(TENANT, FROM, TO);

      expect(findOneMock).toHaveBeenCalledWith(expect.objectContaining({ superseded_at: null }));
    });

    it('returns 1.0 as the 1:1 default for same-merchant lookup (B4)', async () => {
      findOneMock.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

      const rate = await service.getExchangeRate(TENANT, FROM, FROM);

      expect(rate).toBe(1.0);
    });
  });
});
