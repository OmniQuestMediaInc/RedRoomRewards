/**
 * Service Interface Type Definitions
 *
 * Interfaces for wallet service, feature modules, and messaging service.
 */

import {
  EscrowHoldRequest,
  EscrowHoldResponse,
  EscrowSettleRequest,
  EscrowSettleResponse,
  EscrowRefundRequest,
  EscrowRefundResponse,
  EscrowPartialSettleRequest,
  EscrowPartialSettleResponse,
  QueueIntakeEvent,
  FinancialEvent,
} from '../../wallets/types';
import {
  QueueSettlementAuthorization,
  QueueRefundAuthorization,
  QueuePartialSettlementAuthorization,
} from './queue.types';

/**
 * Wallet service interface
 * Executes atomic ledger changes without business logic
 */
export interface IWalletService {
  /**
   * Hold funds in escrow (deduct from available)
   */
  holdInEscrow(request: EscrowHoldRequest): Promise<EscrowHoldResponse>;

  /**
   * Settle escrow to model earnings
   * Requires queue authorization
   */
  settleEscrow(
    request: EscrowSettleRequest,
    authorization: QueueSettlementAuthorization,
  ): Promise<EscrowSettleResponse>;

  /**
   * Refund escrow to user available
   * Requires queue authorization
   */
  refundEscrow(
    request: EscrowRefundRequest,
    authorization: QueueRefundAuthorization,
  ): Promise<EscrowRefundResponse>;

  /**
   * Partial refund and settlement
   * Requires queue authorization
   */
  partialSettleEscrow(
    request: EscrowPartialSettleRequest,
    authorization: QueuePartialSettlementAuthorization,
  ): Promise<EscrowPartialSettleResponse>;

  /**
   * Get user wallet balance (all states)
   */
  getUserBalance(userId: string): Promise<{
    available: number;
    escrow: number;
    total: number;
  }>;

  /**
   * Get model wallet balance
   */
  getModelBalance(modelId: string): Promise<{
    earned: number;
  }>;
}

/**
 * Base interface for feature action data
 */
export interface FeatureActionData {
  /** Amount involved in the action */
  amount: number;

  /** User initiating the action */
  userId: string;

  /** Model involved in the action (if applicable) */
  modelId?: string;

  /** Additional feature-specific data */
  [key: string]: unknown;
}

/**
 * Feature module interface
 * Modules request escrow and emit queue events, never settle directly
 */
export interface IFeatureModule {
  /** Feature identifier */
  featureType: string;

  /**
   * Process user action
   * Should: check balance, request escrow, emit queue event
   * Should NOT: settle or refund
   */
  processAction(
    userId: string,
    actionData: FeatureActionData,
  ): Promise<{
    escrowHold: EscrowHoldResponse;
    queueIntake: QueueIntakeEvent;
  }>;

  /**
   * Validate action parameters
   */
  validateAction(actionData: FeatureActionData): Promise<boolean>;
}

/**
 * Messaging service interface
 * Consumes financial events and sends notifications
 */
export interface IMessagingService {
  /**
   * Send financial event notification
   */
  sendFinancialNotification(event: FinancialEvent): Promise<void>;

  /**
   * Format message from template
   */
  formatMessage(templateId: string, variables: Record<string, unknown>): Promise<string>;
}

/**
 * Service health check
 */
export interface ServiceHealth {
  /** Service name */
  service: string;

  /** Health status */
  status: 'healthy' | 'degraded' | 'unhealthy';

  /** Status message */
  message?: string;

  /** Last check timestamp */
  checkedAt: Date;

  /** Additional metrics */
  metrics?: Record<string, unknown>;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  /** Wallet service config */
  wallet: {
    enableIdempotency: boolean;
    idempotencyTtlSeconds: number;
    maxRetryAttempts: number;
    retryBackoffMs: number;
  };

  /** Queue service config */
  queue: {
    defaultPriority: number;
    maxQueueSize: number;
    itemTimeoutSeconds: number;
  };

  /** Authorization config */
  authorization: {
    tokenSecret: string;
    tokenExpirySeconds: number;
    algorithm: 'HS256' | 'HS384' | 'HS512';
  };
}
