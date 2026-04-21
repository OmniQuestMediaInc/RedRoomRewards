/**
 * Comprehensive Point Expiration Service Tests
 *
 * Tests point expiration logic, batch processing, and edge cases against
 * the actual PointExpirationService API.
 */

import { PointExpirationService } from '../point-expiration.service';
import { TransactionType, TransactionReason } from '../../wallets/types';

const mockLedgerService = {
  checkIdempotency: jest.fn(),
  claimIdempotency: jest.fn(),
  createEntry: jest.fn(),
  queryEntries: jest.fn(),
  getBalanceSnapshot: jest.fn(),
  getEntry: jest.fn(),
  generateReconciliationReport: jest.fn(),
  getAuditTrail: jest.fn(),
  storeIdempotencyResult: jest.fn(),
};

jest.mock('../../db/models/wallet.model', () => ({
  WalletModel: {
    findOne: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockWalletModel = require('../../db/models/wallet.model').WalletModel as {
  findOne: jest.Mock;
  find: jest.Mock;
  findOneAndUpdate: jest.Mock;
};

function emptyLedgerResult() {
  return { entries: [], totalCount: 0, offset: 0, limit: 100, hasMore: false };
}

describe('PointExpirationService - Comprehensive Tests', () => {
  let expirationService: PointExpirationService;

  beforeEach(() => {
    jest.clearAllMocks();
    expirationService = new PointExpirationService(mockLedgerService as any); // eslint-disable-line @typescript-eslint/no-explicit-any
  });

  describe('processUserExpiration', () => {
    it('should expire points for a single user', async () => {
      const userId = 'user-123';
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);

      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'entry-1',
            accountId: userId,
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            timestamp: new Date('2025-01-01'),
            metadata: { expiresAt: past },
          },
          {
            entryId: 'entry-2',
            accountId: userId,
            amount: 50,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            timestamp: new Date('2025-02-01'),
            metadata: { expiresAt: past },
          },
        ],
        totalCount: 2,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      mockWalletModel.findOne.mockResolvedValue({
        userId,
        availableBalance: 150,
        escrowBalance: 0,
        version: 5,
      });
      mockWalletModel.findOneAndUpdate.mockResolvedValue({
        userId,
        availableBalance: 0,
        escrowBalance: 0,
        version: 6,
      });

      mockLedgerService.createEntry.mockResolvedValue({ entryId: 'expiration-entry' });

      const result = await expirationService.processUserExpiration(userId, 'req-1');

      expect(result).not.toBeNull();
      expect(result!.amountExpired).toBe(150);
      expect(mockLedgerService.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.DEBIT,
          amount: -150,
          reason: TransactionReason.POINT_EXPIRY,
        })
      );
    });

    it('should return null for users with no expired points', async () => {
      mockLedgerService.queryEntries.mockResolvedValue(emptyLedgerResult());

      const result = await expirationService.processUserExpiration('user-no-expired', 'req-2');

      expect(result).toBeNull();
      expect(mockLedgerService.createEntry).not.toHaveBeenCalled();
    });

    it('should respect grace period', async () => {
      // Expiration was 1 day ago but grace period is 3 days - should NOT expire yet.
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);

      expirationService = new PointExpirationService(mockLedgerService as any, { // eslint-disable-line @typescript-eslint/no-explicit-any
        gracePeriodDays: 3,
      });

      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'entry-1',
            accountId: 'user-123',
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: oneDayAgo },
          },
        ],
        totalCount: 1,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      const result = await expirationService.processUserExpiration('user-123', 'req-grace');

      expect(result).toBeNull();
      expect(mockLedgerService.createEntry).not.toHaveBeenCalled();
    });

    it('should create deterministic idempotency key based on userId + date', async () => {
      const userId = 'user-123';
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);

      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'entry-1',
            accountId: userId,
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: past },
          },
        ],
        totalCount: 1,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      mockWalletModel.findOne.mockResolvedValue({
        userId,
        availableBalance: 100,
        version: 1,
      });
      mockWalletModel.findOneAndUpdate.mockResolvedValue({
        userId,
        availableBalance: 0,
        version: 2,
      });
      mockLedgerService.createEntry.mockResolvedValue({ entryId: 'exp-entry' });

      await expirationService.processUserExpiration(userId, 'req-idem');

      expect(mockLedgerService.createEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          idempotencyKey: expect.stringContaining(userId),
        })
      );
    });

    it('should cap expiration at available balance (no negative balances)', async () => {
      const userId = 'user-123';
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Ledger says 100 should expire, but wallet only has 50 available.
      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'e1',
            accountId: userId,
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: past },
          },
        ],
        totalCount: 1,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      mockWalletModel.findOne.mockResolvedValue({
        userId,
        availableBalance: 50,
        version: 2,
      });
      mockWalletModel.findOneAndUpdate.mockResolvedValue({
        userId,
        availableBalance: 0,
        version: 3,
      });
      mockLedgerService.createEntry.mockResolvedValue({ entryId: 'exp-entry' });

      const result = await expirationService.processUserExpiration(userId, 'req-cap');

      expect(result).not.toBeNull();
      expect(result!.amountExpired).toBe(50);
    });
  });

  describe('processBatchExpiration', () => {
    it('should process multiple users and aggregate results', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];
      const amounts: Record<string, number> = { 'user-1': 100, 'user-2': 50, 'user-3': 200 };

      jest.spyOn(expirationService, 'processUserExpiration').mockImplementation(
        async (userId: string) => ({
          userId,
          amountExpired: amounts[userId],
          transactionId: `txn-${userId}`,
          timestamp: new Date(),
        })
      );

      const result = await expirationService.processBatchExpiration(userIds, 'req-batch');

      expect(result.usersProcessed).toBe(3);
      expect(result.totalPointsExpired).toBe(350);
      expect(result.successCount).toBe(3);
      expect(result.failureCount).toBe(0);
    });

    it('should capture partial batch failures', async () => {
      const userIds = ['user-1', 'user-2', 'user-3'];

      jest.spyOn(expirationService, 'processUserExpiration').mockImplementation(
        async (userId: string) => {
          if (userId === 'user-2') throw new Error('Database error');
          return {
            userId,
            amountExpired: 100,
            transactionId: `txn-${userId}`,
            timestamp: new Date(),
          };
        }
      );

      const result = await expirationService.processBatchExpiration(userIds, 'req-partial');

      expect(result.usersProcessed).toBe(2);
      expect(result.successCount).toBe(2);
      expect(result.failureCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors![0].userId).toBe('user-2');
    });

    it('should not double-count users with no expired points', async () => {
      const userIds = ['user-1', 'user-2'];

      jest.spyOn(expirationService, 'processUserExpiration').mockResolvedValue(null);

      const result = await expirationService.processBatchExpiration(userIds, 'req-empty');

      expect(result.usersProcessed).toBe(2);
      expect(result.successCount).toBe(0);
      expect(result.totalPointsExpired).toBe(0);
    });
  });

  describe('getUsersWithExpiringPoints', () => {
    it('should return users with points expiring inside the warning window', async () => {
      const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const fiveDays = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);

      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'e1',
            accountId: 'user-1',
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: fiveDays },
          },
          {
            entryId: 'e2',
            accountId: 'user-2',
            amount: 50,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: threeDays },
          },
        ],
        totalCount: 2,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      const result = await expirationService.getUsersWithExpiringPoints();

      expect(result).toHaveLength(2);
      const user1 = result.find(u => u.userId === 'user-1');
      const user2 = result.find(u => u.userId === 'user-2');
      expect(user1?.amountExpiring).toBe(100);
      expect(user2?.amountExpiring).toBe(50);
    });

    it('should ignore users with no expiring metadata', async () => {
      mockLedgerService.queryEntries.mockResolvedValue(emptyLedgerResult());

      const result = await expirationService.getUsersWithExpiringPoints();

      expect(result).toHaveLength(0);
    });

    it('should ignore entries past the warning horizon', async () => {
      const farFuture = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'e1',
            accountId: 'user-1',
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: farFuture },
          },
        ],
        totalCount: 1,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      const result = await expirationService.getUsersWithExpiringPoints();

      expect(result).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle mixed expired and unexpired entries', async () => {
      const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const future = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      mockLedgerService.queryEntries.mockResolvedValue({
        entries: [
          {
            entryId: 'entry-expired',
            accountId: 'user-123',
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: past },
          },
          {
            entryId: 'entry-valid',
            accountId: 'user-123',
            amount: 100,
            type: TransactionType.CREDIT,
            balanceState: 'available',
            metadata: { expiresAt: future },
          },
        ],
        totalCount: 2,
        offset: 0,
        limit: 100,
        hasMore: false,
      });

      mockWalletModel.findOne.mockResolvedValue({
        userId: 'user-123',
        availableBalance: 200,
        version: 1,
      });
      mockWalletModel.findOneAndUpdate.mockResolvedValue({
        userId: 'user-123',
        availableBalance: 100,
        version: 2,
      });
      mockLedgerService.createEntry.mockResolvedValue({ entryId: 'exp-entry' });

      const result = await expirationService.processUserExpiration('user-123', 'req-mixed');

      expect(result).not.toBeNull();
      expect(result!.amountExpired).toBe(100);
    });
  });
});
