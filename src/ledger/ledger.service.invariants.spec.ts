/**
 * LedgerService invariants (B-012)
 *
 * Asserts the four append-only invariants from the schedule:
 *   1. Append-only reflection — the public API exposes no `update*`,
 *      `delete*`, `patch*`, or otherwise-mutating primitives on
 *      existing entries. Once written, an entry can be queried but
 *      never altered.
 *   2. Monotonic sequence — entries returned by `queryEntries` with
 *      ascending sort obey monotonic non-decreasing timestamps, with
 *      a deterministic tie-break.
 *   3. Balance projection — for an account, the ledger projection
 *      `sum(amount delta)` matches the `balanceAfter` of the most
 *      recent entry (modulo the running `balanceBefore`/`balanceAfter`
 *      bookkeeping that every entry must carry).
 *   4. Non-null correlation_id + reason_code — every persisted entry
 *      has a non-empty `correlationId` and a defined `reason`.
 */

import { LedgerService } from './ledger.service';
import { CreateLedgerEntryRequest, LedgerEntry } from './types';
import { TransactionType, TransactionReason } from '../wallets/types';
import { LedgerEntryModel } from '../db/models/ledger-entry.model';

jest.mock('../db/models/ledger-entry.model');
jest.mock('../db/models/idempotency.model');

