/**
 * Wallet Controller
 *
 * REST API controller for wallet operations based on OpenAPI specification.
 * Provides endpoints for wallet queries and balance modifications (credit/deduct).
 *
 * NOTE: This is a placeholder implementation. For production use:
 * 1. Integrate with PointAccrualService for credit operations
 * 2. Integrate with PointRedemptionService for deduct operations
 * 3. Implement proper idempotency checking via ILedgerService
 * 4. Add proper error handling and HTTP status codes
 * 5. Add authorization and authentication middleware
 *
 * @see /api/openapi.yaml for API contract
 */

import { IWalletService } from '../services/types';
import { IIdempotencyService, IDEMPOTENCY_OPERATIONS } from '../services/idempotency.service';

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

  constructor(walletService: IWalletService, idempotencyService: IIdempotencyService) {
    this.walletService = walletService;
    this.idempotencyService = idempotencyService;
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
    // Validate idempotency key is present before any mutation
    if (!request.idempotencyKey?.trim()) {
      throw new BadRequestError('idempotencyKey is required');
    }

    // Validate amount
    if (request.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check idempotency BEFORE any wallet or ledger mutation
    const cached = await this.idempotencyService.checkKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_DEDUCT,
    );
    if (cached !== null) {
      return cached as unknown as TransactionResponse;
    }

    // Get current balance from wallet service
    const balance = await this.walletService.getUserBalance(userId);
    const previousBalance = balance.available;
    const newBalance = previousBalance - request.amount;

    const transaction = {
      id: this.generateTransactionId(),
      userId,
      amount: -request.amount, // Negative for debit
      type: 'debit' as const,
      reason: request.reason,
      timestamp: new Date().toISOString(),
      idempotencyKey: request.idempotencyKey,
      previousBalance,
      newBalance,
      requestId: request.requestId,
    };

    const wallet = await this.getWallet(userId);

    const result: TransactionResponse = {
      transaction,
      wallet,
    };

    // Record result so duplicate requests return the cached response
    await this.idempotencyService.recordKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_DEDUCT,
      result as unknown as Record<string, unknown>,
    );

    return result;
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
    // Validate idempotency key is present before any mutation
    if (!request.idempotencyKey?.trim()) {
      throw new BadRequestError('idempotencyKey is required');
    }

    // Validate amount
    if (request.amount <= 0) {
      throw new Error('Amount must be positive');
    }

    // Check idempotency BEFORE any wallet or ledger mutation
    const cached = await this.idempotencyService.checkKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_CREDIT,
    );
    if (cached !== null) {
      return cached as unknown as TransactionResponse;
    }

    // Get current balance from wallet service
    const balance = await this.walletService.getUserBalance(userId);
    const previousBalance = balance.available;
    const newBalance = previousBalance + request.amount;

    const transaction = {
      id: this.generateTransactionId(),
      userId,
      amount: request.amount, // Positive for credit
      type: 'credit' as const,
      reason: request.reason,
      timestamp: new Date().toISOString(),
      idempotencyKey: request.idempotencyKey,
      previousBalance,
      newBalance,
      requestId: request.requestId,
    };

    const wallet = await this.getWallet(userId);

    const result: TransactionResponse = {
      transaction,
      wallet,
    };

    // Record result so duplicate requests return the cached response
    await this.idempotencyService.recordKey(
      request.idempotencyKey,
      userId,
      IDEMPOTENCY_OPERATIONS.WALLET_CREDIT,
      result as unknown as Record<string, unknown>,
    );

    return result;
  }

  /**
   * Helper method to generate transaction ID
   * @private
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
}

/**
 * Factory function to create controller instance
 */
export function createWalletController(
  walletService: IWalletService,
  idempotencyService: IIdempotencyService,
): WalletController {
  return new WalletController(walletService, idempotencyService);
}
