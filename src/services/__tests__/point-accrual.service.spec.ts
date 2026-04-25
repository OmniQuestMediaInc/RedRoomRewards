/**
 * PointAccrualService — calculateEarnRate Tests (C-001)
 *
 * Verifies EarnRateConfig wiring: active config lookup, inferno multiplier
 * application, Diamond Concierge zero-earn enforcement (CEO Decision D3),
 * and error handling for missing config rows.
 */

import { PointAccrualService } from '../point-accrual.service';
import { LedgerService } from '../../ledger/ledger.service';
import { EarnRateConfigModel } from '../../db/models/earn-rate-config.model';

jest.mock('../../ledger/ledger.service');
jest.mock('../../db/models/earn-rate-config.model');

const mockSort = jest.fn();
const mockFindOne = jest.fn(() => ({ sort: mockSort }));
(EarnRateConfigModel.findOne as jest.Mock) = mockFindOne;

describe('PointAccrualService — calculateEarnRate (C-001)', () => {
  let service: PointAccrualService;
  let ledgerService: LedgerService;

  const params = {
    tenantId: 'tenant-abc',
    merchantId: 'merchant-xyz',
    merchantTier: 'GOLD',
    eventClass: 'PURCHASE',
    amount: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    ledgerService = new LedgerService();
    service = new PointAccrualService(ledgerService);
    mockFindOne.mockReturnValue({ sort: mockSort });
  });

  it('returns base_points_per_unit * inferno_multiplier * amount when config is found', async () => {
    mockSort.mockResolvedValue({
      base_points_per_unit: 2,
      inferno_multiplier: 1.5,
      diamond_concierge_zero_earn: true,
    });

    const points = await service.calculateEarnRate(
      params.tenantId,
      params.merchantId,
      params.merchantTier,
      params.eventClass,
      params.amount,
    );

    // 2 * 1.5 * 100 = 300
    expect(points).toBe(300);
  });

  it('queries with correct tenant, merchant, tier, event filters and superseded_at: null', async () => {
    mockSort.mockResolvedValue({
      base_points_per_unit: 1,
      inferno_multiplier: 1,
      diamond_concierge_zero_earn: false,
    });

    await service.calculateEarnRate(
      params.tenantId,
      params.merchantId,
      params.merchantTier,
      params.eventClass,
      10,
    );

    expect(EarnRateConfigModel.findOne).toHaveBeenCalledWith({
      tenant_id: { $eq: params.tenantId },
      merchant_id: { $eq: params.merchantId },
      merchant_tier: { $eq: params.merchantTier },
      event_class: { $eq: params.eventClass },
      superseded_at: null,
    });
    expect(mockSort).toHaveBeenCalledWith({ effective_at: -1 });
  });

  it('throws when no active earn-rate config exists', async () => {
    mockSort.mockResolvedValue(null);

    await expect(
      service.calculateEarnRate(
        params.tenantId,
        params.merchantId,
        'UNKNOWN_TIER',
        params.eventClass,
        100,
      ),
    ).rejects.toThrow(/No active earn-rate config/);
  });

  it('returns 0 for Diamond Concierge purchase when diamond_concierge_zero_earn is true (CEO D3)', async () => {
    mockSort.mockResolvedValue({
      base_points_per_unit: 5,
      inferno_multiplier: 2,
      diamond_concierge_zero_earn: true,
    });

    const points = await service.calculateEarnRate(
      params.tenantId,
      params.merchantId,
      params.merchantTier,
      params.eventClass,
      100,
      true, // isDiamondConcierge
    );

    expect(points).toBe(0);
  });

  it('awards points for Diamond Concierge purchase when diamond_concierge_zero_earn is false', async () => {
    mockSort.mockResolvedValue({
      base_points_per_unit: 3,
      inferno_multiplier: 2,
      diamond_concierge_zero_earn: false,
    });

    const points = await service.calculateEarnRate(
      params.tenantId,
      params.merchantId,
      params.merchantTier,
      params.eventClass,
      50,
      true, // isDiamondConcierge — override active, so points should still be awarded
    );

    // 3 * 2 * 50 = 300
    expect(points).toBe(300);
  });

  it('defaults isDiamondConcierge to false', async () => {
    mockSort.mockResolvedValue({
      base_points_per_unit: 4,
      inferno_multiplier: 1.25,
      diamond_concierge_zero_earn: true,
    });

    // No isDiamondConcierge arg — should NOT return 0
    const points = await service.calculateEarnRate(
      params.tenantId,
      params.merchantId,
      params.merchantTier,
      params.eventClass,
      80,
    );

    // 4 * 1.25 * 80 = 400
    expect(points).toBe(400);
  });
});
