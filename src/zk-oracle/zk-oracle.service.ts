/**
 * ZK Oracle Service (WO-011 research spike)
 *
 * Thin service wrapper around the balance-range circuit PoC.
 * Provides the stable interface that higher-level services
 * (BurnCatalogService, WalletController) will call in production.
 *
 * SPIKE: The underlying circuit is a simulation — see circuits/balance-range.ts.
 * Replace `proveBalanceRange` / `verifyBalanceRange` with snarkjs calls to
 * upgrade to a real ZK-SNARK (see WO-011-ZK-ORACLE-ARCHITECTURE.md §7).
 */

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { proveBalanceRange, verifyBalanceRange } from './circuits/balance-range';
import { ZkCircuitId, ZkProofAuditRecord, ZkRangeProof, ZkVerifyResult } from './zk-oracle.types';

@Injectable()
export class ZkOracleService {
  /** In-memory audit log (PoC only — use append-only DB collection in production) */
  private readonly auditLog: ZkProofAuditRecord[] = [];

  /**
   * Generate a ZK range proof that the caller's balance satisfies `threshold`.
   *
   * The private balance is consumed here and NEVER stored or logged.
   * The audit record contains only the public commitment and threshold.
   *
   * @param privateBalance  Actual point balance (private — not included in proof)
   * @param threshold       Minimum balance the proof will assert
   * @param correlationId   Optional ledger correlation_id to link to a transaction
   * @returns               ZkRangeProof — safe to send to external partners
   * @throws                If balance < threshold (constraint violation)
   */
  generateBalanceProof(
    privateBalance: number,
    threshold: number,
    correlationId?: string,
  ): ZkRangeProof {
    if (threshold < 0) {
      throw new Error('Threshold must be non-negative');
    }

    const proofId = randomUUID();
    const rangeProof = proveBalanceRange(privateBalance, threshold, proofId);

    // Write audit record — public data only
    const audit: ZkProofAuditRecord = {
      proofId,
      circuitId: ZkCircuitId.BALANCE_RANGE,
      threshold,
      commitment: rangeProof.commitment.value,
      generatedAt: rangeProof.generatedAt,
      ...(correlationId ? { correlationId } : {}),
    };
    this.auditLog.push(audit);

    return rangeProof;
  }

  /**
   * Verify a ZK range proof.
   *
   * Safe to call with untrusted input — returns ZkVerifyResult with
   * `valid: false` and an `error` description if verification fails.
   *
   * @param rangeProof  The proof received from a prover (or from generateBalanceProof)
   * @returns           ZkVerifyResult — always resolves, never throws
   */
  verifyBalanceProof(rangeProof: ZkRangeProof): ZkVerifyResult {
    try {
      return verifyBalanceRange(rangeProof);
    } catch (err) {
      return {
        valid: false,
        circuitId: rangeProof.circuitId,
        claimedThreshold: rangeProof.threshold,
        verifiedAt: new Date(),
        error: err instanceof Error ? err.message : 'Unexpected verification error',
      };
    }
  }

  /**
   * Return the audit log entries for a given proofId (or all entries).
   *
   * PoC only — replace with DB query in production.
   */
  getAuditRecords(proofId?: string): ZkProofAuditRecord[] {
    if (proofId) {
      return this.auditLog.filter((r) => r.proofId === proofId);
    }
    return [...this.auditLog];
  }
}
