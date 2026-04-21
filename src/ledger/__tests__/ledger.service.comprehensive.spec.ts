/**
 * Comprehensive Ledger Service Tests
 *
 * Tests immutability, idempotency, audit trails, and reconciliation against
 * the actual LedgerService API (LedgerEntryModel + IdempotencyRecordModel).
 */

import { LedgerService } from '../ledger.service';
import { TransactionType, TransactionReason } from '../../wallets/types';

// Chainable query mock: supports .sort().skip().limit().lean().exec()
function makeQueryChain(result: unknown) {
  const chain: Record<string, jest.Mock> = {};
  chain.sort = jest.fn(() => chain);
  chain.skip = jest.fn(() => chain);
  chain.limit = jest.fn(() => chain);
  chain.lean = jest.fn(() => chain);
  chain.exec = jest.fn().mockResolvedValue(result);
  return chain;
}

function makeFindOneChain(result: unknown) {
  const chain: Record<string, jest.Mock> = {};
  chain.lean = jest.fn(() => chain);
  chain.exec = jest.fn().mockResolvedValue(result);
  return chain;
}

jest.mock('../../db/models/ledger-entry.model', () => ({
  LedgerEntryModel: {
    create: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

jest.mock('../../db/models/idempotency.model', () => ({
  IdempotencyRecordModel: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockLedgerEntryModel = require('../../db/models/ledger-entry.model').LedgerEntryModel as {
  create: jest.Mock;
  findOne: jest.Mock;
  find: jest.Mock;
  countDocuments: jest.Mock;
};

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockIdempotencyModel = require('../../db/models/idempotency.model').IdempotencyRecordModel as {
  findOne: jest.Mock;
  create: jest.Mock;
};

describe('LedgerService - Comprehensive Tests', () => {
  let ledgerService: LedgerService;

  beforeEach(() => {
    jest.clearAllMocks();
    ledgerService = new LedgerService();
  });

  describe('createEntry', () => {
    it('should create an immutable ledger entry', async () => {
      const entryData = {
        accountId: 'user-123',
        accountType: 'user' as const,
        amount: 100,
        type: TransactionType.CREDIT,
        balanceState: 'available' as const,
        stateTransition: 'available+100',
        reason: TransactionReason.USER_SIGNUP_BONUS,
        idempotencyKey: 'idem-ledger-1',
        requestId: 'req-1',
        balanceBefore: 0,
        balanceAfter: 100,
      };

      mockLedgerEntryModel.create.mockResolvedValue({
        entryId: 'entry-1',
        transactionId: 'tx-1',
        ...entryData,
        timestamp: new Date(),
        currency: 'points',
      });

      const entry = await ledgerService.createEntry(entryData);

      expect(entry.entryId).toBeDefined();
      expect(entry.amount).toBe(100);
      expect(mockLedgerEntryModel.create).toHaveBeenCalled();
    });

    it('should return the existing entry on duplicate idempotencyKey', async () => {
      const duplicateKeyError: Error & { code?: number; keyPattern?: Record<string, unknown> } =
        new Error('Duplicate key');
      duplicateKeyError.code = 11000;
      duplicateKeyError.keyPattern = { idempotencyKey: 1 };

      mockLedgerEntryModel.create.mockRejectedValueOnce(duplicateKeyError);
      mockLedgerEntryModel.findOne.mockReturnValueOnce(
        makeFindOneChain({
          entryId: 'existing-1',
          transactionId: 'tx-existing',
          accountId: 'user-123',
          accountType: 'user',
          amount: 100,
          type: 'credit',
          balanceState: 'available',
          stateTransition: 'available+100',
          reason: TransactionReason.USER_SIGNUP_BONUS,
          idempotencyKey: 'idem-duplicate',
          requestId: 'req-2',
          balanceBefore: 0,
          balanceAfter: 100,
          timestamp: new Date(),
          currency: 'points',
        })
      );

      const entry = await ledgerService.createEntry({
        accountId: 'user-123',
        accountType: 'user',
        amount: 100,
        type: TransactionType.CREDIT,
        balanceState: 'available',
        stateTransition: 'available+100',
        reason: TransactionReason.USER_SIGNUP_BONUS,
        idempotencyKey: 'idem-duplicate',
        requestId: 'req-2',
        balanceBefore: 0,
        balanceAfter: 100,
      });

      expect(entry.entryId).toBe('existing-1');
    });

    it('should rethrow non-duplicate errors', async () => {
      mockLedgerEntryModel.create.mockRejectedValueOnce(new Error('DB unavailable'));

      await expect(
        ledgerService.createEntry({
          accountId: 'user-123',
          accountType: 'user',
          amount: 100,
          type: TransactionType.CREDIT,
          balanceState: 'available',
          stateTransition: 'available+100',
          reason: TransactionReason.USER_SIGNUP_BONUS,
          idempotencyKey: 'idem-error',
          requestId: 'req-err',
          balanceBefore: 0,
          balanceAfter: 100,
        })
      ).rejects.toThrow('DB unavailable');
    });

    it('should preserve metadata in created entry', async () => {
      mockLedgerEntryModel.create.mockResolvedValue({
        entryId: 'entry-audit',
      });

      await ledgerService.createEntry({
        accountId: 'user-123',
        accountType: 'user',
        amount: 100,
        type: TransactionType.CREDIT,
        balanceState: 'available',
        stateTransition: 'available+100',
        reason: TransactionReason.USER_SIGNUP_BONUS,
        idempotencyKey: 'idem-audit',
        requestId: 'req-audit',
        balanceBefore: 0,
        balanceAfter: 100,
        metadata: {
          campaignId: 'campaign-123',
          sourceIp: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        },
      });

      expect(mockLedgerEntryModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            campaignId: 'campaign-123',
            sourceIp: '192.168.1.1',
            userAgent: 'Mozilla/5.0',
          }),
        })
      );
    });
  });

  describe('queryEntries', () => {
    it('should filter by account ID', async () => {
      const mockEntries = [
        { entryId: 'entry-1', accountId: 'user-123', amount: 100, type: 'credit' },
        { entryId: 'entry-2', accountId: 'user-123', amount: -50, type: 'debit' },
      ];

      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain(mockEntries));
      mockLedgerEntryModel.countDocuments.mockResolvedValueOnce(2);

      const result = await ledgerService.queryEntries({ accountId: 'user-123' });

      expect(result.entries).toHaveLength(2);
      expect(mockLedgerEntryModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ accountId: { $eq: 'user-123' } })
      );
    });

    it('should filter by date range', async () => {
      const startDate = new Date('2026-01-01');
      const endDate = new Date('2026-01-31');

      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain([]));
      mockLedgerEntryModel.countDocuments.mockResolvedValueOnce(0);

      await ledgerService.queryEntries({ startDate, endDate });

      expect(mockLedgerEntryModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: { $gte: startDate, $lte: endDate },
        })
      );
    });

    it('should paginate results', async () => {
      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain([]));
      mockLedgerEntryModel.countDocuments.mockResolvedValueOnce(100);

      const result = await ledgerService.queryEntries({ limit: 10, offset: 20 });

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(20);
      expect(result.totalCount).toBe(100);
      expect(result.hasMore).toBe(true);
    });

    it('should filter by transaction type', async () => {
      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain([]));
      mockLedgerEntryModel.countDocuments.mockResolvedValueOnce(0);

      await ledgerService.queryEntries({ type: TransactionType.CREDIT });

      expect(mockLedgerEntryModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ type: { $eq: TransactionType.CREDIT } })
      );
    });
  });

  describe('getBalanceSnapshot', () => {
    it('should project balances from ledger entries by state', async () => {
      const entries = [
        { balanceState: 'available', balanceAfter: 100, timestamp: new Date('2026-01-10') },
        { balanceState: 'available', balanceAfter: 70, timestamp: new Date('2026-01-12') },
        { balanceState: 'escrow', balanceAfter: 30, timestamp: new Date('2026-01-12') },
      ];

      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain(entries));

      const snapshot = await ledgerService.getBalanceSnapshot('user-123', 'user');

      expect(snapshot.availableBalance).toBe(70);
      expect(snapshot.escrowBalance).toBe(30);
    });

    it('should support point-in-time queries with asOf filter', async () => {
      const asOf = new Date('2026-01-15');
      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain([]));

      await ledgerService.getBalanceSnapshot('user-123', 'user', asOf);

      expect(mockLedgerEntryModel.find).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: { $lte: asOf },
        })
      );
    });

    it('should return earnedBalance for model accounts', async () => {
      const entries = [
        { balanceState: 'earned', balanceAfter: 500, timestamp: new Date('2026-01-10') },
      ];

      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain(entries));

      const snapshot = await ledgerService.getBalanceSnapshot('model-1', 'model');

      expect(snapshot.earnedBalance).toBe(500);
    });
  });

  describe('generateReconciliationReport', () => {
    it('should return transactions sorted ascending by timestamp', async () => {
      const startEntries: unknown[] = [];
      const rangeEntries = [
        {
          entryId: 'entry-1',
          accountId: 'user-123',
          accountType: 'user',
          amount: 100,
          type: 'credit',
          balanceState: 'available',
          stateTransition: 'available+100',
          reason: 'user_signup_bonus',
          idempotencyKey: 'idem-1',
          requestId: 'req-1',
          balanceBefore: 0,
          balanceAfter: 100,
          timestamp: new Date('2026-01-15'),
          currency: 'points',
        },
        {
          entryId: 'entry-2',
          accountId: 'user-123',
          accountType: 'user',
          amount: -30,
          type: 'debit',
          balanceState: 'available',
          stateTransition: 'available-30',
          reason: 'chip_menu_purchase',
          idempotencyKey: 'idem-2',
          requestId: 'req-2',
          balanceBefore: 100,
          balanceAfter: 70,
          timestamp: new Date('2026-01-20'),
          currency: 'points',
        },
      ];
      const endEntries = rangeEntries;

      // getBalanceSnapshot(start), then the in-range query, then getBalanceSnapshot(end).
      mockLedgerEntryModel.find
        .mockReturnValueOnce(makeQueryChain(startEntries))
        .mockReturnValueOnce(makeQueryChain(rangeEntries))
        .mockReturnValueOnce(makeQueryChain(endEntries));

      const report = await ledgerService.generateReconciliationReport(
        'user-123',
        'user',
        { start: new Date('2026-01-01'), end: new Date('2026-01-31') }
      );

      expect(report.totalCredits).toBe(100);
      expect(report.totalDebits).toBe(30);
      expect(report.accountId).toBe('user-123');
      expect(report.reconciled).toBe(true);
    });
  });

  describe('getAuditTrail', () => {
    it('should return all ledger entries for a transaction, chronologically', async () => {
      const entries = [
        {
          entryId: 'audit-1',
          transactionId: 'tx-42',
          accountId: 'user-123',
          accountType: 'user',
          amount: -50,
          type: 'debit',
          balanceState: 'available',
          stateTransition: 'available→escrow',
          reason: 'performance_request',
          idempotencyKey: 'idem-audit-1_debit',
          requestId: 'req-audit',
          balanceBefore: 100,
          balanceAfter: 50,
          timestamp: new Date('2026-01-15T10:00:00Z'),
          currency: 'points',
        },
        {
          entryId: 'audit-2',
          transactionId: 'tx-42',
          accountId: 'user-123',
          accountType: 'user',
          amount: 50,
          type: 'credit',
          balanceState: 'escrow',
          stateTransition: 'available→escrow',
          reason: 'performance_request',
          idempotencyKey: 'idem-audit-1_credit',
          requestId: 'req-audit',
          balanceBefore: 0,
          balanceAfter: 50,
          timestamp: new Date('2026-01-15T10:00:00Z'),
          currency: 'points',
        },
      ];

      mockLedgerEntryModel.find.mockReturnValueOnce(makeQueryChain(entries));

      const trail = await ledgerService.getAuditTrail('tx-42');

      expect(trail).toHaveLength(2);
      expect(trail[0].ledgerEntry.entryId).toBe('audit-1');
      expect(trail[1].ledgerEntry.entryId).toBe('audit-2');
    });
  });

  describe('Idempotency', () => {
    it('checkIdempotency returns true when a record exists', async () => {
      mockIdempotencyModel.findOne.mockReturnValueOnce(
        makeFindOneChain({ pointsIdempotencyKey: 'idem-x', eventScope: 'hold_escrow' })
      );

      const exists = await ledgerService.checkIdempotency('idem-x', 'hold_escrow');
      expect(exists).toBe(true);
    });

    it('checkIdempotency returns false when no record exists', async () => {
      mockIdempotencyModel.findOne.mockReturnValueOnce(makeFindOneChain(null));

      const exists = await ledgerService.checkIdempotency('idem-missing', 'hold_escrow');
      expect(exists).toBe(false);
    });

    it('claimIdempotency returns true on successful insert', async () => {
      mockIdempotencyModel.create.mockResolvedValueOnce({});

      const claimed = await ledgerService.claimIdempotency('idem-new', 'hold_escrow');
      expect(claimed).toBe(true);
    });

    it('claimIdempotency returns false on duplicate key (11000)', async () => {
      const dupErr: Error & { code?: number } = new Error('Duplicate key');
      dupErr.code = 11000;
      mockIdempotencyModel.create.mockRejectedValueOnce(dupErr);

      const claimed = await ledgerService.claimIdempotency('idem-dup', 'hold_escrow');
      expect(claimed).toBe(false);
    });

    it('claimIdempotency rethrows non-duplicate errors', async () => {
      mockIdempotencyModel.create.mockRejectedValueOnce(new Error('Connection lost'));

      await expect(
        ledgerService.claimIdempotency('idem-fail', 'hold_escrow')
      ).rejects.toThrow('Connection lost');
    });
  });

  describe('Immutability Contract', () => {
    it('should not expose any delete methods on the service', () => {
      expect(ledgerService).not.toHaveProperty('deleteEntry');
      expect(ledgerService).not.toHaveProperty('deleteEntries');
      expect(ledgerService).not.toHaveProperty('removeEntry');
    });

    it('should not expose any update methods on the service', () => {
      expect(ledgerService).not.toHaveProperty('updateEntry');
      expect(ledgerService).not.toHaveProperty('modifyEntry');
      expect(ledgerService).not.toHaveProperty('editEntry');
    });
  });
});
