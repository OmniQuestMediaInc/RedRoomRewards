/**
 * Reconciliation Service (B-011)
 *
 * Verifies that a user's ledger is internally consistent:
 *   Wallet.balance == sum(LedgerEntry.delta) == calculatedBalance
 *
 * When a mismatch is detected:
 *   - Emits a RECON_MISMATCH log entry for alerting.
 *   - NEVER auto-corrects balances (append-only ledger invariant).
 *
 * Human remediation is required for any mismatch surfaced here.
 */

import { LedgerService } from '../ledger/ledger.service';
import { ReconciliationReport } from '../ledger/types';

/** Result shape returned by reconcileUser / reconcileModel. */
export interface ReconciliationResult {
  /** True only when ledger sum matches the recorded running balance. */
  balanced: boolean;
  /** Full reconciliation report produced by the LedgerService. */
  details: ReconciliationReport;
}

/**
 * ReconciliationService
 *
 * Thin orchestration layer over LedgerService.generateReconciliationReport.
 * Uses Unix epoch as the range start so the full transaction history is
 * always evaluated, and `new Date()` as the range end.
 */
export class ReconciliationService {
  constructor(private readonly ledger: LedgerService) {}

  /**
   * Reconcile all ledger entries for a user account (accountType = 'user').
   *
   * @param userId - The user account ID to reconcile.
   * @returns ReconciliationResult — `balanced` is false when a discrepancy
   *   is found. The caller is responsible for raising an alert;
   *   this service never auto-corrects balances.
   */
  async reconcileUser(userId: string): Promise<ReconciliationResult> {
    return this.reconcileAccount(userId, 'user');
  }

  /**
   * Reconcile all ledger entries for a model account (accountType = 'model').
   *
   * @param modelId - The model account ID to reconcile.
   * @returns ReconciliationResult
   */
  async reconcileModel(modelId: string): Promise<ReconciliationResult> {
    return this.reconcileAccount(modelId, 'model');
  }

  // ─── private ─────────────────────────────────────────────────────────────

  private async reconcileAccount(
    accountId: string,
    accountType: 'user' | 'model',
  ): Promise<ReconciliationResult> {
    const now = new Date();
    const epoch = new Date(0); // full history

    const report = await this.ledger.generateReconciliationReport(accountId, accountType, {
      start: epoch,
      end: now,
    });

    if (!report.reconciled) {
      // RECON_MISMATCH — never auto-correct; surface for human review.
      console.error(
        `[RECON_MISMATCH] accountId=${accountId} accountType=${accountType} ` +
          `difference=${report.difference} ` +
          `calculatedBalance=${report.calculatedBalance} ` +
          `actualBalance=${report.actualBalance} ` +
          `reportedAt=${report.reportedAt.toISOString()}`,
      );
    }

    return {
      balanced: report.reconciled,
      details: report,
    };
  }
}
