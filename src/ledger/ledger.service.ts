/**
 * Ledger Service Implementation
 *
 * Provides immutable transaction logging and audit trail functionality.
 * All ledger entries are write-once and never modified.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  ILedgerService,
  LedgerEntry,
  CreateLedgerEntryRequest,
  LedgerQueryFilter,
  LedgerQueryResult,
  BalanceSnapshot,
  ReconciliationReport,
  AuditTrailEntry,
  LedgerConfig,
} from './types';
import { LedgerEntryModel, ILedgerEntry } from '../db/models/ledger-entry.model';
import { IdempotencyRecordModel } from '../db/models/idempotency.model';
import { TransactionType, TransactionReason } from '../wallets/types';

/**
 * Default configuration for ledger service
 */
const DEFAULT_CONFIG: LedgerConfig = {
  enableAuditLogging: true,
  retentionDays: 2555, // 7 years minimum for financial records
  defaultCurrency: 'points',
  enableReconciliation: true,
  reconciliationFrequencyHours: 24,
  alertOnReconciliationFailure: true,
};

/**
 * LedgerService implementation
 */
export class LedgerService implements ILedgerService {
  private config: LedgerConfig;

  constructor(config: Partial<LedgerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Create a new immutable ledger entry
   */
  async createEntry(request: CreateLedgerEntryRequest): Promise<LedgerEntry> {
    // Validate state/accountType compatibility
    if (request.accountType === 'user' && request.balanceState === 'earned') {
      throw new Error('Invalid state transition: users cannot use earned balance state');
    }
    if (request.accountType === 'model' && request.balanceState === 'escrow') {
      throw new Error('Invalid state transition: models cannot use escrow balance state');
    }

    // Validate metadata does not contain PII
    if (request.metadata) {
      // Use exact key names to avoid false positives on legitimate fields like emailCount
      const piiFieldNames = new Set([
        'email',
        'password',
        'ssn',
        'creditcard',
        'phonenumber',
        'phone',
      ]);
      const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
      for (const key of Object.keys(request.metadata)) {
        if (piiFieldNames.has(key.toLowerCase())) {
          throw new Error(`PII detected in metadata: field "${key}" may contain sensitive data`);
        }
        const val = request.metadata[key];
        if (typeof val === 'string' && emailPattern.test(val)) {
          throw new Error(`PII detected in metadata: field "${key}" contains an email address`);
        }
      }
    }

    // Generate IDs if not provided
    const entryId = uuidv4();
    const transactionId = request.transactionId || uuidv4();
    const timestamp = new Date();

    // Create ledger entry document
    const entryDoc: Partial<ILedgerEntry> = {
      entryId,
      transactionId,
      accountId: request.accountId,
      accountType: request.accountType,
      amount: request.amount,
      type: request.type,
      balanceState: request.balanceState,
      stateTransition: request.stateTransition,
      reason: request.reason,
      idempotencyKey: request.idempotencyKey,
      requestId: request.requestId,
      balanceBefore: request.balanceBefore,
      balanceAfter: request.balanceAfter,
      timestamp,
      currency: request.currency || this.config.defaultCurrency,
      metadata: request.metadata,
      escrowId: request.escrowId,
      queueItemId: request.queueItemId,
      featureType: request.featureType,
      correlationId: request.correlationId,
    };

    try {
      // Insert entry (idempotency key ensures uniqueness)
      const created = await LedgerEntryModel.create(entryDoc);

      // Map to domain object
      return this.mapToDomain(created);
    } catch (error: unknown) {
      // Handle duplicate idempotency key
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 11000 &&
        'keyPattern' in error &&
        (error.keyPattern as Record<string, unknown>)?.idempotencyKey
      ) {
        // Find and return existing entry
        const existing = await LedgerEntryModel.findOne({
          idempotencyKey: { $eq: request.idempotencyKey },
        })
          .lean()
          .exec();
        if (existing) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return this.mapToDomain(existing as any);
        }
      }
      throw error;
    }
  }

  /**
   * Query ledger entries with filters
   */
  async queryEntries(filter: LedgerQueryFilter): Promise<LedgerQueryResult> {
    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    if (filter.accountId) {
      query.accountId = { $eq: filter.accountId };
    }

    if (filter.accountType) {
      query.accountType = { $eq: filter.accountType };
    }

    if (filter.type) {
      query.type = { $eq: filter.type };
    }

    if (filter.reason) {
      query.reason = { $eq: filter.reason };
    }

    if (filter.balanceState) {
      query.balanceState = { $eq: filter.balanceState };
    }

    if (filter.escrowId) {
      query.escrowId = { $eq: filter.escrowId };
    }

    if (filter.queueItemId) {
      query.queueItemId = { $eq: filter.queueItemId };
    }

    if (filter.featureType) {
      query.featureType = { $eq: filter.featureType };
    }

    // Date range filter
    if (filter.startDate || filter.endDate) {
      query.timestamp = {};
      if (filter.startDate) {
        query.timestamp.$gte = filter.startDate;
      }
      if (filter.endDate) {
        query.timestamp.$lte = filter.endDate;
      }
    }

    // Pagination
    const limit = Math.min(filter.limit || 100, 1000);
    const offset = filter.offset || 0;

    // Sorting
    const sortField = filter.sortBy || 'timestamp';
    const sortOrder = filter.sortOrder === 'asc' ? 1 : -1;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sort: any = { [sortField]: sortOrder };

    // Execute query
    const [entries, totalCount] = await Promise.all([
      LedgerEntryModel.find(query).sort(sort).skip(offset).limit(limit).lean().exec(),
      LedgerEntryModel.countDocuments(query),
    ]);

    // Map results
    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      entries: entries.map((e) => this.mapToDomain(e as any)),
      totalCount,
      offset,
      limit,
      hasMore: offset + entries.length < totalCount,
    };
  }

  /**
   * Get a specific ledger entry by ID
   */
  async getEntry(entryId: string): Promise<LedgerEntry | null> {
    const entry = await LedgerEntryModel.findOne({
      entryId: { $eq: entryId },
    })
      .lean()
      .exec();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return entry ? this.mapToDomain(entry as any) : null;
  }

  /**
   * Get balance snapshot at a point in time
   */
  async getBalanceSnapshot(
    accountId: string,
    accountType: 'user' | 'model',
    asOf?: Date,
  ): Promise<BalanceSnapshot> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {
      accountId: { $eq: accountId },
      accountType: { $eq: accountType },
    };

    if (asOf) {
      query.timestamp = { $lte: asOf };
    }

    // Get all entries up to the specified time
    const entries = await LedgerEntryModel.find(query).sort({ timestamp: 1 }).lean().exec();

    // Calculate balances by state
    const balances: { [key: string]: number } = {
      available: 0,
      escrow: 0,
      earned: 0,
    };

    for (const entry of entries) {
      // Use the balanceAfter from the entry for the specific state
      if (
        entry.balanceState === 'available' ||
        entry.balanceState === 'escrow' ||
        entry.balanceState === 'earned'
      ) {
        balances[entry.balanceState] = entry.balanceAfter;
      }
    }

    const snapshot: BalanceSnapshot = {
      accountId,
      accountType,
      availableBalance: balances.available,
      asOf: asOf || new Date(),
      currency: this.config.defaultCurrency,
    };

    // Add escrow for users, earned for models
    if (accountType === 'user') {
      snapshot.escrowBalance = balances.escrow;
    } else if (accountType === 'model') {
      snapshot.earnedBalance = balances.earned;
    }

    return snapshot;
  }

  /**
   * Generate reconciliation report
   */
  async generateReconciliationReport(
    accountId: string,
    accountType: 'user' | 'model',
    dateRange: { start: Date; end: Date },
  ): Promise<ReconciliationReport> {
    // Get starting balance (before start date)
    const startSnapshot = await this.getBalanceSnapshot(accountId, accountType, dateRange.start);

    // Get entries in date range. Sort by timestamp ascending with entryId as
    // a deterministic tie-breaker so the reconciliation output is stable and
    // auditable even when multiple entries share a timestamp.
    const entries = await LedgerEntryModel.find({
      accountId: { $eq: accountId },
      accountType: { $eq: accountType },
      timestamp: { $gte: dateRange.start, $lte: dateRange.end },
    })
      .sort({ timestamp: 1, entryId: 1 })
      .lean()
      .exec();

    // Calculate totals
    let totalCredits = 0;
    let totalDebits = 0;

    for (const entry of entries) {
      if (entry.type === 'credit') {
        totalCredits += entry.amount;
      } else {
        totalDebits += Math.abs(entry.amount);
      }
    }

    // Get ending balance
    const endSnapshot = await this.getBalanceSnapshot(accountId, accountType, dateRange.end);

    // Calculate expected balance
    const startingBalance =
      startSnapshot.availableBalance +
      (startSnapshot.escrowBalance || 0) +
      (startSnapshot.earnedBalance || 0);

    const calculatedBalance = startingBalance + totalCredits - totalDebits;

    const actualBalance =
      endSnapshot.availableBalance +
      (endSnapshot.escrowBalance || 0) +
      (endSnapshot.earnedBalance || 0);

    const difference = actualBalance - calculatedBalance;
    const reconciled = Math.abs(difference) < 0.01; // Allow for floating point precision

    return {
      accountId,
      accountType,
      startingBalance,
      totalCredits,
      totalDebits,
      calculatedBalance,
      actualBalance,
      difference,
      reconciled,
      reportedAt: new Date(),
      dateRange,
    };
  }

  /**
   * Get audit trail for a transaction
   */
  async getAuditTrail(transactionId: string): Promise<AuditTrailEntry[]> {
    const entries = await LedgerEntryModel.find({
      transactionId: { $eq: transactionId },
    })
      .sort({ timestamp: 1 })
      .lean()
      .exec();

    return entries.map((entry) => ({
      auditId: entry.entryId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ledgerEntry: this.mapToDomain(entry as any),
      auditedAt: entry.timestamp,
    }));
  }

  /**
   * Check if idempotency key has been used
   */
  async checkIdempotency(key: string, operationType: string): Promise<boolean> {
    const existing = await IdempotencyRecordModel.findOne({
      pointsIdempotencyKey: { $eq: key },
      eventScope: { $eq: operationType },
    })
      .lean()
      .exec();

    return existing !== null;
  }

  /**
   * Atomically claim an idempotency key by inserting a reservation record
   * backed by the unique index on (pointsIdempotencyKey, eventScope).
   * Returns true if this caller won the race, false if another caller already
   * claimed the same key. This is the concurrency gate that ensures only one
   * of N simultaneous requests with the same idempotency key proceeds.
   */
  async claimIdempotency(key: string, operationType: string): Promise<boolean> {
    try {
      await IdempotencyRecordModel.create({
        pointsIdempotencyKey: key,
        eventScope: operationType,
        resultHash: 'pending',
        storedResult: {},
        // Short-lived claim; finalized by storeIdempotencyResult on success.
        expiresAt: new Date(Date.now() + 60_000),
        retentionUntil: new Date(Date.now() + 60_000),
      });
      return true;
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        (error as { code?: number }).code === 11000
      ) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Store idempotency result
   */
  async storeIdempotencyResult(
    key: string,
    operationType: string,
    result: unknown,
    _statusCode: number,
    ttlSeconds: number,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
    const retentionUntil = new Date(Date.now() + ttlSeconds * 1000);

    await IdempotencyRecordModel.create({
      pointsIdempotencyKey: key,
      eventScope: operationType,
      resultHash: JSON.stringify(result),
      storedResult: result as Record<string, unknown>,
      expiresAt,
      retentionUntil,
    });
  }

  /**
   * Credit promotional points to a user's available balance.
   *
   * Writes an immutable ledger entry tagged with PROMOTIONAL_AWARD.
   * The string `reason` is captured in metadata alongside `source`.
   * Balance snapshots are derived from the current ledger state immediately
   * before the entry is written; full transactional safety will be added by B-006.
   */
  async creditPoints(
    accountId: string,
    amount: number,
    source: string,
    reason: string,
  ): Promise<boolean> {
    const snapshot = await this.getBalanceSnapshot(accountId, 'user');
    await this.createEntry({
      accountId,
      accountType: 'user',
      type: TransactionType.CREDIT,
      amount,
      balanceState: 'available',
      stateTransition: 'promotional-credit→available',
      reason: TransactionReason.PROMOTIONAL_AWARD,
      idempotencyKey: `credit-${source}-${accountId}-${uuidv4()}`,
      requestId: uuidv4(),
      balanceBefore: snapshot.availableBalance,
      balanceAfter: snapshot.availableBalance + amount,
      correlationId: source,
      metadata: { reason, source },
    });
    return true;
  }

  /**
   * Deduct points from a user's available balance.
   *
   * Writes an immutable ledger entry tagged with ADMIN_DEBIT.
   * The string `reason` is captured in metadata alongside `source`.
   * Balance snapshots are derived from the current ledger state immediately
   * before the entry is written; full transactional safety will be added by B-006.
   */
  async deductPoints(
    accountId: string,
    amount: number,
    source: string,
    reason: string,
  ): Promise<boolean> {
    const snapshot = await this.getBalanceSnapshot(accountId, 'user');
    await this.createEntry({
      accountId,
      accountType: 'user',
      type: TransactionType.DEBIT,
      amount: -amount,
      balanceState: 'available',
      stateTransition: 'available→promotional-debit',
      reason: TransactionReason.ADMIN_DEBIT,
      idempotencyKey: `debit-${source}-${accountId}-${uuidv4()}`,
      requestId: uuidv4(),
      balanceBefore: snapshot.availableBalance,
      balanceAfter: snapshot.availableBalance - amount,
      correlationId: source,
      metadata: { reason, source },
    });
    return true;
  }

  async awardPromotionalPoints(
    creatorId: string,
    points: number,
    source: string,
    reason: string,
    _expiryDays?: number,
  ): Promise<boolean> {
    return this.creditPoints(creatorId, points, source, reason);
  }

  async createGiftingPromotion(
    creatorId: string,
    _points: number,
    _title: string,
    _condition: string,
    _maxRecipients?: number,
    _expiryDays?: number,
  ) {
    // STUB: real implementation in next payload
    console.log(`[Ledger] Created gifting promotion for ${creatorId}`);
    return true;
  }

  /**
   * Map database document to domain object
   */
  private mapToDomain(doc: ILedgerEntry): LedgerEntry {
    return {
      entryId: doc.entryId,
      transactionId: doc.transactionId,
      accountId: doc.accountId,
      accountType: doc.accountType,
      amount: doc.amount,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: doc.type as any,
      balanceState: doc.balanceState,
      stateTransition: doc.stateTransition,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reason: doc.reason as any,
      idempotencyKey: doc.idempotencyKey,
      requestId: doc.requestId,
      balanceBefore: doc.balanceBefore,
      balanceAfter: doc.balanceAfter,
      timestamp: doc.timestamp,
      currency: doc.currency,
      metadata: doc.metadata,
      escrowId: doc.escrowId,
      queueItemId: doc.queueItemId,
      featureType: doc.featureType,
      correlationId: doc.correlationId,
    };
  }
}

/**
 * Factory function to create ledger service instance
 */
export function createLedgerService(config?: Partial<LedgerConfig>): ILedgerService {
  return new LedgerService(config);
}
