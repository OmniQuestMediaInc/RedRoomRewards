/**
 * Service Error Type Definitions
 *
 * Domain error classes for the wallet and queue service layer.
 */

/**
 * Base service error class
 */
export class WalletServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'WalletServiceError';
  }
}

export class InsufficientBalanceError extends WalletServiceError {
  constructor(required: number, available: number) {
    super(
      `Insufficient balance. Required: ${required}, Available: ${available}`,
      'INSUFFICIENT_BALANCE',
      402,
      { required, available },
    );
    this.name = 'InsufficientBalanceError';
  }
}

export class EscrowNotFoundError extends WalletServiceError {
  constructor(escrowId: string) {
    super(`Escrow not found: ${escrowId}`, 'ESCROW_NOT_FOUND', 404, { escrowId });
    this.name = 'EscrowNotFoundError';
  }
}

export class EscrowAlreadyProcessedError extends WalletServiceError {
  constructor(escrowId: string, status: string) {
    super(
      `Escrow already processed: ${escrowId} (status: ${status})`,
      'ESCROW_ALREADY_PROCESSED',
      409,
      { escrowId, status },
    );
    this.name = 'EscrowAlreadyProcessedError';
  }
}

export class InvalidAuthorizationError extends WalletServiceError {
  constructor(message: string) {
    super(`Invalid authorization: ${message}`, 'INVALID_AUTHORIZATION', 403);
    this.name = 'InvalidAuthorizationError';
  }
}

export class OptimisticLockError extends WalletServiceError {
  constructor(resourceType: string, resourceId: string) {
    super(
      `Optimistic lock conflict on ${resourceType}: ${resourceId}`,
      'OPTIMISTIC_LOCK_CONFLICT',
      409,
      { resourceType, resourceId },
    );
    this.name = 'OptimisticLockError';
  }
}

export class IdempotencyConflictError extends WalletServiceError {
  constructor(key: string, existingResult: unknown) {
    super(`Request with idempotency key already processed: ${key}`, 'IDEMPOTENCY_CONFLICT', 200, {
      key,
      existingResult,
    });
    this.name = 'IdempotencyConflictError';
  }
}
