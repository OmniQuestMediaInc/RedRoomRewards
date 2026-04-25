/**
 * Wallet Controller
 *
 * REST API controller for wallet operations based on OpenAPI specification.
 * Provides endpoints for wallet queries and balance modifications (credit/deduct).
 *
 * Wires the credit endpoint to `PointAccrualService.awardPoints` (B-001)
 * and the deduct endpoint to `PointAccrualService.deductFromAvailable`
 * (B-002 — sibling debit method that mirrors the awardPoints atomic
 * pattern; escrow-flow redemptions use `PointRedemptionService` and a
 * different endpoint surface). Idempotency wrapper stays in place.
 *
 * @see /api/openapi.yaml for API contract
 */

import { IWalletService } from '../services/types';
import { IIdempotencyService, IDEMPOTENCY_OPERATIONS } from '../services/idempotency.service';
import { PointAccrualService } from '../services/point-accrual.service';
import { TransactionReason } from '../wallets/types';

/**
 * Error thrown when a required field is missing or invalid in the request.
 * Maps to HTTP 400 Bad Request.
 */
export class BadRequestError extends Error {
  public statusCode = 400;
  constructor(message: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

/**
 * Response interface for GET /wallets/:userId
 */
export interface WalletResponse {
  userId: string;
  availableBalance: number;
  escrowBalance: number;
  totalBalance: number;
  currency: string;
  version: number;
  createdAt: string;
  lastUpdated: string;
}

/**
 * Request interface for POST /wallets/:userId/deduct
 */
export interface DeductPointsRequest {
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
  requestId: string;
}

/**
 * Request interface for POST /wallets/:userId/credit
 */
export interface CreditPointsRequest {
  amount: number;
  reason: string;
  metadata?: Record<string, unknown>;
  idempotencyKey: string;
  requestId: string;
}

/**
 * Response interface for credit/deduct operations
 */
export interface TransactionResponse {
  transaction: {
    id: string;
    userId: string;
    amount: number;
    type: 'credit' | 'debit';
    reason: string;
    timestamp: string;
    idempotencyKey: string;
    previousBalance: number;
    newBalance: number;
    requestId: string;
  };
  wallet: WalletResponse;
}

/**
 * Wallet Controller Class
 * Handles HTTP requests for wallet operations
 */
export class WalletController {
  private walletService: IWalletService;
  private idempotencyService: IIdempotencyService;
  private pointAccrualService: PointAccrualService;

  constructor(
    walletService: IWalletService,
    idempotencyService: IIdempotencyService,
    pointAccrualService: PointAccrualService,
  ) {
    this.walletService = walletService;
    this.idempotencyService = idempotencyService;
    this.pointAccrualService = pointAccrualService;
  }

  /**
   * GET /wallets/:userId
   * Fetch detailed wallet information for the user
   *
   * @param userId - User identifier
   * @returns Promise<WalletResponse>
   */
  async getWallet(userId: string): Promise<WalletResponse> {
    // Get user balance from wallet service
    const balance = await this.walletService.getUserBalance(userId);

    // In a full implementation, we'd fetch the complete wallet object
    // For now, return a structured response based on balance
    return {
      userId,
      availableBalance: balance.available,
      escrowBalance: balance.escrow,
      totalBalance: balance.total,
      currency: 'points',
      version: 0,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * POST /wallets/:userId/deduct
   * Deduct points for a specified user
   *
   * IMPORTANT: This is a placeholder implementation without proper service integration.
   * For production:
   * - Use PointRedemptionService for actual deductions
   * - Check idempotency before processing
   * - Validate authorization tokens
   * - Return cached results for duplicate requests
   *
   * @param userId - User identifier
   * @param request - Deduct request parameters
   * @returns Promise<TransactionResponse>
   */
  async deductPoints(userId: string, request: DeductPointsRequest): Promise<TransactionResponse> {
    if (!request.idempotencyKey?.trim()) {
      throw new BadRequestError('idempotencyKey is required');
    }
    if (request.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const cached = await this.idempotencyService.checkKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_DEDUCT,
    );
    if (cached !== null) {
      return cached as unknown as TransactionResponse;
    }

    const previousBalance = (await this.walletService.getUserBalance(userId)).available;

    // B-002: hand off to PointAccrualService.deductFromAvailable —
    // optimistic-locked WalletModel decrement + immutable LedgerEntry.
    // Replaces the prior fabricated-response stub.
    const reason = this.coerceDebitReason(request.reason);
    const award = await this.pointAccrualService.deductFromAvailable({
      userId,
      amount: request.amount,
      reason,
      idempotencyKey: request.idempotencyKey,
      requestId: request.requestId,
      metadata: request.metadata,
    });

    const transaction = {
      id: award.transactionId,
      userId,
      amount: -request.amount,
      type: 'debit' as const,
      reason: request.reason,
      timestamp: award.timestamp.toISOString(),
      idempotencyKey: request.idempotencyKey,
      previousBalance,
      newBalance: award.newBalance,
      requestId: request.requestId,
    };

    const wallet = await this.getWallet(userId);
    const result: TransactionResponse = { transaction, wallet };

    await this.idempotencyService.recordKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_DEDUCT,
      result as unknown as Record<string, unknown>,
    );

    return result;
  }

  /**
   * Map the request `reason` string to the typed `TransactionReason`
   * accepted by `PointAccrualService.deductFromAvailable`. Defaults to
   * ADMIN_DEBIT — the most conservative debit reason for the
   * `/wallets/:userId/deduct` endpoint surface.
   */
  private coerceDebitReason(reason: string): TransactionReason {
    if (reason === TransactionReason.POINT_EXPIRY) return TransactionReason.POINT_EXPIRY;
    return TransactionReason.ADMIN_DEBIT;
  }

  /**
   * Map the request `reason` string to the typed `TransactionReason`
   * accepted by `PointAccrualService.awardPoints`. Defaults to
   * ADMIN_CREDIT for unrecognized values.
   */
  private coerceCreditReason(reason: string): TransactionReason {
    if (reason === TransactionReason.USER_SIGNUP_BONUS) return TransactionReason.USER_SIGNUP_BONUS;
    if (reason === TransactionReason.REFERRAL_BONUS) return TransactionReason.REFERRAL_BONUS;
    if (reason === TransactionReason.PROMOTIONAL_AWARD) return TransactionReason.PROMOTIONAL_AWARD;
    return TransactionReason.ADMIN_CREDIT;
  }

  /**
   * POST /wallets/:userId/credit
   * Credit points to a specified user
   *
   * IMPORTANT: This is a placeholder implementation without proper service integration.
   * For production:
   * - Use PointAccrualService for actual credits
   * - Check idempotency before processing
   * - Validate authorization tokens
   * - Return cached results for duplicate requests
   *
   * @param userId - User identifier
   * @param request - Credit request parameters
   * @returns Promise<TransactionResponse>
   */
  async creditPoints(userId: string, request: CreditPointsRequest): Promise<TransactionResponse> {
    if (!request.idempotencyKey?.trim()) {
      throw new BadRequestError('idempotencyKey is required');
    }
    if (request.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    const cached = await this.idempotencyService.checkKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_CREDIT,
    );
    if (cached !== null) {
      return cached as unknown as TransactionResponse;
    }

    const previousBalance = (await this.walletService.getUserBalance(userId)).available;

    // B-001: hand off to PointAccrualService.awardPoints — atomic
    // optimistic-locked WalletModel increment + immutable LedgerEntry.
    // Replaces the prior fabricated-response stub.
    const reason = this.coerceCreditReason(request.reason);
    const award = await this.pointAccrualService.awardPoints({
      userId,
      amount: request.amount,
      reason,
      idempotencyKey: request.idempotencyKey,
      requestId: request.requestId,
      metadata: request.metadata,
    });

    const transaction = {
      id: award.transactionId,
      userId,
      amount: request.amount,
      type: 'credit' as const,
      reason: request.reason,
      timestamp: award.timestamp.toISOString(),
      idempotencyKey: request.idempotencyKey,
      previousBalance,
      newBalance: award.newBalance,
      requestId: request.requestId,
    };

    const wallet = await this.getWallet(userId);
    const result: TransactionResponse = { transaction, wallet };

    await this.idempotencyService.recordKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_CREDIT,
      result as unknown as Record<string, unknown>,
    );

    return result;
  }
}

/**
 * Factory function to create controller instance
 */
export function createWalletController(
  walletService: IWalletService,
  idempotencyService: IIdempotencyService,
  pointAccrualService: PointAccrualService,
): WalletController {
  return new WalletController(walletService, idempotencyService, pointAccrualService);
}
