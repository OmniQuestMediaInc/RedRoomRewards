/**
 * Wallet Escrow Operation Type Definitions
 *
 * Request and response interfaces for all escrow operations
 * and balance query responses.
 */

import { TransactionReason } from './domain.types';
import { EscrowItem } from './domain.types';

/**
 * Request to hold funds in escrow
 */
export interface EscrowHoldRequest {
  /** User identifier */
  userId: string;

  /** Amount to hold */
  amount: number;

  /** Reason for holding */
  reason: TransactionReason;

  /** Performance queue item ID */
  queueItemId: string;

  /** Feature initiating the hold */
  featureType: string;

  /** Idempotency key */
  idempotencyKey: string;

  /** Request ID for tracing */
  requestId: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Response from escrow hold operation
 */
export interface EscrowHoldResponse {
  /** Created transaction ID */
  transactionId: string;

  /** Created escrow ID */
  escrowId: string;

  /** User's previous available balance */
  previousBalance: number;

  /** User's new available balance */
  newAvailableBalance: number;

  /** Amount now in escrow */
  escrowBalance: number;

  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Request to settle escrow to model earnings
 */
export interface EscrowSettleRequest {
  /** Escrow ID to settle */
  escrowId: string;

  /** Model to credit */
  modelId: string;

  /** Amount to settle (must match escrow amount) */
  amount: number;

  /** Queue item ID */
  queueItemId: string;

  /** Reason for settlement */
  reason: TransactionReason;

  /** Queue authorization token */
  authorizationToken: string;

  /** Idempotency key */
  idempotencyKey: string;

  /** Request ID for tracing */
  requestId: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Response from escrow settlement
 */
export interface EscrowSettleResponse {
  /** Transaction ID for settlement */
  transactionId: string;

  /** Amount settled */
  settledAmount: number;

  /** Model's new earned balance */
  modelEarnedBalance: number;

  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Request to refund escrow to user
 */
export interface EscrowRefundRequest {
  /** Escrow ID to refund */
  escrowId: string;

  /** User to refund */
  userId: string;

  /** Amount to refund (must match escrow amount) */
  amount: number;

  /** Queue item ID */
  queueItemId: string;

  /** Reason for refund */
  reason: TransactionReason;

  /** Queue authorization token */
  authorizationToken: string;

  /** Idempotency key */
  idempotencyKey: string;

  /** Request ID for tracing */
  requestId: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Response from escrow refund
 */
export interface EscrowRefundResponse {
  /** Transaction ID for refund */
  transactionId: string;

  /** Amount refunded */
  refundedAmount: number;

  /** User's new available balance */
  userAvailableBalance: number;

  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Request for partial refund/settlement
 */
export interface EscrowPartialSettleRequest {
  /** Escrow ID to process */
  escrowId: string;

  /** User to refund partial amount */
  userId: string;

  /** Model to settle remaining amount */
  modelId: string;

  /** Amount to refund to user */
  refundAmount: number;

  /** Amount to settle to model */
  settleAmount: number;

  /** Queue item ID */
  queueItemId: string;

  /** Reason for partial settlement */
  reason: TransactionReason;

  /** Queue authorization token */
  authorizationToken: string;

  /** Idempotency key */
  idempotencyKey: string;

  /** Request ID for tracing */
  requestId: string;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Response from partial settlement
 */
export interface EscrowPartialSettleResponse {
  /** Transaction ID */
  transactionId: string;

  /** Amount refunded to user */
  refundedAmount: number;

  /** Amount settled to model */
  settledAmount: number;

  /** User's new available balance */
  userAvailableBalance: number;

  /** Model's new earned balance */
  modelEarnedBalance: number;

  /** Operation timestamp */
  timestamp: Date;
}

/**
 * Balance query response showing all states
 */
export interface BalanceResponse {
  /** User identifier */
  userId: string;

  /** Available balance */
  available: number;

  /** Escrow balance */
  escrow: number;

  /** Total balance (available + escrow) */
  total: number;

  /** Balance as of timestamp */
  asOf: Date;
}

/**
 * Escrow details query response
 */
export interface EscrowDetailsResponse {
  /** User identifier */
  userId: string;

  /** List of escrow items */
  escrowItems: EscrowItem[];

  /** Total amount in escrow */
  totalEscrow: number;
}
