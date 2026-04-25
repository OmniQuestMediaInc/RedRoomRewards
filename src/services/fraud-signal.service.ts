/**
 * FraudSignalService (C-009 / C-012)
 *
 * Detects suspicious patterns in loyalty events and emits a "fraud.signal"
 * webhook when any patterns are found.
 *
 * Three detection patterns (stubs — production logic wired in C-012 follow-up):
 *   - VELOCITY        : Abnormally high earn rate within a short window.
 *   - IMMEDIATE_REDEMPTION : Redemption immediately after a large earn.
 *   - IDEMPOTENCY_REUSE   : Reuse of an idempotency key across distinct ops.
 *
 * Webhook emission is decoupled via WebhookEmitService so fraud signals can
 * be delivered to external monitoring without tight coupling to the ledger.
 */

import { Injectable } from '@nestjs/common';
import { WebhookEmitService } from '../webhooks/webhook-emit.service';

/** Supported fraud-pattern identifiers. */
export type FraudPatternType = 'VELOCITY' | 'IMMEDIATE_REDEMPTION' | 'IDEMPOTENCY_REUSE';

/** A detected fraud pattern with its type and a human-readable description. */
export interface FraudPattern {
  type: FraudPatternType;
  description: string;
}

/** Minimum required shape for a loyalty event passed to detectFraud. */
export interface FraudCheckEvent {
  userId: string;
  idempotencyKey?: string;
  eventType?: string;
  amount?: number;
  timestamp?: Date;
  [key: string]: unknown;
}

@Injectable()
export class FraudSignalService {
  constructor(private readonly webhookEmit: WebhookEmitService) {}

  /**
   * Inspect a loyalty event for known fraud patterns.
   *
   * Emits a "fraud.signal" webhook when one or more patterns are detected.
   * Returns the list of detected patterns (empty array = no fraud signals).
   *
   * @param event - Loyalty event to inspect.
   * @returns Detected fraud patterns (may be empty).
   */
  async detectFraud(event: FraudCheckEvent): Promise<FraudPattern[]> {
    const patterns = this.checkPatterns(event);

    if (patterns.length > 0) {
      await this.webhookEmit.emit('fraud.signal', {
        patterns,
        userId: event.userId,
        evidence: event as Record<string, unknown>,
        detectedAt: new Date().toISOString(),
      });
    }

    return patterns;
  }

  // ─── private ─────────────────────────────────────────────────────────────

  /**
   * Run all three fraud-pattern checks against the event.
   *
   * Checks are intentionally stubbed here — production implementations will
   * query the ledger for velocity windows, redemption timing, and
   * idempotency-key history.
   */
  private checkPatterns(event: FraudCheckEvent): FraudPattern[] {
    const patterns: FraudPattern[] = [];

    if (this.isVelocityAnomaly(event)) {
      patterns.push({
        type: 'VELOCITY',
        description: 'Abnormally high point-earn rate detected within window',
      });
    }

    if (this.isImmediateRedemption(event)) {
      patterns.push({
        type: 'IMMEDIATE_REDEMPTION',
        description: 'Redemption detected immediately after a large earn event',
      });
    }

    if (this.isIdempotencyReuse(event)) {
      patterns.push({
        type: 'IDEMPOTENCY_REUSE',
        description: 'Idempotency key reused across distinct operation types',
      });
    }

    return patterns;
  }

  /** Velocity anomaly stub — always returns false until C-012 wiring lands. */
  private isVelocityAnomaly(_event: FraudCheckEvent): boolean {
    // TODO (C-012): query ledger for earn events within the last 5 minutes;
    // flag when total exceeds the per-tenant velocity ceiling.
    return false;
  }

  /** Immediate-redemption stub — always returns false until C-012 wiring lands. */
  private isImmediateRedemption(_event: FraudCheckEvent): boolean {
    // TODO (C-012): query ledger for earn→redeem sequences within 60 seconds.
    return false;
  }

  /** Idempotency-reuse stub — always returns false until C-012 wiring lands. */
  private isIdempotencyReuse(_event: FraudCheckEvent): boolean {
    // TODO (C-012): check IdempotencyService history for key collisions.
    return false;
  }
}
