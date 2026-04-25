/**
 * Queue Integration Type Definitions
 *
 * Types for performance queue items, intake requests, and
 * settlement/refund authorizations.
 */

import { TransactionReason } from '../../wallets/types';
import {
  EscrowSettleResponse,
  EscrowRefundResponse,
  EscrowPartialSettleResponse,
} from '../../wallets/types';

/**
 * Performance queue item status
 */
export enum QueueItemStatus {
  /** Item queued, awaiting performance */
  QUEUED = 'queued',

  /** Performance in progress */
  IN_PROGRESS = 'in_progress',

  /** Performance completed successfully */
  FINISHED = 'finished',

  /** Performance abandoned or cancelled */
  ABANDONED = 'abandoned',

  /** Partial performance delivered */
  PARTIAL = 'partial',
}

/**
 * Performance queue item
 */
export interface QueueItem {
  /** Queue item identifier */
  queueItemId: string;

  /** User who requested performance */
  userId: string;

  /** Model who will perform */
  modelId: string;

  /** Associated escrow ID */
  escrowId: string;

  /** Amount held in escrow */
  amount: number;

  /** Feature type that created this item */
  featureType: string;

  /** Current status */
  status: QueueItemStatus;

  /** Queue priority (higher = sooner) */
  priority: number;

  /** Item created timestamp */
  createdAt: Date;

  /** Performance started timestamp */
  startedAt?: Date;

  /** Performance completed timestamp */
  completedAt?: Date;

  /** Reason for current status */
  statusReason?: TransactionReason;

  /** Additional context */
  metadata?: Record<string, unknown>;
}

/**
 * Request to add item to performance queue
 */
export interface QueueIntakeRequest {
  /** User requesting performance */
  userId: string;

  /** Model to perform */
  modelId: string;

  /** Escrow ID holding funds */
  escrowId: string;

  /** Amount in escrow */
  amount: number;

  /** Feature initiating request */
  featureType: string;

  /** Priority level */
  priority?: number;

  /** Additional metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Queue settlement authorization
 * Only the queue can issue these to wallet service
 */
export interface QueueSettlementAuthorization {
  /** Queue item ID */
  queueItemId: string;

  /** Authorization token (signed JWT) */
  token: string;

  /** Escrow ID to settle */
  escrowId: string;

  /** Model to credit */
  modelId: string;

  /** Amount to settle */
  amount: number;

  /** Reason for settlement */
  reason: TransactionReason;

  /** Token issued at */
  issuedAt: Date;

  /** Token expires at */
  expiresAt: Date;
}

/**
 * Queue refund authorization
 * Only the queue can issue these to wallet service
 */
export interface QueueRefundAuthorization {
  /** Queue item ID */
  queueItemId: string;

  /** Authorization token (signed JWT) */
  token: string;

  /** Escrow ID to refund */
  escrowId: string;

  /** User to refund */
  userId: string;

  /** Amount to refund */
  amount: number;

  /** Reason for refund */
  reason: TransactionReason;

  /** Token issued at */
  issuedAt: Date;

  /** Token expires at */
  expiresAt: Date;
}

/**
 * Queue partial settlement authorization
 */
export interface QueuePartialSettlementAuthorization {
  /** Queue item ID */
  queueItemId: string;

  /** Authorization token (signed JWT) */
  token: string;

  /** Escrow ID to process */
  escrowId: string;

  /** User to refund partial */
  userId: string;

  /** Model to settle partial */
  modelId: string;

  /** Refund amount */
  refundAmount: number;

  /** Settle amount */
  settleAmount: number;

  /** Reason for partial settlement */
  reason: TransactionReason;

  /** Token issued at */
  issuedAt: Date;

  /** Token expires at */
  expiresAt: Date;
}

/**
 * Queue service interface
 * Sole authority for settlement/refund decisions
 */
export interface IQueueService {
  /**
   * Add item to performance queue
   * Called by features after escrow hold
   */
  enqueue(request: QueueIntakeRequest): Promise<QueueItem>;

  /**
   * Mark performance as started
   */
  startPerformance(queueItemId: string): Promise<QueueItem>;

  /**
   * Mark performance as finished and settle
   */
  finishPerformance(
    queueItemId: string,
    modelId: string,
  ): Promise<{
    queueItem: QueueItem;
    settlement: EscrowSettleResponse;
  }>;

  /**
   * Abandon performance and refund
   */
  abandonPerformance(
    queueItemId: string,
    reason: TransactionReason,
  ): Promise<{
    queueItem: QueueItem;
    refund: EscrowRefundResponse;
  }>;

  /**
   * Partial completion with split settlement/refund
   */
  partialCompletion(
    queueItemId: string,
    refundAmount: number,
    settleAmount: number,
    reason: TransactionReason,
  ): Promise<{
    queueItem: QueueItem;
    partialSettle: EscrowPartialSettleResponse;
  }>;

  /**
   * Get queue item status
   */
  getQueueItem(queueItemId: string): Promise<QueueItem | null>;

  /**
   * Get user's queued items
   */
  getUserQueueItems(userId: string): Promise<QueueItem[]>;

  /**
   * Get model's queued items
   */
  getModelQueueItems(modelId: string): Promise<QueueItem[]>;
}