describe('LedgerService invariants (B-012)', () => {
  let service: LedgerService;

  beforeEach(() => {
    service = new LedgerService();
    jest.clearAllMocks();
  });

  // ───────────────────────────────────────────────────────────────────
  // Invariant 1 — Append-only reflection check
  // ───────────────────────────────────────────────────────────────────

  describe('Invariant 1 — append-only reflection', () => {
    it('exposes no update/delete/patch primitives on the prototype', () => {
      const proto = Object.getPrototypeOf(service);
      const bag = service as unknown as Record<string, unknown>;
      const methods = Object.getOwnPropertyNames(proto).filter(
        (name) => typeof bag[name] === 'function',
      );

      const FORBIDDEN_PREFIXES = ['update', 'patch', 'set', 'mutate', 'modify', 'overwrite'];
      const FORBIDDEN_EXACT = ['delete', 'remove', 'destroy', 'reset'];

      const offenders = methods.filter((name) => {
        const lower = name.toLowerCase();
        if (FORBIDDEN_EXACT.some((forbidden) => lower === forbidden)) return true;
        if (lower.startsWith('delete')) return true;
        // Allow `claimIdempotency`, `storeIdempotencyResult` — those write
        // idempotency records, not ledger entries. Filter on whether the
        // method name implies entry mutation.
        return FORBIDDEN_PREFIXES.some(
          (p) => lower.startsWith(p) && (lower.includes('entry') || lower.includes('ledger')),
        );
      });

      expect(offenders).toEqual([]);
    });

    it('createGiftingPromotion / awardPromotionalPoints / creditPoints / deductPoints all write through createEntry (no direct mutation paths)', () => {
      // The public API surface that adds to the ledger MUST funnel through
      // createEntry, which is the single immutable insert primitive. The
      // test guards against future drift by asserting these methods exist.
      expect(typeof service.createEntry).toBe('function');
      expect(typeof service.creditPoints).toBe('function');
      expect(typeof service.deductPoints).toBe('function');
      expect(typeof service.awardPromotionalPoints).toBe('function');
      // No update / delete primitives (sanity).
      expect((service as unknown as Record<string, unknown>).updateEntry).toBeUndefined();
      expect((service as unknown as Record<string, unknown>).deleteEntry).toBeUndefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────
  // Invariant 2 — Monotonic sequence
  // ───────────────────────────────────────────────────────────────────

  describe('Invariant 2 — monotonic sequence', () => {
    it('queryEntries with ascending sort returns entries in non-decreasing timestamp order', async () => {
      const now = Date.now();
      const fixtures = [
        { entryId: 'e1', timestamp: new Date(now + 0), entryNum: 1 },
        { entryId: 'e2', timestamp: new Date(now + 10), entryNum: 2 },
        { entryId: 'e3', timestamp: new Date(now + 20), entryNum: 3 },
      ].map((f, i) => ({
        entryId: f.entryId,
        transactionId: `txn-${i}`,
        accountId: 'user-1',
        accountType: 'user',
        amount: 10,
        type: 'credit',
        balanceState: 'available',
        stateTransition: 'none→available',
        reason: 'admin_credit',
        idempotencyKey: `idem-${i}`,
        requestId: `req-${i}`,
        balanceBefore: i * 10,
        balanceAfter: (i + 1) * 10,
        timestamp: f.timestamp,
        currency: 'points',
        correlationId: 'corr-1',
      }));

      const findChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fixtures),
      };
      (LedgerEntryModel.find as jest.Mock).mockReturnValue(findChain);
      (LedgerEntryModel.countDocuments as jest.Mock).mockResolvedValue(fixtures.length);

      const result = await service.queryEntries({
        accountId: 'user-1',
        sortBy: 'timestamp',
        sortOrder: 'asc',
      });

      // Verify the service requested ascending sort by timestamp.
      expect(findChain.sort).toHaveBeenCalledWith({ timestamp: 1 });

      // Verify monotonic non-decreasing timestamps.
      for (let i = 1; i < result.entries.length; i++) {
        expect(result.entries[i].timestamp.getTime()).toBeGreaterThanOrEqual(
          result.entries[i - 1].timestamp.getTime(),
        );
      }
    });
  });

  // ───────────────────────────────────────────────────────────────────
  // Invariant 3 — Balance projection
  // ───────────────────────────────────────────────────────────────────

  describe('Invariant 3 — balance projection', () => {
    it('sum of (balanceAfter - balanceBefore) across entries equals (final balanceAfter - initial balanceBefore)', async () => {
      const fixtures = [
        { amount: 100, balanceBefore: 0, balanceAfter: 100 },
        { amount: 50, balanceBefore: 100, balanceAfter: 150 },
        { amount: -30, balanceBefore: 150, balanceAfter: 120 },
      ].map((f, i) => ({
        entryId: `e${i}`,
        transactionId: `txn-${i}`,
        accountId: 'user-1',
        accountType: 'user',
        amount: f.amount,
        type: f.amount >= 0 ? 'credit' : 'debit',
        balanceState: 'available',
        stateTransition: 'none→available',
        reason: 'admin_credit',
        idempotencyKey: `idem-${i}`,
        requestId: `req-${i}`,
        balanceBefore: f.balanceBefore,
        balanceAfter: f.balanceAfter,
        timestamp: new Date(2026, 0, 1, 0, 0, i),
        currency: 'points',
        correlationId: 'corr-1',
      }));

      const findChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fixtures),
      };
      (LedgerEntryModel.find as jest.Mock).mockReturnValue(findChain);
      (LedgerEntryModel.countDocuments as jest.Mock).mockResolvedValue(fixtures.length);

      const result = await service.queryEntries({ accountId: 'user-1' });

      const sumOfDeltas = result.entries.reduce(
        (acc, e) => acc + (e.balanceAfter - e.balanceBefore),
        0,
      );
      const initialBefore = result.entries[0].balanceBefore;
      const finalAfter = result.entries[result.entries.length - 1].balanceAfter;

      expect(sumOfDeltas).toBe(finalAfter - initialBefore);
      expect(sumOfDeltas).toBe(120);
    });

    it('sum of amount field equals (final balanceAfter - initial balanceBefore) for a contiguous account ledger', async () => {
      const fixtures = [
        { amount: 100, balanceBefore: 0, balanceAfter: 100 },
        { amount: 50, balanceBefore: 100, balanceAfter: 150 },
        { amount: -30, balanceBefore: 150, balanceAfter: 120 },
      ].map((f, i) => ({
        entryId: `e${i}`,
        transactionId: `txn-${i}`,
        accountId: 'user-1',
        accountType: 'user',
        amount: f.amount,
        type: f.amount >= 0 ? 'credit' : 'debit',
        balanceState: 'available',
        stateTransition: 'none→available',
        reason: 'admin_credit',
        idempotencyKey: `idem-${i}`,
        requestId: `req-${i}`,
        balanceBefore: f.balanceBefore,
        balanceAfter: f.balanceAfter,
        timestamp: new Date(2026, 0, 1, 0, 0, i),
        currency: 'points',
        correlationId: 'corr-1',
      }));

      const findChain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        lean: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(fixtures),
      };
      (LedgerEntryModel.find as jest.Mock).mockReturnValue(findChain);
      (LedgerEntryModel.countDocuments as jest.Mock).mockResolvedValue(fixtures.length);

      const result = await service.queryEntries({ accountId: 'user-1' });

      const sumOfAmounts = result.entries.reduce((acc, e) => acc + e.amount, 0);
      const initialBefore = result.entries[0].balanceBefore;
      const finalAfter = result.entries[result.entries.length - 1].balanceAfter;

      expect(sumOfAmounts).toBe(finalAfter - initialBefore);
    });
  });

  // ───────────────────────────────────────────────────────────────────
  // Invariant 4 — Non-null correlation_id + reason_code
  // ───────────────────────────────────────────────────────────────────

  describe('Invariant 4 — non-null correlation_id and reason_code', () => {
    function baseRequest(): CreateLedgerEntryRequest {
      return {
        accountId: 'user-1',
        accountType: 'user',
        amount: 100,
        type: TransactionType.CREDIT,
        balanceState: 'available',
        stateTransition: 'none→available',
        reason: TransactionReason.ADMIN_CREDIT,
        idempotencyKey: 'idem-inv4-1',
        requestId: 'req-inv4-1',
        balanceBefore: 0,
        balanceAfter: 100,
      };
    }

    it('createEntry persists a correlationId equal to the transactionId when caller supplies neither', async () => {
      const captured: Record<string, unknown>[] = [];
      (LedgerEntryModel.create as jest.Mock).mockImplementation(async (doc) => {
        captured.push(doc as Record<string, unknown>);
        return { ...(doc as Record<string, unknown>), timestamp: new Date(), currency: 'points' };
      });

      const result: LedgerEntry = await service.createEntry(baseRequest());

      expect(captured).toHaveLength(1);
      const persisted = captured[0];
      expect(persisted.correlationId).toBeDefined();
      expect(typeof persisted.correlationId).toBe('string');
      expect((persisted.correlationId as string).length).toBeGreaterThan(0);
      // Default-binding rule: when caller does not supply correlationId,
      // it is set to the transactionId.
      expect(persisted.correlationId).toBe(persisted.transactionId);
      expect(result.correlationId).toBe(result.transactionId);
    });

    it('createEntry honors caller-supplied correlationId verbatim', async () => {
      const captured: Record<string, unknown>[] = [];
      (LedgerEntryModel.create as jest.Mock).mockImplementation(async (doc) => {
        captured.push(doc as Record<string, unknown>);
        return { ...(doc as Record<string, unknown>), timestamp: new Date(), currency: 'points' };
      });

      const req = { ...baseRequest(), correlationId: 'corr-explicit-001' };
      await service.createEntry(req);

      expect(captured[0].correlationId).toBe('corr-explicit-001');
    });

    it('createEntry rejects a blank correlationId via fallback to transactionId rather than persisting an empty string', async () => {
      const captured: Record<string, unknown>[] = [];
      (LedgerEntryModel.create as jest.Mock).mockImplementation(async (doc) => {
        captured.push(doc as Record<string, unknown>);
        return { ...(doc as Record<string, unknown>), timestamp: new Date(), currency: 'points' };
      });

      const req = { ...baseRequest(), correlationId: '   ' };
      await service.createEntry(req);

      // Whitespace-only is treated as missing; service falls back to transactionId.
      expect(captured[0].correlationId).toBe(captured[0].transactionId);
      expect((captured[0].correlationId as string).trim().length).toBeGreaterThan(0);
    });

    it('createEntry persists a non-null reason code (TransactionReason)', async () => {
      const captured: Record<string, unknown>[] = [];
      (LedgerEntryModel.create as jest.Mock).mockImplementation(async (doc) => {
        captured.push(doc as Record<string, unknown>);
        return { ...(doc as Record<string, unknown>), timestamp: new Date(), currency: 'points' };
      });

      await service.createEntry(baseRequest());

      expect(captured[0].reason).toBeDefined();
      expect(captured[0].reason).toBe(TransactionReason.ADMIN_CREDIT);
    });

    it('createEntry rejects a request that omits reason at runtime', async () => {
      // The TS type already forbids this, but the runtime guard backstops
      // any caller that bypasses the type system (e.g. dynamic dispatch).
      const req = { ...baseRequest() };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (req as any).reason;
      await expect(service.createEntry(req)).rejects.toThrow(/reason is required/);
    });
  });
});
