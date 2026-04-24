/**
 * Unit tests for LedgerService.creditPoints and LedgerService.deductPoints
 *
 * These convenience methods wrap createEntry for promotional credit/debit
 * operations. Full transactional balance safety is deferred to B-006.
 */

import { LedgerService } from '../ledger.service';
import { LedgerEntryModel } from '../../db/models/ledger-entry.model';

jest.mock('../../db/models/ledger-entry.model');
jest.mock('../../db/models/idempotency.model');

describe('LedgerService - creditPoints / deductPoints', () => {
  let service: LedgerService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new LedgerService();

    // getBalanceSnapshot uses LedgerEntryModel.find under the hood
    (LedgerEntryModel.find as jest.Mock).mockReturnValue({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    (LedgerEntryModel.create as jest.Mock).mockImplementation((doc: unknown) => {
      const d = doc as Record<string, unknown>;
      return Promise.resolve({
        entryId: 'entry-test',
        transactionId: 'txn-test',
        ...d,
        timestamp: new Date(),
        currency: 'points',
      });
    });
  });

  describe('creditPoints', () => {
    it('returns true on successful credit', async () => {
      const result = await service.creditPoints('user-1', 500, 'TEST_SOURCE', 'signup bonus');
      expect(result).toBe(true);
    });

    it('writes a credit ledger entry with correct type and balance state', async () => {
      await service.creditPoints('user-2', 250, 'PROMO', 'promo award');

      expect(LedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'user-2',
          accountType: 'user',
          type: 'credit',
          amount: 250,
          balanceState: 'available',
          correlationId: 'PROMO',
        }),
      );
    });

    it('stores reason and source in metadata', async () => {
      await service.creditPoints('user-3', 100, 'API', 'referral reward');

      expect(LedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { reason: 'referral reward', source: 'API' },
        }),
      );
    });

    it('generates unique idempotency keys per call', async () => {
      await service.creditPoints('user-4', 50, 'SRC', 'a');
      await service.creditPoints('user-4', 50, 'SRC', 'b');

      const calls = (LedgerEntryModel.create as jest.Mock).mock.calls;
      const key1 = (calls[0][0] as Record<string, unknown>).idempotencyKey as string;
      const key2 = (calls[1][0] as Record<string, unknown>).idempotencyKey as string;
      expect(key1).not.toBe(key2);
    });

    it('sets balanceAfter = balanceBefore + amount (zero starting balance)', async () => {
      // getBalanceSnapshot returns availableBalance: 0 when no entries exist
      await service.creditPoints('user-5', 300, 'SRC', 'reason');

      expect(LedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          balanceBefore: 0,
          balanceAfter: 300,
        }),
      );
    });
  });

  describe('deductPoints', () => {
    it('returns true on successful deduction', async () => {
      const result = await service.deductPoints('user-6', 100, 'TEST_SOURCE', 'spend');
      expect(result).toBe(true);
    });

    it('writes a debit ledger entry with correct type and negated amount', async () => {
      await service.deductPoints('user-7', 200, 'BURN', 'redemption');

      expect(LedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: 'user-7',
          accountType: 'user',
          type: 'debit',
          amount: -200,
          balanceState: 'available',
          correlationId: 'BURN',
        }),
      );
    });

    it('stores reason and source in metadata', async () => {
      await service.deductPoints('user-8', 50, 'API', 'point burn');

      expect(LedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: { reason: 'point burn', source: 'API' },
        }),
      );
    });

    it('sets balanceAfter = balanceBefore - amount (zero starting balance)', async () => {
      await service.deductPoints('user-9', 75, 'SRC', 'reason');

      expect(LedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          balanceBefore: 0,
          balanceAfter: -75,
        }),
      );
    });
  });

  describe('awardPromotionalPoints (backward-compatible delegate)', () => {
    it('delegates to creditPoints and returns true', async () => {
      const creditSpy = jest.spyOn(service, 'creditPoints').mockResolvedValue(true);

      const result = await service.awardPromotionalPoints('creator-1', 1000, 'SRC', 'award');

      expect(result).toBe(true);
      expect(creditSpy).toHaveBeenCalledWith('creator-1', 1000, 'SRC', 'award');
    });
  });
});
