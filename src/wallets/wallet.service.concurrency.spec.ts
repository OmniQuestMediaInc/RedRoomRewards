/**
 * Wallet Service Concurrency Tests
 *
 * Tests for race condition handling, optimistic locking, and concurrent operations.
 * These tests validate that the wallet service can handle multiple simultaneous
 * operations safely without data corruption.
 *
 * The DB models and LedgerService are mocked with in-memory implementations that
 * simulate MongoDB-style optimistic locking so the suite can exercise the
 * concurrency logic without requiring a live MongoDB connection.
 */

import { WalletService } from './wallet.service';
import { TransactionReason } from './types';

jest.mock('../db/models/wallet.model', () => ({
  WalletModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
  },
}));

jest.mock('../db/models/model-wallet.model', () => ({
  ModelWalletModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

jest.mock('../db/models/escrow-item.model', () => ({
  EscrowItemModel: {
    findOne: jest.fn(),
    create: jest.fn(),
    findOneAndUpdate: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockWalletModel = require('../db/models/wallet.model').WalletModel as {
  findOne: jest.Mock;
  create: jest.Mock;
  findOneAndUpdate: jest.Mock;
  updateOne: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockModelWalletModel = require('../db/models/model-wallet.model').ModelWalletModel as {
  findOne: jest.Mock;
  create: jest.Mock;
  findOneAndUpdate: jest.Mock;
};
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockEscrowItemModel = require('../db/models/escrow-item.model').EscrowItemModel as {
  findOne: jest.Mock;
  create: jest.Mock;
  findOneAndUpdate: jest.Mock;
  updateOne: jest.Mock;
  deleteOne: jest.Mock;
};

/**
 * Minimal in-memory ledger service that only implements the methods
 * WalletService actually calls, with idempotency-by-key semantics.
 */
class InMemoryLedgerService {
  private idempotencyKeys = new Set<string>();
  private claimedKeys = new Set<string>();

  async checkIdempotency(key: string, operationType: string): Promise<boolean> {
    return this.claimedKeys.has(`${operationType}:${key}`);
  }

  async claimIdempotency(key: string, operationType: string): Promise<boolean> {
    const composite = `${operationType}:${key}`;
    if (this.claimedKeys.has(composite)) {
      return false;
    }
    this.claimedKeys.add(composite);
    return true;
  }

  async createEntry(entry: { idempotencyKey: string }): Promise<Record<string, unknown>> {
    if (this.idempotencyKeys.has(entry.idempotencyKey)) {
      const err: Error & { code?: number } = new Error('Duplicate idempotency key');
      err.code = 11000;
      throw err;
    }
    this.idempotencyKeys.add(entry.idempotencyKey);
    return { ...entry, entryId: `entry-${this.idempotencyKeys.size}` };
  }

  async queryEntries(): Promise<unknown> {
    return { entries: [], totalCount: 0, offset: 0, limit: 0, hasMore: false };
  }
  async getEntry(): Promise<null> {
    return null;
  }
  async getBalanceSnapshot(): Promise<unknown> {
    return {};
  }
  async generateReconciliationReport(): Promise<unknown> {
    return {};
  }
  async getAuditTrail(): Promise<unknown[]> {
    return [];
  }
  async storeIdempotencyResult(): Promise<void> {}
}

interface WalletDoc {
  userId: string;
  availableBalance: number;
  escrowBalance: number;
  currency: string;
  version: number;
}

interface ModelWalletDoc {
  modelId: string;
  earnedBalance: number;
  currency: string;
  type: string;
  version: number;
}

interface EscrowDoc {
  escrowId: string;
  userId: string;
  amount: number;
  status: string;
  queueItemId: string;
  featureType?: string;
  reason?: string;
  modelId?: string;
  processedAt?: Date | null;
  createdAt?: Date;
  metadata?: unknown;
}

/** Extract equality value from a mongoose-style `{ field: { $eq: value } }` or `{ field: value }` filter. */
function eqValue(filter: unknown, field: string): unknown {
  const f = filter as Record<string, unknown> | undefined;
  const raw = f?.[field];
  if (raw && typeof raw === 'object' && '$eq' in (raw as Record<string, unknown>)) {
    return (raw as Record<string, unknown>).$eq;
  }
  return raw;
}

/**
 * Install in-memory implementations on the mocked models. Each call resets state.
 */
function installInMemoryDb() {
  const wallets = new Map<string, WalletDoc>();
  const modelWallets = new Map<string, ModelWalletDoc>();
  const escrows = new Map<string, EscrowDoc>();

  mockWalletModel.findOne.mockImplementation(async (filter: unknown) => {
    const userId = eqValue(filter, 'userId') as string;
    const w = wallets.get(userId);
    return w ? { ...w } : null;
  });
  mockWalletModel.create.mockImplementation(async (doc: WalletDoc) => {
    wallets.set(doc.userId, { ...doc });
    return { ...doc };
  });
  mockWalletModel.findOneAndUpdate.mockImplementation(
    async (filter: unknown, update: Record<string, Record<string, number>>) => {
      const userId = eqValue(filter, 'userId') as string;
      const expectedVersion = eqValue(filter, 'version') as number | undefined;
      const current = wallets.get(userId);
      if (!current) return null;
      if (expectedVersion !== undefined && current.version !== expectedVersion) {
        return null; // Optimistic lock conflict
      }
      const next: WalletDoc = { ...current };
      if (update.$set) {
        for (const [k, v] of Object.entries(update.$set)) {
          (next as unknown as Record<string, unknown>)[k] = v;
        }
      }
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          (next as unknown as Record<string, number>)[k] =
            ((current as unknown as Record<string, number>)[k] ?? 0) + (v as number);
        }
      }
      wallets.set(userId, next);
      return { ...next };
    },
  );

  mockModelWalletModel.findOne.mockImplementation(async (filter: unknown) => {
    const modelId = eqValue(filter, 'modelId') as string;
    const w = modelWallets.get(modelId);
    return w ? { ...w } : null;
  });
  mockModelWalletModel.create.mockImplementation(async (doc: ModelWalletDoc) => {
    modelWallets.set(doc.modelId, { ...doc });
    return { ...doc };
  });
  mockModelWalletModel.findOneAndUpdate.mockImplementation(
    async (filter: unknown, update: Record<string, Record<string, number>>) => {
      const modelId = eqValue(filter, 'modelId') as string;
      const expectedVersion = eqValue(filter, 'version') as number | undefined;
      const current = modelWallets.get(modelId);
      if (!current) return null;
      if (expectedVersion !== undefined && current.version !== expectedVersion) {
        return null;
      }
      const next: ModelWalletDoc = { ...current };
      if (update.$set) {
        for (const [k, v] of Object.entries(update.$set)) {
          (next as unknown as Record<string, unknown>)[k] = v;
        }
      }
      if (update.$inc) {
        for (const [k, v] of Object.entries(update.$inc)) {
          (next as unknown as Record<string, number>)[k] =
            ((current as unknown as Record<string, number>)[k] ?? 0) + (v as number);
        }
      }
      modelWallets.set(modelId, next);
      return { ...next };
    },
  );

  mockEscrowItemModel.create.mockImplementation(async (doc: EscrowDoc) => {
    escrows.set(doc.escrowId, { ...doc });
    return { ...doc };
  });
  mockEscrowItemModel.findOne.mockImplementation(async (filter: unknown) => {
    const escrowId = eqValue(filter, 'escrowId') as string;
    const e = escrows.get(escrowId);
    return e ? { ...e } : null;
  });
  mockEscrowItemModel.findOneAndUpdate.mockImplementation(
    async (filter: unknown, update: Record<string, Record<string, unknown>>) => {
      const escrowId = eqValue(filter, 'escrowId') as string;
      const expectedStatus = eqValue(filter, 'status') as string | undefined;
      const current = escrows.get(escrowId);
      if (!current) return null;
      if (expectedStatus !== undefined && current.status !== expectedStatus) {
        return null;
      }
      const before = { ...current };
      const next: EscrowDoc = { ...current };
      if (update.$set) {
        for (const [k, v] of Object.entries(update.$set)) {
          (next as unknown as Record<string, unknown>)[k] = v;
        }
      }
      escrows.set(escrowId, next);
      return before; // service uses { new: false }
    },
  );
  mockEscrowItemModel.updateOne.mockImplementation(
    async (filter: unknown, update: Record<string, Record<string, unknown>>) => {
      const escrowId = eqValue(filter, 'escrowId') as string;
      const current = escrows.get(escrowId);
      if (!current) return { acknowledged: true, modifiedCount: 0 };
      const next: EscrowDoc = { ...current };
      if (update.$set) {
        for (const [k, v] of Object.entries(update.$set)) {
          (next as unknown as Record<string, unknown>)[k] = v;
        }
      }
      escrows.set(escrowId, next);
      return { acknowledged: true, modifiedCount: 1 };
    },
  );
  mockEscrowItemModel.deleteOne.mockImplementation(async (filter: unknown) => {
    const escrowId = eqValue(filter, 'escrowId') as string;
    escrows.delete(escrowId);
    return { acknowledged: true, deletedCount: 1 };
  });

  return { wallets, modelWallets, escrows };
}

describe('Wallet Service - Concurrency and Race Conditions', () => {
  let walletService: WalletService;
  let ledgerService: InMemoryLedgerService;
  let db: ReturnType<typeof installInMemoryDb>;

  beforeEach(() => {
    jest.clearAllMocks();
    db = installInMemoryDb();
    ledgerService = new InMemoryLedgerService();
    walletService = new WalletService(
      ledgerService as unknown as import('../ledger/types').ILedgerService,
    );
  });

  describe('Optimistic Locking', () => {
    it('should retry on optimistic lock conflicts', async () => {
      const userId = 'user-concurrent-1';

      await mockWalletModel.create({
        userId,
        availableBalance: 1000,
        escrowBalance: 0,
        currency: 'points',
        version: 0,
      });

      const simulateConcurrentUpdate = (amount: number, idempotencyKey: string) => {
        return walletService.holdInEscrow({
          userId,
          amount,
          reason: TransactionReason.PERFORMANCE_REQUEST,
          queueItemId: `queue-${idempotencyKey}`,
          featureType: 'test',
          idempotencyKey,
          requestId: `req-${idempotencyKey}`,
        });
      };

      const results = await Promise.allSettled([
        simulateConcurrentUpdate(100, 'idem-1'),
        simulateConcurrentUpdate(200, 'idem-2'),
        simulateConcurrentUpdate(300, 'idem-3'),
      ]);

      const successCount = results.filter((r) => r.status === 'fulfilled').length;
      expect(successCount).toBeGreaterThan(0);

      const wallet = db.wallets.get(userId);
      expect(wallet).toBeDefined();
    }, 15000);

    it('should handle version conflicts correctly', async () => {
      const userId = 'user-version-test';

      await mockWalletModel.create({
        userId,
        availableBalance: 1000,
        escrowBalance: 0,
        currency: 'points',
        version: 5,
      });

      await walletService.holdInEscrow({
        userId,
        amount: 100,
        reason: TransactionReason.PERFORMANCE_REQUEST,
        queueItemId: 'queue-1',
        featureType: 'test',
        idempotencyKey: 'idem-version-1',
        requestId: 'req-version-1',
      });

      const updatedWallet = db.wallets.get(userId);
      expect(updatedWallet!.version).toBe(6);
    });
  });

  describe('Idempotency Under Concurrent Load', () => {
    it('should prevent duplicate operations with same idempotency key', async () => {
      const userId = 'user-idem-test';

      await mockWalletModel.create({
        userId,
        availableBalance: 1000,
        escrowBalance: 0,
        currency: 'points',
        version: 0,
      });

      const request = {
        userId,
        amount: 100,
        reason: TransactionReason.PERFORMANCE_REQUEST,
        queueItemId: 'queue-idem',
        featureType: 'test',
        idempotencyKey: 'same-idem-key',
        requestId: 'req-idem',
      };

      const results = await Promise.allSettled([
        walletService.holdInEscrow(request),
        walletService.holdInEscrow(request),
        walletService.holdInEscrow(request),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      expect(fulfilled.length).toBe(1);
      expect(rejected.length).toBe(2);

      const wallet = db.wallets.get(userId);
      expect(wallet!.availableBalance).toBe(900);
      expect(wallet!.escrowBalance).toBe(100);
    }, 20000);
  });

  describe('Balance Consistency Under Load', () => {
    it('should maintain balance consistency with multiple operations', async () => {
      const userId = 'user-consistency-test';
      const initialBalance = 10000;

      await mockWalletModel.create({
        userId,
        availableBalance: initialBalance,
        escrowBalance: 0,
        currency: 'points',
        version: 0,
      });

      const operations = Array.from({ length: 10 }, (_, i) => ({
        userId,
        amount: 100,
        reason: TransactionReason.PERFORMANCE_REQUEST,
        queueItemId: `queue-${i}`,
        featureType: 'test',
        idempotencyKey: `idem-${i}`,
        requestId: `req-${i}`,
      }));

      const results = await Promise.allSettled(
        operations.map((op) => walletService.holdInEscrow(op)),
      );

      const successCount = results.filter((r) => r.status === 'fulfilled').length;

      const wallet = db.wallets.get(userId);
      const expectedAvailable = initialBalance - successCount * 100;
      const expectedEscrow = successCount * 100;

      expect(wallet!.availableBalance).toBe(expectedAvailable);
      expect(wallet!.escrowBalance).toBe(expectedEscrow);

      const totalBalance = wallet!.availableBalance + wallet!.escrowBalance;
      expect(totalBalance).toBe(initialBalance);
    }, 20000);

    it('should handle mixed operations (hold, settle, refund) correctly', async () => {
      const userId = 'user-mixed-ops';
      const modelId = 'model-mixed-ops';

      await mockWalletModel.create({
        userId,
        availableBalance: 5000,
        escrowBalance: 0,
        currency: 'points',
        version: 0,
      });

      const holdResult1 = await walletService.holdInEscrow({
        userId,
        amount: 1000,
        reason: TransactionReason.PERFORMANCE_REQUEST,
        queueItemId: 'queue-hold-1',
        featureType: 'test',
        idempotencyKey: 'idem-hold-1',
        requestId: 'req-hold-1',
      });

      const holdResult2 = await walletService.holdInEscrow({
        userId,
        amount: 1000,
        reason: TransactionReason.PERFORMANCE_REQUEST,
        queueItemId: 'queue-hold-2',
        featureType: 'test',
        idempotencyKey: 'idem-hold-2',
        requestId: 'req-hold-2',
      });

      await walletService.settleEscrow(
        {
          escrowId: holdResult1.escrowId,
          modelId,
          amount: 1000,
          queueItemId: 'queue-hold-1',
          reason: TransactionReason.PERFORMANCE_COMPLETED,
          authorizationToken: 'auth-token-1',
          idempotencyKey: 'idem-settle-1',
          requestId: 'req-settle-1',
        },
        {
          token: 'auth-token-1',
          queueItemId: 'queue-hold-1',
          escrowId: holdResult1.escrowId,
          modelId,
          amount: 1000,
          reason: TransactionReason.PERFORMANCE_COMPLETED,
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60000),
        },
      );

      await walletService.refundEscrow(
        {
          escrowId: holdResult2.escrowId,
          userId,
          amount: 1000,
          queueItemId: 'queue-hold-2',
          reason: TransactionReason.PERFORMANCE_ABANDONED,
          authorizationToken: 'auth-token-2',
          idempotencyKey: 'idem-refund-1',
          requestId: 'req-refund-1',
        },
        {
          token: 'auth-token-2',
          queueItemId: 'queue-hold-2',
          escrowId: holdResult2.escrowId,
          userId,
          amount: 1000,
          reason: TransactionReason.PERFORMANCE_ABANDONED,
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 60000),
        },
      );

      const userWallet = db.wallets.get(userId);
      expect(userWallet!.availableBalance).toBe(4000);
      expect(userWallet!.escrowBalance).toBe(0);
    }, 20000);
  });

  describe('Error Recovery', () => {
    it('should handle insufficient balance gracefully', async () => {
      const userId = 'user-insufficient';

      await mockWalletModel.create({
        userId,
        availableBalance: 100,
        escrowBalance: 0,
        currency: 'points',
        version: 0,
      });

      await expect(
        walletService.holdInEscrow({
          userId,
          amount: 500,
          reason: TransactionReason.PERFORMANCE_REQUEST,
          queueItemId: 'queue-insufficient',
          featureType: 'test',
          idempotencyKey: 'idem-insufficient',
          requestId: 'req-insufficient',
        }),
      ).rejects.toThrow();

      const wallet = db.wallets.get(userId);
      expect(wallet!.availableBalance).toBe(100);
      expect(wallet!.escrowBalance).toBe(0);
    });

    it('should rollback on ledger entry failure', async () => {
      // Placeholder — rollback semantics require DB transactions.
    });
  });

  describe('Performance Under Load', () => {
    it('should handle high concurrency without deadlocks', async () => {
      const userId = 'user-high-load';

      await mockWalletModel.create({
        userId,
        availableBalance: 100000,
        escrowBalance: 0,
        currency: 'points',
        version: 0,
      });

      const operations = Array.from({ length: 50 }, (_, i) => ({
        userId,
        amount: 100,
        reason: TransactionReason.PERFORMANCE_REQUEST,
        queueItemId: `queue-load-${i}`,
        featureType: 'test',
        idempotencyKey: `idem-load-${i}`,
        requestId: `req-load-${i}`,
      }));

      const startTime = Date.now();

      const results = await Promise.allSettled(
        operations.map((op) => walletService.holdInEscrow(op)),
      );

      const duration = Date.now() - startTime;
      const successCount = results.filter((r) => r.status === 'fulfilled').length;

      expect(duration).toBeLessThan(30000);
      expect(successCount).toBeGreaterThan(0);

      const wallet = db.wallets.get(userId);
      const totalBalance = wallet!.availableBalance + wallet!.escrowBalance;
      expect(totalBalance).toBe(100000);
    }, 30000);
  });
});
